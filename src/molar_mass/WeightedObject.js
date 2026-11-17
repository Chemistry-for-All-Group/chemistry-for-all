/**
 * Base class for objects with a measurable mass.
 * 
 * @category Molar Mass
 */
class WeightedObject {
  /**
   * The mass of the object in grams.
   * 
   * @access protected
   * 
   * @type {number}
   */
  mass = 0;

  /**
   * Constructor for setting a custom mass.
   * 
   * @param {number} mass The mass of the object in grams.
   */
  constructor(mass) {
    this.mass = mass;
  }

  /**
   * Returns the mass of the object in grams.
   * 
   * @returns The mass of the object in grams.
   */
  getMass() {
    return this.mass;
  }
}

export default WeightedObject;