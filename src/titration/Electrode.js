import Beaker from "./Beaker.js";

/**
 * Represents an electrode circuit used for measuring a titration.
 */
class Electrode {
  /**
   * The base potential in volts when there is no reaction happening.
   */
  baseElectrodePotential = 0.222;

  /**
   * The Beaker that the electrode is in.
   * 
   * Null if not in a Beaker.
   * 
   * @access protected
   * 
   * @type {Beaker}
   */
  connectedBeaker = null;

  /**
   * Returns the current potential of the the electrode cell.
   * 
   * Equivalent to electrodePotentialCathode() - electrodePotentialAnode().
   * 
   * @access public
   * 
   * @returns {number} The potential of the electrode cell in volts.
   */
  electrodePotentialCell() {
    // E of cell = E of cathode - E of anode
    return this.electrodePotentialCathode() - this.electrodePotentialAnode();
  }

  /**
   * Returns the current potential of the the electrode's cathode.
   * 
   * The indicator electrode in the titration.
   * 
   * @access public
   * 
   * @returns {number} The potential of the electrode's cathode in volts.
   */
  electrodePotentialCathode() {
    if (this.connectedBeaker != null) {
      // getTitrationCurve value returns pCl which is -log([Cl])
      // this means the negative is already factored in, so the electrode constant
      // is used instead
      return this.baseElectrodePotential + (0.0592 * this.connectedBeaker.getTitrationCurveValue());
    }
    else
      return this.baseElectrodePotential;
  }

   /**
   * Returns the current potential of the the electrode's anode.
   * 
   * The reference electrode in the titration.
   * 
   * @access public
   * 
   * @returns {number} The potential of the electrode's anode in volts.
   */
  electrodePotentialAnode() {
    return this.baseElectrodePotential;
  }

  /**
   * Places the Electrode in the Beaker.
   * 
   * Does nothing if already in a Beaker.
   * 
   * @param {Beaker} beaker The Beaker to place the Electrode in.
   */
  connectBeaker(beaker) {
    if (this.connectedBeaker == null)
      this.connectedBeaker = beaker;
  }

  /**
   * Removes the Electrode from the connected Beaker. 
   * 
   * @access public
   */
  removeBeaker() {
    this.connectedBeaker = null;
  }

  /** 
   * Returns whether or not the Electrode in in a Beaker.
   * 
   * @access public
   * 
   * @returns {boolean} True if the Electrode is in a Beaker.
   */
  hasBeaker() {
    return this.connectedBeaker != null;
  }
}

export default Electrode;
