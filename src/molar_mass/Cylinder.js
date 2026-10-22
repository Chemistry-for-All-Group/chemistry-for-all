import FillableObject from "./FillableObject.js";
import WaterTrough from "./WaterTrough.js";

export default class Cylinder extends FillableObject {
  capacity = 50;

  /**
   * The amount the displaced level is modified by when the cylinder is not leveled.
   * 
   * Due to the pressure exerted, the butane expands making
   * the amount of displacement more than the amount butane in the cylinder.
   * There is a way to calculate the realistic amount of displacement based on pressure,
   * but this value is not pertinent to the experiment, 
   * so we are using a random unchanging value between 0 and 1 as a simplification.
   * 
   * @access private
   *
   * @type {Number}
   */
  static AMOUNT_TO_ADD_WHEN_NOT_LEVELED = Math.random();

  /**
   * The current WaterTrough that the cylinder is in.
   * 
   * @access private
   * 
   * @type {WaterTrough}
   */
  waterTrough = null;

  /**
   * Whether or not the cylinder is currently inverted in waterTrough (i.e. in position to receive butane). 
   * 
   * @access private
   * 
   * @type {Boolean}
   */
  isInvertedInTrough = false;

  /**
   * Whether or not the cylinder's water level is leveled with waterTrough's water level.
   * 
   * @access private
   * 
   * @type {Boolean}
   */
  isLeveledWithTroughWater = false;

  /**
   * 
   * @param {WaterTrough} waterTrough 
   */
  submergeInWaterTrough(waterTrough) {
    this.waterTrough = waterTrough;
    this.isInvertedInTrough = false;
    this.isLeveledWithTroughWater = false;
  }

  /**
   * Removes the cylinder from the current WaterTrough.
   * 
   * If the cylinder is currently inverted, any liquid in the cylinder gets
   * transferred to the WaterTrough.
   */
  removeFromWaterTrough() {
    if (this.waterTrough != null && this.isInvertedInTrough) {
      this.waterTrough.addLiquid(this.removeLiquid(this.capacity));
    }
    this.waterTrough = null;
    this.isInvertedInTrough = false;
    this.isLeveledWithTroughWater = false;
  }

  /**
   * Inverts the cylinder in the current water trough.
   * 
   * Must first be submerged in a water trough. If it is not inverted already,
   * it will transfer water from the water trough into the cylinder equal to the
   * cylinder's capacity. 
   */
  invertInWaterTrough() {
    if (this.waterTrough != null && !this.isInvertedInTrough) {
      this.isInvertedInTrough = true;
      this.addLiquid(this.waterTrough.removeLiquid(this.capacity));
    }
  }

  /**
   * Sets whether or not the cylinder's water level is levelled with the water trough's water level.
   *
   * If the cylinder is leveled with the trough's water, getDisplacedLevel will return
   * a more accurate reading. The cylinder must first be inverted in a WaterTrough
   * before setting it to be leveled.
   * 
   * @param {Boolean} state True if cylinder should be leveled with water, false if it should be in position for transferring butane.
   */
  setIsLeveledWithTroughWater(state) {
    // Must be inverted in trough to level it with trough water
    if (state && this.isInvertedInTrough) {
      this.isLeveledWithTroughWater = true;
    }
    else {
      this.isLeveledWithTroughWater = false;
    }
  }

  /**
   * Displaces water equal to the value of amountToTransfer.
   * 
   * The cylinder must be inverted in a water trough for water to be displaced
   * when this is called. The displaced water will be removed from the cylinder
   * and added to the water trough.
   * 
   * This function is intended to be called by the connected tubing and 
   * not directly called by the lighter or view.
   * 
   * @param {Number} amountToTransfer The amount of water to displace due to the addition of butane.
   */
  transferButane(amountToTransfer) {
    // Only displace water if in the proper set up
    if (this.waterTrough != null && this.isInvertedInTrough 
      && !this.isLeveledWithTroughWater) {
      this.waterTrough.addLiquid(this.removeLiquid(amountToTransfer));
    }
  }

  /**
   * Returns the current amount amount of water that has been displaced by butane.
   *
   * If the cylinder is not leveled with the water trough, the value returned
   * is increased by AMOUNT_TO_ADD_WHEN_NOT_LEVELED.
   *  
   * @returns The current amount of water that has been displaced by butane.
   */
  getDisplacedLevel() {
    if (this.isLeveledWithTroughWater) {
      return this.capacity - this.currentLevel;
    }
    else {
      return Math.max(this.capacity - (this.currentLevel - Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED), 0);
    }
  }
}