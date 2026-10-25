import ButterflyClamp from "./ButterflyClamp.js";

/**
 * Represents a RingStand.
 * 
 * Used for logically connecting to a ButterflyClamp.
 */
class RingStand {
  /**
   * Represents the Buret that is currently attached to this ButterflyClamp.
   * 
   * Null if nothing is attached.
   * 
   * @access private
   * 
   * @type {ButterflyClamp}
   */
  connectedButterflyClamp = null;

 /**
   * Attaches the ButterflyClamp to the RingStand.
   * 
   * Does nothing if a ButterflyClamp is already connected.
   * 
   * @access public
   * 
   * @param {ButterflyClamp} butterflyClamp The ButterflyClamp to connect to the RingStand.
   */
  connectButterflyClamp(butterflyClamp) {
    if (this.connectedButterflyClamp == null)
      this.connectedButterflyClamp = butterflyClamp;
  }

  /**
   * Removes the ButterflyClamp from the RingStand.
   * 
   * @access public
   */
  removeButterflyClamp() {
    this.connectedButterflyClamp = null;
  }

  /** 
   * Returns whether or not there is a ButterflyClamp attached to the RingStand.
   * 
   * @access public
   * 
   * @returns {boolean} True if there is a ButterflyClamp attached to the RingStand.
   */
  hasButterflyClamp() {
    return this.connectedButterflyClamp != null;
  }
}

export default RingStand;