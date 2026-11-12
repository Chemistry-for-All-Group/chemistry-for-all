import TitrationExperiment from "./TitrationExperiment.js";
import MultiFillableObject from "./MultiFillableObject.js";
import SodiumChloride from "./liquids/SodiumChloride.js";
import MarchSample from "./liquids/MarchSample.js";
import AprilSample from "./liquids/AprilSample.js";
import SilverNitrate from "./liquids/SilverNitrate.js";
import Water from "./liquids/Water.js";
import { TitrationReport, SAMPLES, TITRATIONS, DILUTION_CHOICES } from "./TitrationReport.js";
import { announce, PageBuilder } from "../pageBuilder.js";

/**
 * Choices for how much silver nitrate one turn of the buret's stopcock
 * releases, in mL. A drop is about 0.05 mL. Each turn still varies slightly
 * around the chosen amount (see Buret.releaseLiquid).
 */
export const BURET_INCREMENTS = [0.05, 0.1, 0.2, 0.5, 1, 2];

/** Amounts of silver nitrate to measure out in the 25 mL cylinder, in mL. */
export const SILVER_NITRATE_AMOUNTS = [15, 10];

/** Amount of sodium chloride standard to measure out in the 10 mL cylinder, in mL. */
export const SODIUM_CHLORIDE_AMOUNT = 5;

/** Amount the serological pipet draws up, and roughly the amount used to rinse it, in mL. */
export const PIPET_VOLUME = 1;
export const RINSE_VOLUME = 1;

/** Marks a beaker can be filled to with distilled water, in mL. */
export const BEAKER_MARKS = [10, 20];

/** Below this many mL in a beaker, the electrodes are not covered and give no reading. */
export const MIN_LEVEL_FOR_READING = 8;

// Distilled water used to rinse a beaker, flask or the electrodes into the waste beaker, in mL.
const RINSE_WATER = 5;

// Spoken names for each liquid.
const LIQUID_NAMES = new Map([
  [SodiumChloride, 'sodium chloride standard'],
  [MarchSample, 'March bay water'],
  [AprilSample, 'April bay water'],
  [SilverNitrate, 'silver nitrate'],
  [Water, 'distilled water'],
]);

const CHLORIDE_SAMPLES = [SodiumChloride, MarchSample, AprilSample];

const EMPTY = 0.005;

function milliliters(amount) {
  return `${amount} ${amount === 1 ? 'milliliter' : 'milliliters'}`;
}

/** Lists names as "a", "a and b", or "a, b and c". */
function listNames(names) {
  return names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * The titration experiment: finding the salinity of bay water samples by
 * titrating their chloride with silver nitrate, measuring the voltage
 * between two electrodes instead of watching for a colour change.
 *
 * Keeps track of where each piece of equipment is and uses the backend
 * classes to do each action. Action methods return a sentence describing
 * what happened, which gets shown and read out to the student.
 */
export class TitrationLab {
  equipment = new TitrationExperiment();

  // Stock bottles on the bench.
  stock = {
    sodiumChloride: this.stockBottle(SodiumChloride),
    march: this.stockBottle(MarchSample),
    april: this.stockBottle(AprilSample),
    silverNitrate: this.stockBottle(SilverNitrate),
  };

  // Containers the pipet can draw from, by id: what is in them and where it is.
  pipetSources = {
    sodiumChloride: { liquid: 'sodium chloride standard', place: 'the 10 milliliter cylinder', container: this.equipment.cylinder10Ml },
    march: { liquid: 'March bay water', place: 'its sample bottle', container: this.stock.march },
    april: { liquid: 'April bay water', place: 'its sample bottle', container: this.stock.april },
    flask: { liquid: 'diluted sample', place: 'the volumetric flask', container: this.equipment.volumetricFlask },
  };

  // Beakers and the flask, by id, for actions that move liquid or equipment into one.
  containers = {
    beaker1: { name: 'Beaker 1', container: this.equipment.beaker1 },
    beaker2: { name: 'Beaker 2', container: this.equipment.beaker2 },
    beaker3: { name: 'Beaker 3', container: this.equipment.beaker3 },
    flask: { name: 'the volumetric flask', container: this.equipment.volumetricFlask },
    waste: { name: 'the waste beaker', container: this.equipment.wasteBeaker },
  };

  // Target amount of silver nitrate (mL) released per turn of the stopcock.
  buretIncrement = 0.5;
  // Choices in each action's dropdown.
  silverNitrateAmount = 15;
  pipetRinseSource = 'sodiumChloride';
  pipetSource = 'sodiumChloride';
  pipetTarget = 'beaker1';
  electrodeTarget = 'beaker1';
  beakerMarks = { beaker1: 10, beaker2: 20, beaker3: 20 };
  // What the pipet was last rinsed with (a pipetSources id), for the station's state.
  pipetRinsedWith = null;

  report = new TitrationReport();
  // Where each "Record as" dropdown records to: a report field id for the
  // sample volume, a titration key for buret and voltmeter readings.
  recordTargets = { sampleVolume: null, titration: TITRATIONS[0].key };
  // The last reading taken, as the text that was shown. A titration reading
  // is a buret reading and a voltage taken together.
  lastReadings = { sampleVolume: null, titration: null };

  stockBottle(liquid) {
    const bottle = new MultiFillableObject(1000);
    bottle.fillCompletely(liquid);
    return bottle;
  }

  get buret() { return this.equipment.buret; }
  get pipet() { return this.equipment.serologicalPipet; }
  get flask() { return this.equipment.volumetricFlask; }
  get waste() { return this.equipment.wasteBeaker; }
  get silverNitrateCylinder() { return this.equipment.cylinder25Ml; }
  get sodiumChlorideCylinder() { return this.equipment.cylinder10Ml; }

  isEmpty(container) {
    return container.getCurrentLevel() < EMPTY;
  }

  /** Id of the beaker under the buret, or null. */
  beakerUnderBuret() {
    return this.containerId(this.buret.connectedBeaker);
  }

  /** Id of the beaker the electrodes are in, or null. */
  electrodeBeaker() {
    return this.containerId(this.equipment.indicatorElectrode.connectedBeaker);
  }

  containerId(container) {
    return Object.keys(this.containers).find((id) => this.containers[id].container === container) ?? null;
  }

  isBuretClamped() {
    return this.equipment.ringStand.hasButterflyClamp() && this.equipment.butterflyClamp.hasBuret();
  }

  /** Something changed, so an earlier titration reading no longer matches. */
  changed() {
    this.lastReadings.titration = null;
  }

  /** Pours everything in a container into the waste beaker. */
  toWaste(container) {
    container.transferLiquid(this.waste, container.getCurrentLevel());
  }

  /**
   * Describes what is in a container, e.g. "about 20 milliliters of March
   * bay water and distilled water". With precision, the amount is exact to
   * that many decimal places instead ("1.00 milliliters of ...").
   */
  contents(container, precision = 0) {
    if (this.isEmpty(container))
      return 'empty';
    const level = container.getCurrentLevel();
    const names = [...container.liquids.keys()].map((liquid) => LIQUID_NAMES.get(liquid) ?? 'an unknown liquid');
    const amount = precision
      ? `${level.toFixed(precision)} milliliters`
      : `about ${milliliters(Math.max(1, Math.round(level)))}`;
    return `${amount} of ${listNames(names)}`;
  }

  /** A sentence saying what a container holds, e.g. "The flask holds ..." */
  holds(subject, container, precision = 0) {
    const contents = this.contents(container, precision);
    return contents === 'empty' ? `${subject} is empty.` : `${subject} holds ${contents}.`;
  }

  // Silver chloride forms as a white solid once silver nitrate meets chloride.
  hasPrecipitate(container) {
    return container.liquids.has(SilverNitrate) && CHLORIDE_SAMPLES.some((sample) => container.liquids.has(sample));
  }

  // Ring stand and clamp

  toggleClamp() {
    const { ringStand, butterflyClamp } = this.equipment;
    if (ringStand.hasButterflyClamp()) {
      ringStand.removeButterflyClamp();
      return 'You take the butterfly clamp off the ring stand.';
    }
    ringStand.connectButterflyClamp(butterflyClamp);
    return 'You attach the butterfly clamp to the ring stand.';
  }

  toggleBuretInClamp() {
    const { butterflyClamp } = this.equipment;
    this.changed();
    if (butterflyClamp.hasBuret()) {
      butterflyClamp.removeBuret();
      return 'You take the buret out of the clamp and lay it on the lab bench.';
    }
    butterflyClamp.connectBuret(this.buret);
    return 'You clamp the buret upright on the ring stand, with the stopcock closed.';
  }

  // 25 mL graduated cylinder (silver nitrate)

  setSilverNitrateAmount(amount) {
    if (SILVER_NITRATE_AMOUNTS.includes(amount))
      this.silverNitrateAmount = amount;
  }

  measureSilverNitrate() {
    const cylinder = this.silverNitrateCylinder;
    const before = cylinder.getCurrentLevel();
    this.stock.silverNitrate.transferLiquid(cylinder, this.silverNitrateAmount);
    const added = cylinder.getCurrentLevel() - before;
    if (added < this.silverNitrateAmount - EMPTY)
      return `The cylinder fills to its 25 milliliter mark. ${this.holds('It', cylinder)}`;
    return `You measure ${milliliters(this.silverNitrateAmount)} of 0.010 molar silver nitrate into the 25 milliliter cylinder.`;
  }

  rinseBuret() {
    const cylinder = this.silverNitrateCylinder;
    if (this.isEmpty(cylinder))
      return 'The 25 milliliter cylinder is empty. Measure out some silver nitrate first.';
    this.changed();
    cylinder.transferLiquid(this.buret, RINSE_VOLUME);
    this.toWaste(this.buret);
    return `You rinse the buret with about ${milliliters(RINSE_VOLUME)} of silver nitrate and drain it into the waste beaker. ${this.holds('The cylinder', cylinder)}`;
  }

  pourIntoBuret() {
    const cylinder = this.silverNitrateCylinder;
    this.changed();
    const contents = this.contents(cylinder);
    cylinder.transferLiquid(this.buret, cylinder.getCurrentLevel());
    return `You pour ${contents} into the buret.`;
  }

  // 10 mL graduated cylinder (sodium chloride standard)

  measureSodiumChloride() {
    this.stock.sodiumChloride.transferLiquid(this.sodiumChlorideCylinder, SODIUM_CHLORIDE_AMOUNT);
    return `You measure ${milliliters(SODIUM_CHLORIDE_AMOUNT)} of 0.040 molar sodium chloride standard into the 10 milliliter cylinder. ${this.holds('It', this.sodiumChlorideCylinder)}`;
  }

  // Buret and voltmeter

  /** Opens the stopcock once, releasing about buretIncrement mL of silver nitrate. */
  addTitrant() {
    if (!this.isBuretClamped())
      return 'Clamp the buret to the ring stand before opening the stopcock.';
    if (this.isEmpty(this.buret))
      return 'Nothing comes out. The buret is empty; fill it with silver nitrate from the 25 milliliter cylinder.';

    this.changed();
    this.buret.releaseLiquid(this.buretIncrement);
    const amount = this.buretIncrement === BURET_INCREMENTS[0] ? 'A drop of silver nitrate' : `About ${milliliters(this.buretIncrement)} of silver nitrate`;
    const under = this.beakerUnderBuret();
    const runningOut = this.isEmpty(this.buret) ? ' The buret is now empty.' : '';
    if (!under)
      return `No beaker is under the buret. ${amount} drips onto the lab bench.${runningOut}`;
    return `${amount} flows into ${this.containers[under].name} as you swirl it.${runningOut}`;
  }

  setBuretIncrement(amount) {
    if (BURET_INCREMENTS.includes(amount))
      this.buretIncrement = amount;
  }

  /**
   * The voltage between the electrodes in millivolts, or a sentence saying
   * why there is no reading.
   */
  voltage() {
    const id = this.electrodeBeaker();
    if (!id)
      return { problem: 'The voltmeter shows no reading because the electrodes are not in a beaker.' };
    const { container, name } = this.containers[id];
    if (container.getCurrentLevel() < MIN_LEVEL_FOR_READING)
      return { problem: `The voltmeter shows no reading because there is not enough liquid in ${name} to cover the electrodes. Add distilled water.` };
    // The backend can only work out a voltage once a chloride sample is in the beaker.
    if (!container.solveForReactants())
      return { problem: `The voltmeter reading drifts and does not settle, because there is no chloride sample in ${name}.` };
    return { millivolts: (this.equipment.indicatorElectrode.electrodePotentialCell() * 1000).toFixed(1) };
  }

  readBuret() {
    return this.buret.getBuretReading().toFixed(2);
  }

  readBuretAndVoltmeter() {
    this.lastReadings.titration = null;
    const buret = this.readBuret();
    const { millivolts, problem } = this.voltage();
    const buretText = `The buret reads ${buret} milliliters.`;
    if (problem)
      return `${buretText} ${problem}`;
    this.lastReadings.titration = { buret, voltage: millivolts };
    return `${buretText} The voltmeter reads ${millivolts} millivolts.`;
  }

  setTitrationTarget(key) {
    if (key in this.report.readings)
      this.recordTargets.titration = key;
  }

  recordTitrationReading(key = this.recordTargets.titration) {
    const reading = this.lastReadings.titration;
    if (!reading)
      return 'Read the buret and voltmeter first, then record the reading.';
    const number = this.report.addReading(key, reading.buret, reading.voltage);
    this.lastReadings.titration = null;
    const { phrase } = TITRATIONS.find((titration) => titration.key === key);
    return `Recorded reading ${number} for ${phrase} in the report: buret ${reading.buret} milliliters, voltage ${reading.voltage} millivolts.`;
  }

  // Serological pipet

  setPipetRinseSource(id) {
    if (id in this.pipetSources)
      this.pipetRinseSource = id;
  }

  setPipetSource(id) {
    if (id in this.pipetSources)
      this.pipetSource = id;
  }

  setPipetTarget(id) {
    if (id in this.containers)
      this.pipetTarget = id;
  }

  /** Draws up to amount mL from a pipet source; returns a message if it cannot. */
  fillPipet(sourceId, amount) {
    const { liquid, place, container } = this.pipetSources[sourceId];
    if (!this.isEmpty(this.pipet))
      return 'The pipet already holds liquid. Release it first.';
    if (container.getCurrentLevel() < amount - EMPTY)
      return `There is not enough ${liquid} in ${place} to draw from.`;
    this.pipet.connectMultiFillableObject(container);
    this.pipet.extractLiquid(amount);
    this.pipet.removeMultiFillableObject();
    return null;
  }

  rinsePipet() {
    const problem = this.fillPipet(this.pipetRinseSource, RINSE_VOLUME);
    if (problem)
      return problem;
    this.toWaste(this.pipet);
    this.pipetRinsedWith = this.pipetRinseSource;
    const { liquid, place } = this.pipetSources[this.pipetRinseSource];
    return `You rinse the pipet with about ${milliliters(RINSE_VOLUME)} of ${liquid} from ${place} and release it into the waste beaker.`;
  }

  drawSample() {
    const problem = this.fillPipet(this.pipetSource, PIPET_VOLUME);
    if (problem)
      return problem;
    this.lastReadings.sampleVolume = null;
    const { liquid, place } = this.pipetSources[this.pipetSource];
    return `You draw ${PIPET_VOLUME.toFixed(1)} milliliter of ${liquid} from ${place} into the pipet.`;
  }

  readPipet() {
    if (this.isEmpty(this.pipet)) {
      this.lastReadings.sampleVolume = null;
      return 'The pipet is empty.';
    }
    this.lastReadings.sampleVolume = this.pipet.getCurrentLevel().toFixed(2);
    return this.holds('The pipet', this.pipet, 2);
  }

  releasePipet() {
    const { name, container } = this.containers[this.pipetTarget];
    this.changed();
    this.lastReadings.sampleVolume = null;
    const contents = this.contents(this.pipet, 2);
    this.pipet.connectMultiFillableObject(container);
    this.pipet.releaseLiquid(this.pipet.getCurrentLevel());
    this.pipet.removeMultiFillableObject();
    return `You release ${contents} from the pipet into ${name}.`;
  }

  // Volumetric flask

  fillFlaskToMark() {
    this.flask.addLiquid(this.flask.capacity - this.flask.getCurrentLevel(), Water);
    return 'You fill the volumetric flask to its 10 milliliter mark with distilled water and gently mix the solution.';
  }

  /** Empties a container into the waste beaker and rinses it with distilled water. */
  emptyAndRinse(id) {
    const { name, container } = this.containers[id];
    this.changed();
    this.toWaste(container);
    this.waste.addLiquid(RINSE_WATER, Water);
    return `You pour everything in ${name} into the waste beaker, then rinse it with distilled water, collecting the rinse water in the waste beaker.`;
  }

  emptyCylinder(cylinder, name) {
    this.toWaste(cylinder);
    return `You pour what is left in the ${name} into the waste beaker.`;
  }

  // Beakers

  setBeakerMark(id, mark) {
    if (BEAKER_MARKS.includes(mark))
      this.beakerMarks[id] = mark;
  }

  fillBeakerToMark(id) {
    const { name, container } = this.containers[id];
    const mark = this.beakerMarks[id];
    if (container.getCurrentLevel() >= mark)
      return `${capitalize(name)} is already filled to the ${mark} milliliter mark or above.`;
    this.changed();
    // A beaker's marks are only approximate, so the amount varies a little.
    const target = mark + (Math.random() - 0.5);
    container.addLiquid(Math.max(target - container.getCurrentLevel(), 0), Water);
    return `You fill ${name} to the ${mark} milliliter mark with distilled water from the wash bottle.`;
  }

  toggleBeakerUnderBuret(id) {
    this.changed();
    if (this.beakerUnderBuret() === id) {
      this.buret.removeBeaker();
      return `You take ${this.containers[id].name} out from under the buret.`;
    }
    this.buret.connectBeaker(this.containers[id].container);
    return `You place ${this.containers[id].name} under the buret.`;
  }

  disposeWaste() {
    this.waste.emptyCompletely();
    return 'You pour the waste beaker into the labeled waste container. It is now empty.';
  }

  // Electrodes

  setElectrodeTarget(id) {
    if (id in this.containers && id.startsWith('beaker'))
      this.electrodeTarget = id;
  }

  placeElectrodes() {
    const { indicatorElectrode, referenceElectrode } = this.equipment;
    const { name, container } = this.containers[this.electrodeTarget];
    this.changed();
    indicatorElectrode.connectBeaker(container);
    referenceElectrode.connectBeaker(container);
    return `You place the silver indicator electrode and the reference electrode in ${name}.`;
  }

  removeElectrodes() {
    const { indicatorElectrode, referenceElectrode } = this.equipment;
    this.changed();
    indicatorElectrode.removeBeaker();
    referenceElectrode.removeBeaker();
    this.waste.addLiquid(RINSE_WATER, Water);
    return 'You take the electrodes out, rinse them with distilled water over the waste beaker, and set them on the lab bench.';
  }

  // Report

  /** The report field a reading of this kind will be recorded in. */
  recordTarget(kind) {
    const fields = this.report.fieldsOfKind(kind);
    return this.recordTargets[kind]
      ?? fields.find((field) => this.report.get(field.id) === '')?.id
      ?? fields[0].id;
  }

  setRecordTarget(kind, fieldId) {
    if (this.report.fieldsOfKind(kind).some((field) => field.id === fieldId))
      this.recordTargets[kind] = fieldId;
  }

  /** Whether an instrument has been read and the reading not yet recorded. */
  hasReading(kind) {
    return this.lastReadings[kind] !== null;
  }

  /** Copies the last reading taken into a report field. */
  recordReading(kind, fieldId = this.recordTarget(kind)) {
    const value = this.lastReadings[kind];
    if (value === null)
      return 'Take a reading first, then record it.';
    const field = this.report.field(fieldId);
    const previous = this.report.get(fieldId);
    this.report.set(fieldId, value);
    this.lastReadings[kind] = null;
    // Move the dropdown on to the next empty field.
    this.recordTargets[kind] = null;
    const replaced = previous !== '' && previous !== value ? ` It replaces ${previous}.` : '';
    return `Recorded ${value} ${field.unit} as ${field.fullLabel.charAt(0).toLowerCase() + field.fullLabel.slice(1)} in the report.${replaced}`;
  }

  /**
   * An action with a "Record as" dropdown that picks which report field the
   * reading goes into.
   */
  recordAction(kind, readLabel) {
    return {
      label: 'Record reading in report',
      focusAfter: readLabel,
      select: {
        id: `record-${kind}`,
        label: 'Record as',
        value: this.recordTarget(kind),
        options: this.report.fieldsOfKind(kind).map((field) => {
          const recorded = this.report.get(field.id);
          return { value: field.id, text: `${field.fullLabel} (${recorded ? `${recorded} ${field.unit}` : 'empty'})` };
        }),
        change: (fieldId) => this.setRecordTarget(kind, fieldId),
      },
      run: () => this.recordReading(kind),
    };
  }

  /** Dropdown options for a set of containers by id. */
  containerOptions(ids) {
    return ids.map((id) => ({ value: id, text: capitalize(this.containers[id].name) }));
  }

  /** Dropdown options for where the pipet draws from. */
  pipetSourceOptions() {
    return Object.entries(this.pipetSources).map(([id, { liquid, place }]) => ({ value: id, text: `${capitalize(liquid)}, from ${place}` }));
  }

  /**
   * The list of stations shown on the lab bench. Each station has:
   *  - id, title, description
   *  - state(): sentences describing the station right now
   *  - actions(): the buttons to show right now; each has a label and a run()
   *    function that returns the message to announce
   */
  stations() {
    const beakerStation = (id) => ({
      id, title: this.containers[id].name,
      description: 'A 50 milliliter beaker to titrate one sample in. It has rough marks at 10 and 20 milliliters.',
      state: () => {
        const { container } = this.containers[id];
        return [
          this.holds('It', container),
          this.hasPrecipitate(container) ? 'A cloudy white solid, silver chloride, has formed in it.' : null,
          this.beakerUnderBuret() === id ? 'It is under the buret.' : null,
          this.electrodeBeaker() === id ? 'The electrodes are in it.' : null,
        ];
      },
      actions: () => {
        const under = this.beakerUnderBuret();
        return [
          {
            label: 'Fill with distilled water',
            select: {
              id: `${id}-mark`,
              label: 'To the',
              value: String(this.beakerMarks[id]),
              options: BEAKER_MARKS.map((mark) => ({ value: String(mark), text: `${mark} milliliter mark` })),
              change: (value) => this.setBeakerMark(id, Number(value)),
            },
            run: () => this.fillBeakerToMark(id),
          },
          under === id
            ? { label: 'Take beaker out from under buret', run: () => this.toggleBeakerUnderBuret(id) }
            : under === null ? { label: 'Place beaker under buret', run: () => this.toggleBeakerUnderBuret(id) } : null,
          this.isEmpty(this.containers[id].container) ? null
            : { label: 'Empty and rinse into waste beaker', run: () => this.emptyAndRinse(id) },
        ];
      },
    });

    return [
      {
        id: 'ringStand', title: 'Ring stand and clamp',
        description: 'A ring stand with a butterfly clamp that holds the buret upright over a beaker.',
        state: () => [
          this.equipment.ringStand.hasButterflyClamp() ? 'The butterfly clamp is attached to the ring stand.' : 'The butterfly clamp is not attached to the ring stand.',
          this.equipment.butterflyClamp.hasBuret() ? 'The buret is held in the clamp.' : 'The buret is not in the clamp.',
        ],
        actions: () => {
          const clampOn = this.equipment.ringStand.hasButterflyClamp();
          const buretIn = this.equipment.butterflyClamp.hasBuret();
          return [
            // The clamp can only come off once the buret is out of it.
            buretIn ? null : { label: clampOn ? 'Take clamp off ring stand' : 'Attach clamp to ring stand', run: () => this.toggleClamp() },
            clampOn ? { label: buretIn ? 'Take buret out of clamp' : 'Clamp buret to ring stand', run: () => this.toggleBuretInClamp() } : null,
          ];
        },
      },
      {
        id: 'silverNitrateCylinder', title: 'Silver nitrate cylinder',
        description: 'A 25 milliliter graduated cylinder for measuring 0.010 molar silver nitrate from the stock bottle, then rinsing and filling the buret.',
        state: () => [this.holds('The cylinder', this.silverNitrateCylinder)],
        actions: () => {
          const empty = this.isEmpty(this.silverNitrateCylinder);
          return [
            {
              label: 'Measure silver nitrate',
              select: {
                id: 'silver-nitrate-amount',
                label: 'Amount',
                value: String(this.silverNitrateAmount),
                options: SILVER_NITRATE_AMOUNTS.map((amount) => ({ value: String(amount), text: milliliters(amount) })),
                change: (value) => this.setSilverNitrateAmount(Number(value)),
              },
              run: () => this.measureSilverNitrate(),
            },
            empty ? null : { label: `Rinse buret with about ${milliliters(RINSE_VOLUME)}`, run: () => this.rinseBuret() },
            empty ? null : { label: 'Pour into buret', run: () => this.pourIntoBuret() },
            empty ? null : { label: 'Pour the rest into waste beaker', run: () => this.emptyCylinder(this.silverNitrateCylinder, 'silver nitrate cylinder') },
          ];
        },
      },
      {
        id: 'buret', title: 'Buret and voltmeter',
        description: 'A 50 milliliter buret for adding silver nitrate to the beaker underneath, read to the nearest 0.01 milliliter. The voltmeter is wired to the electrodes and shows the voltage between them in millivolts.',
        state: () => {
          const under = this.beakerUnderBuret();
          const electrodes = this.electrodeBeaker();
          return [
            this.isBuretClamped() ? 'The buret is clamped to the ring stand.' : 'The buret is not clamped to the ring stand.',
            this.isEmpty(this.buret) ? 'The buret is empty.' : 'The buret holds silver nitrate.',
            under ? `${this.containers[under].name} is under the buret.` : 'No beaker is under the buret.',
            electrodes ? `The electrodes are in ${this.containers[electrodes].name}.` : 'The electrodes are not in a beaker.',
          ];
        },
        actions: () => [
          {
            label: 'Add silver nitrate',
            select: {
              id: 'buret-increment',
              label: 'Amount per turn',
              value: String(this.buretIncrement),
              options: BURET_INCREMENTS.map((amount) => ({
                value: String(amount),
                text: amount === BURET_INCREMENTS[0] ? `1 drop (about ${amount} milliliters)` : `About ${milliliters(amount)}`,
              })),
              change: (value) => this.setBuretIncrement(Number(value)),
            },
            run: () => this.addTitrant(),
          },
          { label: 'Read the buret and voltmeter', run: () => this.readBuretAndVoltmeter() },
          this.hasReading('titration') ? {
            label: 'Record reading in report',
            focusAfter: 'Read the buret and voltmeter',
            select: {
              id: 'record-titration',
              label: 'Record as',
              value: this.recordTargets.titration,
              options: TITRATIONS.map(({ key, name }) => {
                const count = this.report.readings[key].length;
                return { value: key, text: `${name} (${count} ${count === 1 ? 'reading' : 'readings'})` };
              }),
              change: (value) => this.setTitrationTarget(value),
            },
            run: () => this.recordTitrationReading(),
          } : null,
        ],
      },
      {
        id: 'sodiumChlorideCylinder', title: 'Sodium chloride cylinder',
        description: 'A 10 milliliter graduated cylinder for measuring 0.040 molar sodium chloride standard for the practice titration. Use the serological pipet to rinse with it and draw from it.',
        state: () => [this.holds('The cylinder', this.sodiumChlorideCylinder)],
        actions: () => [
          { label: `Measure ${milliliters(SODIUM_CHLORIDE_AMOUNT)} of sodium chloride standard`, run: () => this.measureSodiumChloride() },
          this.isEmpty(this.sodiumChlorideCylinder) ? null
            : { label: 'Pour the rest into waste beaker', run: () => this.emptyCylinder(this.sodiumChlorideCylinder, 'sodium chloride cylinder') },
        ],
      },
      {
        id: 'pipet', title: 'Serological pipet',
        description: `A 2 milliliter serological pipet with a pump, for measuring out ${PIPET_VOLUME.toFixed(1)} milliliter of a sample.`,
        state: () => [
          this.holds('The pipet', this.pipet, 2),
          this.pipetRinsedWith ? `It was last rinsed with ${this.pipetSources[this.pipetRinsedWith].liquid}.` : 'It has not been rinsed.',
        ],
        actions: () => {
          if (this.isEmpty(this.pipet)) {
            return [
              {
                label: `Rinse pipet with about ${milliliters(RINSE_VOLUME)}`,
                select: { id: 'pipet-rinse-source', label: 'From', value: this.pipetRinseSource, options: this.pipetSourceOptions(), change: (id) => this.setPipetRinseSource(id) },
                run: () => this.rinsePipet(),
              },
              {
                label: `Draw ${PIPET_VOLUME.toFixed(1)} milliliter`,
                select: { id: 'pipet-source', label: 'From', value: this.pipetSource, options: this.pipetSourceOptions(), change: (id) => this.setPipetSource(id) },
                run: () => this.drawSample(),
              },
            ];
          }
          return [
            { label: 'Read the pipet', run: () => this.readPipet() },
            this.hasReading('sampleVolume') ? this.recordAction('sampleVolume', 'Read the pipet') : null,
            {
              label: 'Release',
              select: {
                id: 'pipet-target', label: 'Into', value: this.pipetTarget,
                options: this.containerOptions(['beaker1', 'beaker2', 'beaker3', 'flask', 'waste']),
                change: (id) => this.setPipetTarget(id),
              },
              run: () => this.releasePipet(),
            },
          ];
        },
      },
      beakerStation('beaker1'),
      beakerStation('beaker2'),
      beakerStation('beaker3'),
      {
        id: 'electrodes', title: 'Electrodes',
        description: 'A silver indicator electrode and a reference electrode, wired to the voltmeter. The voltage between them changes as silver nitrate reacts with the chloride in the beaker, and jumps sharply at the equivalence point.',
        state: () => {
          const id = this.electrodeBeaker();
          return [id ? `The electrodes are in ${this.containers[id].name}.` : 'The electrodes are on the lab bench.'];
        },
        actions: () => [
          this.electrodeBeaker()
            ? { label: 'Take electrodes out and rinse them', run: () => this.removeElectrodes() }
            : {
              label: 'Place electrodes',
              select: {
                id: 'electrode-target', label: 'Into', value: this.electrodeTarget,
                options: this.containerOptions(['beaker1', 'beaker2', 'beaker3']),
                change: (id) => this.setElectrodeTarget(id),
              },
              run: () => this.placeElectrodes(),
            },
        ],
      },
      {
        id: 'flask', title: 'Volumetric flask',
        description: 'A 10 milliliter volumetric flask, for diluting a bay water sample that needs more than 10 milliliters of silver nitrate: 1.0 milliliter of sample filled to the mark with distilled water.',
        state: () => [this.holds('The flask', this.flask)],
        actions: () => {
          const level = this.flask.getCurrentLevel();
          return [
            level > EMPTY && level < this.flask.capacity - EMPTY
              ? { label: 'Fill to the mark with distilled water and mix', run: () => this.fillFlaskToMark() } : null,
            level > EMPTY ? { label: 'Empty and rinse into waste beaker', run: () => this.emptyAndRinse('flask') } : null,
          ];
        },
      },
      {
        id: 'waste', title: 'Waste beaker',
        description: 'A 600 milliliter beaker that collects all waste and rinse water.',
        state: () => [this.holds('It', this.waste)],
        actions: () => [
          this.isEmpty(this.waste) ? null
            : { label: 'Pour into labeled waste container', run: () => this.disposeWaste() },
        ],
      },
    ];
  }

  /** Data for one input in the report form (see the number-field template). */
  reportFieldData(field) {
    const error = this.report.error(field.id);
    return {
      id: `report-${field.id}`,
      errorId: `report-${field.id}-error`,
      label: `${field.label} (${field.unit})`,
      value: this.report.get(field.id),
      error,
      invalid: error ? 'true' : null,
      describedBy: error ? `report-${field.id}-error` : null,
      input: (event) => {
        this.report.set(field.id, event.target.value);
      },
      // Errors are only shown once the student leaves the field, so they
      // are not interrupted while typing.
      change: (event) => showFieldError(event.target, this.report.error(field.id)),
    };
  }

  start() {
    const page = new PageBuilder('main', 'Titration Experiment');
    const stations = this.stations();

    // Runs an action, announces the result, and redraws the view to show the new state.
    // focusAfter names a button to move focus to afterwards, for actions
    // whose own button disappears (recording a reading hides its button).
    const perform = (action) => {
      announce(action.run());
      page.refresh();
      if (action.focusAfter)
        [...page.root.querySelectorAll('button')].find((button) => button.textContent === action.focusAfter)?.focus();
    };

    // An action is a button, or a labelled dropdown followed by a button.
    const actionItem = (action) => {
      const item = { label: action.label, click: () => perform(action) };
      if (!action.select)
        return item;
      return {
        ...item,
        template: 'select-action-item',
        selectId: action.select.id,
        selectLabel: action.select.label,
        options: action.select.options.map((option) => ({ ...option, selected: option.value === action.select.value })),
        change: (event) => action.select.change(event.target.value),
      };
    };

    page.addView('bench', 'bench-view', () => ({
      stations: stations.map((station) => ({ label: station.title, click: () => page.show(station.id) })),
    }));

    for (const station of stations) {
      page.addView(station.id, 'station-view', () => ({
        title: station.title,
        description: station.description,
        state: station.state().filter(Boolean).map((text) => ({ text })),
        actions: station.actions().filter(Boolean).map(actionItem),
      }), { section: 'bench' });
    }

    page.addView('procedure', 'procedure-view');

    // A titration's readings table and its equivalence point field.
    const titrationData = ({ key, name, phrase }) => {
      const readings = this.report.readings[key];
      return {
        legend: name,
        caption: `${name} readings`,
        noReadings: readings.length === 0,
        readingsNote: readings.length === 0 ? `No readings recorded for ${phrase} yet.` : '',
        readings: readings.map((reading, index) => ({ number: index + 1, ...reading })),
        removeLabel: `Remove last reading from ${phrase}`,
        clearLabel: `Clear all readings from ${phrase}`,
        removeLast: () => {
          const removed = this.report.removeLastReading(key);
          announce(removed
            ? `Removed reading ${readings.length + 1} from ${phrase}: buret ${removed.buret} milliliters, voltage ${removed.voltage} millivolts.`
            : `${phrase.charAt(0).toUpperCase() + phrase.slice(1)} has no readings to remove.`);
          page.refresh();
        },
        clearReadings: () => {
          if (readings.length === 0) {
            announce(`${phrase.charAt(0).toUpperCase() + phrase.slice(1)} has no readings to clear.`);
            return;
          }
          if (!window.confirm(`Clear all ${readings.length} readings from ${phrase}? This cannot be undone.`))
            return;
          this.report.clearReadings(key);
          announce(`Cleared all readings from ${phrase}.`);
          page.refresh();
        },
        fields: this.report.titrationFields(key).map((field) => this.reportFieldData(field)),
      };
    };

    // Typing in the report only stores the value; the view is not redrawn,
    // so focus and the cursor stay in the field being edited.
    page.addView('report', 'report-view', () => ({
      samples: SAMPLES.map((sample) => ({
        heading: sample.bayWater ? sample.name : `Practice: ${sample.name.charAt(0).toLowerCase() + sample.name.slice(1)}`,
        legend: `${sample.name} sample`,
        fields: [
          ...this.report.sampleFields(sample.key).map((field) => this.reportFieldData(field)),
          sample.bayWater ? {
            template: 'select-field',
            id: `report-${sample.key}-diluted`,
            label: 'Was this sample diluted?',
            options: DILUTION_CHOICES.map((choice) => ({ ...choice, selected: choice.value === this.report.diluted[sample.key] })),
            change: (event) => this.report.setDiluted(sample.key, event.target.value),
          } : null,
        ].filter(Boolean),
        titrations: TITRATIONS.filter((titration) => titration.sample === sample.key).map(titrationData),
      })),
      calculations: SAMPLES.filter((sample) => sample.bayWater).map((sample) => ({
        legend: sample.name,
        fields: this.report.calculationFields(sample.key).map((field) => this.reportFieldData(field)),
      })),
      clear: () => {
        if (!window.confirm('Clear everything in the report? This cannot be undone.'))
          return;
        this.report.clear();
        this.recordTargets = { sampleVolume: null, titration: TITRATIONS[0].key };
        announce('The report has been cleared.');
        page.refresh();
      },
    }));

    page.show('bench', false);
  }
}

/** Shows or hides the error message under a report input. */
function showFieldError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  error.textContent = message;
  if (message) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
  }
  else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  }
}

export var titrationLab = new TitrationLab();
