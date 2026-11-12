import MultiFillableObject from "./MultiFillableObject.js";

class SerologicalPipet extends MultiFillableObject {
  /**
   * @param {number} capacity The most liquid this can hold in mL (defaults to 2).
   */
  constructor(capacity = 2) {
    // Set through the constructor rather than as a field: a field would
    // replace the capacity passed in (e.g. new Beaker(600) would hold 50 mL).
    super(capacity);
  }
  
  /**
   * @type {MultiFillableObject}
   */
  connectedMultiFillableObject = null;

  /**
   * 
   * @param {MultiFillableObject} multiFillableObject 
   */
  connectMultiFillableObject(multiFillableObject) {
    if (this.connectedMultiFillableObject == null)
      this.connectedMultiFillableObject = multiFillableObject;
  }

  removeMultiFillableObject() {
    this.connectedMultiFillableObject = null;
  }

  hasMultiFillableObject() {
    return this.connectedMultiFillableObject != null;
  }

  /**
   * 
   * @param {number} amountToExtract 
   */
  extractLiquid(amountToExtract) {
    if (this.connectedMultiFillableObject != null) {
      this.connectedMultiFillableObject.transferLiquid(this, amountToExtract);
    }
  }

  /**
   * 
   * @param {number} amountToRelease 
   */
  releaseLiquid(amountToRelease) {
    if (this.connectedMultiFillableObject != null) {
      this.transferLiquid(this.connectedMultiFillableObject, amountToRelease);
    }
    else {
      this.removeLiquid(amountToRelease);
    }
  }
}

export default SerologicalPipet;