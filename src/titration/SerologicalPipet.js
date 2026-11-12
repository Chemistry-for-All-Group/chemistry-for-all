import MultiFillableObject from "./MultiFillableObject.js";

/**
 * Multifillable object that represents a serological pipet.
 * 
 * Used for extracting liquid from and releasing liquid into a connected
 * MultiFillableObject.
 * 
 * @category Titration
 * @extends MultiFillableObject
 */
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
   * Represents the MultiFillableObject that the pipet is in.
   * 
   * This object will be filled if releaseLiquid is called or liquid will
   * be removed from this liquid if extractLiquid is called.
   * 
   * @type {MultiFillableObject}
   */
  connectedMultiFillableObject = null;

  /**
   * Places the pipet into multiFillableObject.
   * 
   * Does nothing if there is already a connected MultiFillableObject.
   * 
   * @param {MultiFillableObject} multiFillableObject The object to put the pipet into.
   */
  connectMultiFillableObject(multiFillableObject) {
    if (this.connectedMultiFillableObject == null)
      this.connectedMultiFillableObject = multiFillableObject;
  }

  /**
   * Removes the pipet from the connected MultiFillableObject.
   */
  removeMultiFillableObject() {
    this.connectedMultiFillableObject = null;
  }

  /** 
   * Returns whether or not the pipet is in a MultiFillableObject.
   * 
   * @returns {boolean} True if the pipet is currently in a MultiFillableObject
   */
  hasMultiFillableObject() {
    return this.connectedMultiFillableObject != null;
  }

  /**
   * Extracts amountToExtract from the connected MultiFillableObject into the pipet.
   * 
   * Does nothing if there is no MultiFillableObject connected.
   * 
   * @param {number} amountToExtract The amount to transfer from connectedMultiFillableObject to the pipet
   */
  extractLiquid(amountToExtract) {
    if (this.connectedMultiFillableObject != null) {
      this.connectedMultiFillableObject.transferLiquid(this, amountToExtract);
    }
  }

  /**
   * Releases amountToRelease from the pipet.
   * 
   * If there is a connectedMultiFillableObject, the removed liquid is added to it.
   * 
   * @param {number} amountToRelease The amount to remove from the pipet and add to connectedMultiFillableObject
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