import Scale from "./Scale.js";
import Lighter from "./Lighter.js";
import Sink from "./Sink.js";
import WaterTrough from "./WaterTrough.js";
import Thermometer from "./Thermometer.js";
import PressureSensor from "./PressureSensor.js";
import Tubing from "./Tubing.js";
import Cylinder from "./Cylinder.js";
import { announce, PageBuilder } from "../pageBuilder.js";

// Wording for each location, used in messages like "The lighter is on the scale."
const PLACE = { bench: 'on the lab bench', sink: 'in the sink', trough: 'in the water trough', scale: 'on the scale' };

/**
 * The molar mass of butane experiment.
 *
 * Keeps track of where each piece of equipment is and uses the backend
 * classes to do each action. Action methods return a sentence describing
 * what happened, which gets shown and read out to the student.
 */
export class MolarMassExperiment {
  scale = new Scale();
  lighter = new Lighter();
  sink = new Sink();
  trough = new WaterTrough();
  tubing = new Tubing();
  cylinder = new Cylinder();

  // Where each item currently is. The trough can be on the 'bench' or in the 'sink'.
  troughLocation = 'bench';
  // 'bench', 'sink', or 'trough'
  cylinderLocation = 'bench';
  // 'bench' or 'scale'
  lighterLocation = 'bench';

  toggleSink() {
    if (this.sink.isOn) {
      this.sink.turnOffSink();
      return 'You turn off the faucet.';
    }
    this.sink.turnOnSink();
    return 'You turn on the faucet. Anything in the sink fills with water.';
  }

  moveTrough(destination) {
    if (this.troughLocation === 'sink')
      this.sink.removeObjectFromSink(this.trough);
    if (destination === 'sink')
      this.sink.addObjectToSink(this.trough);
    this.troughLocation = destination;
    return `You move the water trough ${PLACE[destination]}. It is ${this.troughWater()}.`;
  }

  troughWater() {
    const level = this.trough.getCurrentLevel();
    if (level >= this.trough.capacity * 0.95) return 'full of water';
    if (level > 0) return 'partly full of water';
    return 'empty';
  }

  moveCylinder(destination) {
    if (this.cylinderLocation === 'sink')
      this.sink.removeObjectFromSink(this.cylinder);
    if (this.cylinderLocation === 'trough') {
      this.cylinder.removeFromWaterTrough();
      this.tubing.removeCylinder();
    }

    this.cylinderLocation = destination;
    if (destination === 'sink')
      this.sink.addObjectToSink(this.cylinder);
    if (destination === 'trough')
      this.cylinder.submergeInWaterTrough(this.trough);
    return `You move the graduated cylinder ${PLACE[destination]}. It is upright.`;
  }

  invertCylinder() {
    this.cylinder.invertInWaterTrough();
    return 'You turn the cylinder upside down under the water and rest it on the bottom of the trough. ' + this.gasInCylinder();
  }

  setCylinderLeveled(leveled) {
    this.cylinder.setIsLeveledWithTroughWater(leveled);
    return leveled
      ? 'You lift the cylinder off the tubing outlet and hold it so the water level inside matches the water level in the trough.'
      : 'You lower the cylinder back onto the bottom of the trough, over the tubing outlet.';
  }

  gasInCylinder() {
    const fraction = 1 - this.cylinder.getCurrentLevel() / this.cylinder.capacity;
    if (fraction <= 0) return 'The cylinder is full of water with no gas at the top.';
    if (fraction < 0.25) return 'There is a small pocket of gas at the top of the cylinder.';
    if (fraction < 0.75) return 'Gas fills roughly half of the cylinder.';
    if (fraction < 1) return 'Gas fills most of the cylinder.';
    return 'The cylinder is completely full of gas.';
  }

  toggleTubingAtCylinder() {
    if (this.tubing.connectedCylinder) {
      this.tubing.removeCylinder();
      return 'You move the tubing outlet out from under the cylinder.';
    }
    this.tubing.connectCylinder(this.cylinder);
    return 'You place the tubing outlet in the trough under the open end of the cylinder.';
  }

  toggleTubingAtLighter() {
    if (this.lighter.connectedTubing) {
      this.lighter.removeTubing();
      return 'You detach the tubing from the lighter.';
    }
    this.lighter.connectTubing(this.tubing);
    return "You attach the tubing to the lighter's valve.";
  }

  moveLighter(destination) {
    if (destination === 'scale')
      this.scale.addObjectToScale(this.lighter);
    else
      this.scale.removeObjectFromScale(this.lighter);
    this.lighterLocation = destination;
    return `You place the lighter ${PLACE[destination]}.`;
  }

  /**
   * Presses the lighter valve once, releasing a small amount of butane
   * (about 0.5 mL, see Lighter.releaseButane). The message says where the
   * gas went, based on how the equipment is set up.
   */
  pressLighterValve() {
    if (this.lighter.mlOfButane <= 0)
      return 'Nothing comes out. The lighter is out of butane.';

    this.lighter.releaseButane();

    if (!this.lighter.connectedTubing)
      return 'No tubing is attached, so a little butane escapes into the air.';
    if (!this.tubing.connectedCylinder)
      return 'The tubing outlet is not under the cylinder, so a little butane escapes into the air.';
    if (!this.cylinder.isInvertedInTrough || this.cylinder.isLeveledWithTroughWater)
      return 'The cylinder is not positioned over the outlet, so a few bubbles escape into the air.';
    return 'A few bubbles of butane rise into the cylinder. ' + this.gasInCylinder();
  }

  readScale() {
    return `The scale reads ${this.scale.getCurrentMass().toFixed(3)} grams.`;
  }

  readThermometer() {
    return `The thermometer reads ${Thermometer.temperature.toFixed(1)} degrees Celsius.`;
  }

  readBarometer() {
    return `The barometer reads ${PressureSensor.pressure.toFixed(1)} torr.`;
  }

  readCylinder() {
    if (!this.cylinder.isInvertedInTrough)
      return `The upright cylinder holds ${this.cylinder.getCurrentLevel().toFixed(1)} milliliters of water.`;
    const level = this.cylinder.isLeveledWithTroughWater
      ? 'The water inside is level with the trough water.'
      : 'The water inside is not level with the trough water.';
    return `${level} The gas at the top of the cylinder measures ${this.cylinder.getDisplacedLevel().toFixed(1)} milliliters.`;
  }

  /**
   * The list of stations shown on the lab bench. Each station has:
   *  - id, title, description
   *  - state(): sentences describing the station right now
   *  - actions(): the buttons to show right now; each has a label and a run()
   *    function that returns the message to announce
   */
  stations() {
    return [
      {
        id: 'sink', title: 'Sink',
        description: 'A sink with a faucet, used to fill equipment with water.',
        state: () => [
          `The faucet is ${this.sink.isOn ? 'on' : 'off'}.`,
          this.troughLocation === 'sink' ? 'The water trough is in the sink.' : null,
          this.cylinderLocation === 'sink' ? 'The graduated cylinder is in the sink.' : null,
        ],
        actions: () => [
          { label: this.sink.isOn ? 'Turn off faucet' : 'Turn on faucet', run: () => this.toggleSink() },
        ],
      },
      {
        id: 'trough', title: 'Water trough',
        description: 'A large tub of water for collecting gas in an upside-down cylinder.',
        state: () => [
          `The trough is ${PLACE[this.troughLocation]} and is ${this.troughWater()}.`,
          this.cylinderLocation === 'trough'
            ? `The graduated cylinder is in the trough, ${this.cylinder.isInvertedInTrough ? 'upside down' : 'upright'}.`
            : 'The graduated cylinder is not in the trough.',
        ],
        actions: () => [
          this.troughLocation === 'bench'
            ? { label: 'Move trough to sink', run: () => this.moveTrough('sink') }
            : { label: 'Move trough to lab bench', run: () => this.moveTrough('bench') },
        ],
      },
      {
        id: 'cylinder', title: 'Graduated cylinder',
        description: 'A 50 milliliter graduated cylinder, used upside down in the trough to measure the volume of gas collected.',
        state: () => {
          if (!this.cylinder.isInvertedInTrough)
            return [`The cylinder is upright, ${PLACE[this.cylinderLocation]}.`];
          return [
            'The cylinder is upside down in the trough.',
            this.cylinder.isLeveledWithTroughWater
              ? 'You are holding it so the water inside is level with the trough water.'
              : 'It is resting on the bottom of the trough.',
            this.gasInCylinder(),
            this.tubing.connectedCylinder ? 'The tubing outlet is under it.' : 'The tubing outlet is not under it.',
          ];
        },
        actions: () => {
          const inverted = this.cylinder.isInvertedInTrough;
          const leveled = this.cylinder.isLeveledWithTroughWater;
          const moves = [['bench', 'lab bench'], ['sink', 'sink'], ['trough', 'water trough']]
            .filter(([place]) => place !== this.cylinderLocation)
            .map(([place, name]) => ({ label: `Move cylinder to ${name}`, run: () => this.moveCylinder(place) }));
          return [
            { label: 'Read the cylinder', run: () => this.readCylinder() },
            this.cylinderLocation === 'trough' && !inverted
              ? { label: 'Turn cylinder upside down under the water', run: () => this.invertCylinder() } : null,
            inverted && !leveled
              ? { label: 'Level the water inside with the trough water', run: () => this.setCylinderLeveled(true) } : null,
            inverted && leveled
              ? { label: 'Lower cylinder back over the tubing outlet', run: () => this.setCylinderLeveled(false) } : null,
            ...moves,
          ];
        },
      },
      {
        id: 'tubing', title: 'Tubing',
        description: 'Rubber tubing that carries butane from the lighter to underneath the cylinder.',
        state: () => [
          this.lighter.connectedTubing ? 'The tubing is attached to the lighter.' : 'The tubing is not attached to the lighter.',
          this.tubing.connectedCylinder ? 'The outlet is under the cylinder.' : 'The outlet is not under the cylinder.',
        ],
        actions: () => [
          this.lighterLocation === 'bench'
            ? { label: this.lighter.connectedTubing ? 'Detach tubing from lighter' : 'Attach tubing to lighter', run: () => this.toggleTubingAtLighter() } : null,
          this.cylinderLocation === 'trough'
            ? { label: this.tubing.connectedCylinder ? 'Move outlet out from under cylinder' : 'Place outlet under cylinder', run: () => this.toggleTubingAtCylinder() } : null,
        ],
      },
      {
        id: 'lighter', title: 'Butane lighter',
        description: 'A disposable butane lighter. Pressing the valve without lighting it releases a small amount of butane gas.',
        state: () => [
          `The lighter is ${PLACE[this.lighterLocation]}.`,
          this.lighter.connectedTubing ? 'The tubing is attached to it.' : 'No tubing is attached.',
        ],
        actions: () => {
          if (this.lighterLocation === 'scale')
            return [{ label: 'Take lighter off scale', run: () => this.moveLighter('bench') }];
          return [
            { label: 'Press the lighter valve', run: () => this.pressLighterValve() },
            this.lighter.connectedTubing ? null
              : { label: 'Place lighter on scale', run: () => this.moveLighter('scale') },
          ];
        },
      },
      {
        id: 'scale', title: 'Scale',
        description: 'A digital scale that measures mass to the nearest milligram.',
        state: () => [this.lighterLocation === 'scale' ? 'The lighter is on the scale.' : 'The scale is empty.'],
        actions: () => [{ label: 'Read the scale', run: () => this.readScale() }],
      },
      {
        id: 'thermometer', title: 'Thermometer',
        description: 'Measures the temperature of the room and water.',
        state: () => [],
        actions: () => [{ label: 'Read the thermometer', run: () => this.readThermometer() }],
      },
      {
        id: 'barometer', title: 'Barometer',
        description: 'Measures the air pressure in the room.',
        state: () => [],
        actions: () => [{ label: 'Read the barometer', run: () => this.readBarometer() }],
      },
    ];
  }

  /**
   * Sets up the page: one view for the bench, one per station, and the
   * procedure. Called from molar_mass.html.
   */
  start() {
    const page = new PageBuilder('main', 'Molar Mass Experiment');
    const stations = this.stations();

    // Runs an action, announces the result, and redraws the view to show the new state.
    const perform = (action) => {
      announce(action.run());
      page.refresh();
    };

    page.addView('bench', 'bench-view', () => ({
      stations: stations.map((station) => ({ label: station.title, click: () => page.show(station.id) })),
    }));

    for (const station of stations) {
      page.addView(station.id, 'station-view', () => ({
        title: station.title,
        description: station.description,
        state: station.state().filter(Boolean).map((text) => ({ text })),
        actions: station.actions().filter(Boolean).map((action) => ({ label: action.label, click: () => perform(action) })),
      }));
    }

    page.addView('procedure', 'procedure-view');

    page.show('bench', false);
  }
}

export var molarMassExperiment = new MolarMassExperiment();
