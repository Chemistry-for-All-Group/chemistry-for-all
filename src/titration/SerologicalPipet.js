import MultiFillableObject from "./MultiFillableObject.js";

export default class SerologicalPipet extends MultiFillableObject {
  capacity = 2;
  
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