import MultiFillableObject from "./MultiFillableObject.js";
import Beaker from "./Beaker.js";

/**
 * MultifillableObject that represents a buret.
 * 
 * Used for incrementally adding a solution to a connected Beaker.
 * 
 * @extends MultiFillableObject
 */
export default class Buret extends MultiFillableObject {
  capacity = 50;

  /**
   * Represents the Beaker that is directly under the Buret.
   * 
   * @access protected
   * 
   * @type {Beaker}
   */
  connectedBeaker = null;

  /**
   * Returns the current reading on the Buret.
   * 
   * Equivalent to capacity - getCurrentLevel().
   * 
   * @access public
   * 
   * @returns {number} The reading on the Buret, which is the amount that has been removed from the Buret.
   */
  getBuretReading() {
    return this.capacity - this.getCurrentLevel();
  }

  /**
   * Removes a random amount of Liquid within + or - 10% of targetIncrement from the Buret.
   * 
   * If there is a Beaker under the Buret, the removed liquid is transferred to
   * that Beaker.
   * 
   * @param {number} targetAmount The desired amount to be released from the Buret.
   */
  releaseLiquid(targetAmount = 0.1) {
    // Get random number between +/-10% of targetIncrement
    // This adds some amount of error
    const variance = targetAmount * 0.1;
    const mlToRelease = Math.max(targetAmount + (Math.random() * (variance - -variance) + -variance), 0);
    
    // If tubing is connected, transfer butane through tubing
    if (this.connectedBeaker != null) {
      this.transferLiquid(this.connectedBeaker, mlToRelease);
    }
    else {
      this.removeLiquid(mlToRelease);
    }
  }

  /**
   * Places the beaker under the Buret.
   * 
   * Does nothing if there is already a connected Beaker.
   * 
   * @param {Beaker} beaker The beaker to place under the Buret.
   */
  connectBeaker(beaker) {
    if (this.connectedBeaker == null)
      this.connectedBeaker = beaker;
  }

  /**
   * Removes the current Beaker from under the Buret.
   */
  removeBeaker() {
    this.connectedBeaker = null;
  }

  /** 
   * Returns whether or not there is a beaker under the Buret.
   * 
   * @returns {boolean} True if there is a beaker under the Buret
   */
  hasBeaker() {
    return this.connectedBeaker != null;
  }
}