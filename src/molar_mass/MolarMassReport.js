/**
 * A practice run to refine technique, then three trials whose results are
 * averaged (see the lab's procedure, parts B and C).
 */
export const TRIALS = [
  { key: 'practice', name: 'Practice run', practice: true },
  { key: 'trial1', name: 'Trial 1', practice: false },
  { key: 'trial2', name: 'Trial 2', practice: false },
  { key: 'trial3', name: 'Trial 3', practice: false },
];

/**
 * Every value the student can record. `kind` matches the instrument the
 * value is read from, so a scale reading can only be recorded as a mass.
 * Calculation fields have the kind 'calculation': the student works these
 * out and types them in
 */
const CONDITION_FIELDS = [
  { id: 'temperature', kind: 'temperature', label: 'Temperature', unit: 'degrees Celsius', min: -273.15 },
  { id: 'temperatureKelvin', kind: 'calculation', label: 'Temperature in kelvin', unit: 'kelvin', min: null },
  { id: 'pressure', kind: 'pressure', label: 'Barometric pressure', unit: 'torr', min: 0 },
  { id: 'waterVaporPressure', kind: 'calculation', label: 'Partial pressure of water', unit: 'torr', min: null },
  { id: 'dryGasPressure', kind: 'calculation', label: 'Pressure of dry gas', unit: 'torr', min: null },
];

const MEASUREMENT_FIELDS = [
  { key: 'initialMass', kind: 'mass', label: 'Initial mass of lighter', unit: 'grams', min: 0 },
  { key: 'finalMass', kind: 'mass', label: 'Final mass of lighter', unit: 'grams', min: 0 },
  { key: 'volume', kind: 'volume', label: 'Volume of gas collected', unit: 'milliliters', min: 0 },
];

const CALCULATION_FIELDS = [
  { key: 'massButane', kind: 'calculation', label: 'Mass of butane', unit: 'grams', min: null },
  { key: 'liters', kind: 'calculation', label: 'Volume of gas', unit: 'liters', min: null },
  { key: 'moles', kind: 'calculation', label: 'Moles of butane', unit: 'moles', min: null },
  { key: 'molarMass', kind: 'calculation', label: 'Molar mass', unit: 'grams per mole', min: null },
  { key: 'percentError', kind: 'calculation', label: 'Percent difference from actual molar mass', unit: 'percent', min: null },
  // Only for the averaged trials, not the practice run.
  { key: 'deviation', kind: 'calculation', label: 'Deviation from average molar mass', unit: 'grams per mole', min: null, trialsOnly: true },
];

const FINAL_FIELDS = [
  { id: 'averageMolarMass', kind: 'calculation', label: 'Average molar mass of trials 1 to 3', unit: 'grams per mole', min: null },
  { id: 'averagePercentError', kind: 'calculation', label: 'Percent difference of the average from actual molar mass', unit: 'percent', min: null },
  { id: 'standardDeviation', kind: 'calculation', label: 'Standard deviation of molar mass', unit: 'grams per mole', min: null },
];

function perTrial(fields, trial) {
  return fields
    .filter((field) => !(field.trialsOnly && trial.practice))
    .map((field) => ({
      ...field,
      id: `${trial.key}-${field.key}`,
      trial: trial.key,
      fullLabel: `${trial.name}, ${field.label.charAt(0).toLowerCase() + field.label.slice(1)}`,
    }));
}

export class MolarMassReport {
  values = {};

  constructor() {
    this.clear();
  }

  clear() {
    this.values = Object.fromEntries(this.fields().map((field) => [field.id, '']));
  }

  fields() {
    return [
      ...this.conditionFields(),
      ...TRIALS.flatMap((trial) => this.measurementFields(trial)),
      ...TRIALS.flatMap((trial) => this.calculationFields(trial)),
      ...this.finalFields(),
    ];
  }

  conditionFields() {
    return CONDITION_FIELDS.map((field) => ({ ...field, trial: null, fullLabel: field.label }));
  }

  measurementFields(trial) {
    return perTrial(MEASUREMENT_FIELDS, trial);
  }

  calculationFields(trial) {
    return perTrial(CALCULATION_FIELDS, trial);
  }

  finalFields() {
    return FINAL_FIELDS.map((field) => ({ ...field, trial: null, fullLabel: field.label }));
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
