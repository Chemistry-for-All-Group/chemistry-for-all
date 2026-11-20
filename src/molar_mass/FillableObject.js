/**
 * Base class representing objects that can contain a measurable amount of water.
 * 
 * @category Molar Mass
 */
class FillableObject {
  /**
   * Stores how much water the object contains in mL. 
   * 
   * Should always be 0 or greater and be less than or equal to capacity.
   * 
   * @access protected
   * 
   * @type {number}
   */
  currentLevel = 0;

  /**
   * The maximum amount of water the object can contain.
   * 
   * currentLevel should never exceed this amount.
   * 
   * @access protected
   * 
   * @type {number}
   */
  capacity;

  /**
   * Constructor for setting a custom capacity.
   * 
   * @access public
   * 
   * @param {number} capacity Sets the capacity property to this value.
   */
  constructor(capacity) {
    this.capacity = capacity;
  }

  /**
   * Returns true if the current level is equal to the capacity of this object.
   * 
   * @access public
   * 
   * @returns {boolean} True if this object is at capacity (i.e. no more liquid can be added)
   */
  isFull() {
    return this.currentLevel == this.capacity;
  }

  /**
   * Fills the rest of object up to capacity with water. 
   * 
   * Same as addLiquid(capacity). If already contains liquid, the rest gets 
   * filled with liquidType.
   * 
   * @access public
   */
  fillCompletely() {
    this.currentLevel = this.capacity;
  }

  /**
   * Removes all water from the object.
   * 
   * @access public
   */
  emptyCompletely() {
    this.currentLevel = 0;
  }

  /**
   * Adds amountToAdd mL of water to the object.
   * 
   * If adding amountToAdd causes the object to fill over capacity, it will instead
   * fill the object exactly to capacity with water.
   * 
   * @access public
   * 
   * @param {number} amountToAdd The amount of liquid to add in mL.
   */
  addLiquid(amountToAdd) {
    // Clamp amount, so that amount never falls goes below 0 or above capacity
    this.currentLevel = Math.max(0, Math.min(amountToAdd + this.currentLevel, this.capacity));
  }

  /**
   * Removes a specified amount of water from the object.
   *
   * @access public
   * 
   * @param {number} amountToRemove The amount of water to remove in mL.
   * 
   * @return {number} The actual amount removed from the object in mL.
   */
  removeLiquid(amountToRemove) {
    const originalAmount = this.currentLevel;
    this.currentLevel = Math.max(0, Math.min(this.currentLevel - amountToRemove, this.capacity));
    // Return actual amount removed
    return Math.abs(originalAmount - this.currentLevel); 
  }

  /**
   * Returns the amount of water in the object in mL.
   * 
   * @access public
   * 
   * @returns {number} The total amount of water contained in the object in mL.
   */
  getCurrentLevel() {
    return this.currentLevel;
  }
}

export default FillableObject;