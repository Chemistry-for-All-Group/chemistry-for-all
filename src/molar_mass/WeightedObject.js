export default class WeightedObject {
  // Mass should be in grams
  mass = 0;

  constructor(mass) {
    this.mass = mass;
  }

  getMass() {
    return this.mass;
  }
}