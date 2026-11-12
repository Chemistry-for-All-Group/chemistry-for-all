/**
 * The samples titrated: the sodium chloride standard in the practice
 * titration (part A), then the March and April bay water samples (part B).
 */
export const SAMPLES = [
  { key: 'practice', name: 'Sodium chloride standard', bayWater: false },
  { key: 'march', name: 'March bay water', bayWater: true },
  { key: 'april', name: 'April bay water', bayWater: true },
];

/**
 * Every titration the student records readings for. Each bay water sample
 * gets a quick "fast titration" to find roughly where the equivalence point
 * is, then two careful trials that are averaged. `phrase` is how the
 * titration is named in the middle of a sentence.
 */
export const TITRATIONS = [
  { key: 'practice', sample: 'practice', name: 'Practice titration', phrase: 'the practice titration' },
  { key: 'marchFast', sample: 'march', name: 'March fast titration', phrase: 'the March fast titration' },
  { key: 'marchTrial1', sample: 'march', name: 'March trial 1', phrase: 'March trial 1' },
  { key: 'marchTrial2', sample: 'march', name: 'March trial 2', phrase: 'March trial 2' },
  { key: 'aprilFast', sample: 'april', name: 'April fast titration', phrase: 'the April fast titration' },
  { key: 'aprilTrial1', sample: 'april', name: 'April trial 1', phrase: 'April trial 1' },
  { key: 'aprilTrial2', sample: 'april', name: 'April trial 2', phrase: 'April trial 2' },
];

/** Choices for whether a bay water sample was diluted. '' means not answered. */
export const DILUTION_CHOICES = [
  { value: '', text: 'Not answered' },
  { value: 'no', text: 'No' },
  { value: 'yes', text: 'Yes, 1 milliliter diluted to 10 milliliters' },
];

/**
 * Every number the student can record. `kind` matches the instrument the
 * value is read from, so a pipet reading can only be recorded as a sample
 * volume. Calculation fields have the kind 'calculation': the student works
 * these out and types them in.
 */
function sampleFields(sample) {
  const fields = [
    { key: 'sampleVolume', kind: 'sampleVolume', label: 'Volume of sample pipetted into each beaker', unit: 'milliliters', min: 0 },
  ];
  if (!sample.bayWater)
    fields.push({ key: 'expectedVolume', kind: 'calculation', label: 'Calculated volume of silver nitrate needed', unit: 'milliliters', min: null });
  return fields;
}

const TITRATION_FIELDS = [
  { key: 'equivalenceVolume', kind: 'calculation', label: 'Volume of silver nitrate added at the equivalence point', unit: 'milliliters', min: null },
];

const CALCULATION_FIELDS = [
  { key: 'averageVolume', kind: 'calculation', label: 'Average volume of silver nitrate, trials 1 and 2', unit: 'milliliters', min: null },
  { key: 'molesSilver', kind: 'calculation', label: 'Moles of silver nitrate', unit: 'moles', min: null },
  { key: 'molesSodiumChloride', kind: 'calculation', label: 'Moles of sodium chloride', unit: 'moles', min: null },
  { key: 'gramsSodiumChloride', kind: 'calculation', label: 'Grams of sodium chloride', unit: 'grams', min: null },
  { key: 'salinity', kind: 'calculation', label: 'Salinity', unit: 'parts per thousand', min: null },
];

function withIds(fields, owner) {
  return fields.map((field) => ({
    ...field,
    id: `${owner.key}-${field.key}`,
    fullLabel: `${owner.name}, ${field.label.charAt(0).toLowerCase() + field.label.slice(1)}`,
  }));
}

/**
 * Everything the student has written down for the titration: number fields
 * (same as MolarMassReport), whether each bay water sample was diluted, and
 * for each titration a list of readings. Each reading is a buret reading and
 * a voltage, kept as the text that was shown.
 */
export class TitrationReport {
  values = {};
  diluted = {};
  readings = {};

  constructor() {
    this.clear();
  }

  clear() {
    this.values = Object.fromEntries(this.fields().map((field) => [field.id, '']));
    this.diluted = Object.fromEntries(SAMPLES.filter((sample) => sample.bayWater).map((sample) => [sample.key, '']));
    this.readings = Object.fromEntries(TITRATIONS.map((titration) => [titration.key, []]));
  }

  fields() {
    return [
      ...SAMPLES.flatMap((sample) => this.sampleFields(sample.key)),
      ...TITRATIONS.flatMap((titration) => this.titrationFields(titration.key)),
      ...SAMPLES.flatMap((sample) => this.calculationFields(sample.key)),
    ];
  }

  sampleFields(sampleKey) {
    const sample = SAMPLES.find((item) => item.key === sampleKey);
    return withIds(sampleFields(sample), sample);
  }

  titrationFields(titrationKey) {
    return withIds(TITRATION_FIELDS, TITRATIONS.find((item) => item.key === titrationKey));
  }

  /** Salinity calculations; only for the bay water samples. */
  calculationFields(sampleKey) {
    const sample = SAMPLES.find((item) => item.key === sampleKey);
    return sample.bayWater ? withIds(CALCULATION_FIELDS, sample) : [];
  }

  field(id) {
    return this.fields().find((field) => field.id === id);
  }

  fieldsOfKind(kind) {
    return this.fields().filter((field) => field.kind === kind);
  }

  get(id) {
    return this.values[id] ?? '';
  }

  set(id, text) {
    this.values[id] = String(text);
  }

  setDiluted(sampleKey, value) {
    if (sampleKey in this.diluted && DILUTION_CHOICES.some((choice) => choice.value === value))
      this.diluted[sampleKey] = value;
  }

  /** Adds a reading to a titration's list and returns its number (starting at 1). */
  addReading(titrationKey, buret, voltage) {
    this.readings[titrationKey].push({ buret: String(buret), voltage: String(voltage) });
    return this.readings[titrationKey].length;
  }

  /** Removes the most recent reading from a titration; returns it, or undefined if there were none. */
  removeLastReading(titrationKey) {
    return this.readings[titrationKey].pop();
  }

  /** Removes every reading from a titration, e.g. to start it again after diluting. */
  clearReadings(titrationKey) {
    this.readings[titrationKey] = [];
  }

  /**
   * Returns an error message for a field, or '' if it is empty or valid.
   */
  error(id) {
    const text = this.get(id).trim();
    if (text === '')
      return '';
    const field = this.field(id);
    const number = Number(text);
    if (!Number.isFinite(number))
      return `${field.fullLabel} must be a number, for example 12.5.`;
    if (field.min !== null && number <= field.min)
      return `${field.fullLabel} must be greater than ${field.min}.`;
    return '';
  }
}
