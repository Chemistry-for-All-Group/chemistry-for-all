import MultiFillableObject from "./MultiFillableObject.js";

/**
 * A MultiFillableObject that represents a graduated cylinder.
 * 
 * @category Titration
 * @extends MultiFillableObject
 */
class Cylinder extends MultiFillableObject {
  /**
   * @param {number} capacity The most liquid this can hold in mL (defaults to 10).
   */
  constructor(capacity = 10) {
    // Set through the constructor rather than as a field: a field would
    // replace the capacity passed in (e.g. new Beaker(600) would hold 50 mL).
    super(capacity);
  }
}

export default Cylinder;