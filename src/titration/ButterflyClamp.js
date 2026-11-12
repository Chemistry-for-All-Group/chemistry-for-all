import Buret from "./Buret.js";

/**
 * Represents a ButterflyClamp.
 * 
 * Used for logically connecting a Buret to a RingStand.
 */
class ButterflyClamp {
  /**
   * Represents the Buret that is currently attached to this ButterflyClamp.
   * 
   * Null if nothing is attached.
   * 
   * @access private
   * 
   * @type {Buret}
   */
  connectedBuret = null;

  /**
   * Attaches the buret to the ButterflyClamp.
   * 
   * Does nothing if a Buret is already connected.
   * 
   * @access public
   * 
   * @param {Buret} buret The Buret to connect to the ButterflyClamp.
   */
  connectBuret(buret) {
    if (this.connectedBuret == null)
      this.connectedBuret = buret;
  }

  /**
   * Removes the Buret from the ButterflyClamp.
   * 
   * @access public
   */
  removeBuret() {
    this.connectedBuret = null;
  }
  
  /** 
   * Returns whether or not there is a Buret attached to the ButterflyClamp.
   * 
   * @access public
   * 
   * @returns {boolean} True if there is a Buret attached to the ButterflyClamp.
   */
  hasBuret() {
    return this.connectedBuret != null;
  }
}

export default ButterflyClamp;