import Liquid from "./liquids/Liquid.js";
import Water from "./liquids/Water.js";

/**
 * Represents an object that can be filled with multiple types of liquid at once.
 */
class MultiFillableObject {
  /**
   * Stores the current liquids that are contained in this object.
   * 
   * Keys should be the liquid's class and the value should be the amount of that 
   * liquid in mL. 
   * 
   * @access protected
   * 
   * @type {Map<Liquid, number>}
   */
  liquids = new Map();

  /**
   * The maximum amount of liquid this object can contain in mL.
   * 
   * The combined amount of values in liquids should never exceed this value.
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
    return this.getCurrentLevel() == this.capacity;
  }

  /**
   * Fills the rest of object up to capacity with liquidType. 
   * 
   * Same as addLiquid(capacity). If already contains liquid, the rest gets 
   * filled with liquidType.
   * 
   * @access public
   * 
   * @param {Liquid} liquidType The type of liquid to fill the object with (if unspecified, uses Water). 
   */
  fillCompletely(liquidType = Water) {
    this.addLiquid(this.capacity, liquidType);
  }

  /**
   * Removes all liquid from the object.
   * 
   * @access public
   */
  emptyCompletely() {
    this.liquids.clear();
  }

  /**
   * Adds amountToAdd mL of liquid of type liquidType.
   * 
   * If adding amountToAdd causes the object to fill over capacity, it will instead
   * fill the object exactly to capacity with liquidType.
   * 
   * @access public
   * 
   * @param {number} amountToAdd The amount of liquid to add in mL.
   * @param {Liquid} liquidType The type of liquid to add (if unspecified, uses Water). 
   */
  addLiquid(amountToAdd, liquidType = Water) {
    const currentLevel = this.getCurrentLevel();
    var newAmount = amountToAdd;
    // If new amount goes above capacity, reduce to reach capacity instead
    if (currentLevel + amountToAdd > this.capacity) {
      newAmount = this.capacity - currentLevel;
    }
    // If this object already contains this liquid, add to that amount
    if (this.liquids.has(liquidType)) {
      newAmount += this.liquids.get(liquidType);
    }
    this.liquids.set(liquidType, newAmount);
  }

  /**
   * Adds multiple liquids to the object as defined by a map.
   * 
   * Same as using addLiquid to add liquids from the liquid map in a for loop.
   * liquidMapToAdd should have keys defining the type of liquid and values
   * defining how much to add in mL.
   * 
   * @access public
   * 
   * @param {Map<Liquid, number>} liquidMapToAdd A Map of liquids to add to the object.
   */
  addLiquidMap(liquidMapToAdd) {
    for (const liquid of liquidMapToAdd) {
      this.addLiquid(liquid[1], liquid[0]);
    }
  }

  /**
   * Removes a specified amount of liquid from the object.
   * 
   * If liquidType is set to null, then this function removes liquids evenly, so
   * that a total of amountToRemove is removed while keeping the ratio of liquids
   * the same. Otherwise, it will only remove amountToRemove from the liquid type
   * specified. 
   * 
   * This function is typically called without a liquidType specified
   * and the specific liquid removal feature should only be used in special 
   * scenarios.
   * 
   * @access public
   * 
   * @param {number} amountToRemove The amount of liquid to remove in mL.
   * @param {Liquid} liquidType The type of liquid to remove (null if unspecified).
   * @returns {Map<Liquid, number>} A map defining what liquids were removed. Keys are the types and values are the amounts in mL.
   */
  removeLiquid(amountToRemove, liquidType = null) {
    // Make copy of liquids to keep track of what liquids have been removed
    const originalLiquids = new Map(this.liquids);
    const removedLiquids = this.liquids;
    // If no type specified, evenly remove from each type to keep ratio the same
    if (liquidType == null) {
      const currentLevel = this.getCurrentLevel();
      // If trying to remove more than possible, clear all liquids and return
      if (amountToRemove >= currentLevel) {
        this.liquids.clear();
        return this.liquidMapDifference(originalLiquids, removedLiquids);
      }
      const percentToRemove = (currentLevel - amountToRemove) / currentLevel;
      for (const liquidInfo of this.liquids) {
        this.liquids.set(liquidInfo[0], liquidInfo[1] * percentToRemove);
      }
    }
    else if (this.liquids.has(liquidType)) {
      this.liquids.set(liquidType, this.liquids.get(liquidType) - amountToRemove);
      // Remove from liquid type if removing results in it being 0 or less
      if (this.liquids.get(liquidType) <= 0) {
        this.liquids.delete(liquidType);
      } 
    }
    return this.liquidMapDifference(originalLiquids, removedLiquids);
  }

  /**
   * Returns the difference between two Liquid Maps.
   * 
   * The difference in Liquid Maps is a Map that includes difference in values 
   * between each liquid type in two Liquid Maps.
   * 
   * @access private
   * 
   * @param {Map<Liquid, number>} liquidMap1 Map with liquid types and amounts in mL as values.
   * @param {Map<Liquid, number>} liquidMap2 Map with liquid types and amounts in mL as values.
   * @returns {Map<Liquid, number>} The difference in liquid value between liquidMap1 and liquidMap2.
   */
  liquidMapDifference(liquidMap1, liquidMap2) {
    var differenceMap = new Map();
    
    var currentLiquidDifference = 0;
    for (const liquid of liquidMap1) {
      currentLiquidDifference = liquid[1];
      if (liquidMap2.has(liquid[0])) {
        currentLiquidDifference = liquidMap1.get(liquid[0]) - liquidMap2.get(liquid[0]);
      }
      if (currentLiquidDifference > 0) // only include liquids that have changed
        differenceMap.set(liquid[0], currentLiquidDifference);
    }

    return differenceMap;
  }

  /**
   * Returns the sum of the current liquids contained in this object in mL.
   * 
   * @access public
   * 
   * @returns {number} The total amount of liquid contained in the object in mL.
   */
  getCurrentLevel() {
    var total = 0;
    for (const liquidInfo of this.liquids) {
      total += liquidInfo[1];
    }
    return total;
  }

  /**
   * Convenience function to remove liquid from this MultiFillableObject and add 
   * it to another MultiFillableObject. 
   * 
   * If liquidType is null, uses unspecified liquid mode of removeLiquid function.
   * 
   * @access public
   * 
   * @param {MultiFillableObject} objectToTransferTo The object to add the liquid to.
   * @param {number} amount The amount of liquid to transfer in mL.
   * @param {Liquid} liquidType The type of liquid to transfer (null if unspecified). 
   */
  transferLiquid(objectToTransferTo, amount, liquidType = null) {
    if (liquidType == null)
      objectToTransferTo.addLiquidMap(this.removeLiquid(amount));
    else
      objectToTransferTo.addLiquidMap(this.removeLiquid(amount, liquidType));
  }
}

export default MultiFillableObject;