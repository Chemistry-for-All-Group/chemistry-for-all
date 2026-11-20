import WeightedObject from "./WeightedObject.js";
import PressureSensor from "./PressureSensor.js";
import Thermometer from "./Thermometer.js";

/**
 * Molar mass of butane in grams.
 * 
 * @category Molar Mass
 * @type {number}
 */
const MOLAR_MASS_BUTANE = 58.1222;

/**
 * Gas constant for using L, atm, mol, and K.
 * 
 * @category Molar Mass
 * @type {number}
 */
const GAS_CONSTANT = 0.08206;

/**
 * Represents a butane lighter.
 * 
 * Contains a certain amount of butane that can be released. The mass of the 
 * lighter depends on the amount of butane.
 * 
 * @category Molar Mass
 * @extends WeightedObject
 */
class Lighter extends WeightedObject {
  /**
   * The mass of the lighter when it contains no butane in grams.
   * 
   * @access protected
   * 
   * @type {number}
   */
  mass = 14;

  /**
   * The starting amount of butane in the lighter in mL.
   * 
   * @access protected
   * 
   * @type {number}
   */
  mlOfButane = 300;

  /**
   * Represents tubing that is connected to the lighter in such a way that butane
   * would flow through the tubing. 
   * 
   * If null, no tubing is connected.
   * 
   * @access protected
   * 
   * @type {Tubing}
   */
  connectedTubing = null;

  /**
   * Returns the total mass of the lighter in grams.
   * 
   * @access public
   * 
   * @returns {number} The total mass of the lighter in grams (i.e. the mass of the lighter's body and butane). 
   */
  getMass() {
    // Mass is the mass of the lighter plus the mass of the butane inside
    return this.mass + this.getMassButane();
  }

  /**
   * Returns the mass of the butane inside of the lighter in grams.
   * 
   * Uses the pressure from PressureSensor and temperature from Thermometer for
   * the calculations.
   * 
   * @access protected
   * 
   * @returns {number} The mass of the butane inside the lighter in grams.
   */
  getMassButane() {
    // Use pV/RT = n to find amount of moles, then multiply by molar mass
    return ((PressureSensor.pressureATM() * this.litersButane()) /
      (Thermometer.temperatureKelvin() * GAS_CONSTANT)) * MOLAR_MASS_BUTANE;
  }

  /**
   * Returns the amount of butane in the lighter in liters.
   * 
   * @access protected
   * 
   * @returns {number} The amount of butane in the lighter in liters.
   */
  litersButane() {
    return this.mlOfButane * 0.001;
  }

  /**
   * Reduces mlOfButane by a value within 0.1 mL of targetIncrement.
   * 
   * The actual amount of butane removed is a randomly selected number between 
   * targetIncrement - 0.1 mL and targetIncrement + 1 mL.
   * 
   * If connectedTubing is not null (meaning there is tubing connected to the lighter),
   * the butane will be transferred through the tubing. Otherwise, the butane will 
   * simply be removed from the lighter like normal.
   *  
   * @access public
   * 
   * @param {number} targetIncrement The desired amount of butane in mL to be released from the lighter.   
   */
  releaseButane(targetIncrement = 0.5) {
    // Get random number between -0.1 and 0.1, and add to targetIncrement to add
    // some amount of error. Also, ensure the value is never below 0.
    var mlToRelease = Math.max(targetIncrement + (Math.random() * (0.1 - -0.1) + -0.1), 0);
    
    // If trying to release more butane than is currently in the lighter, 
    // empty exactly the amount in the lighter
    if (mlToRelease > this.mlOfButane) {
      mlToRelease = this.mlOfButane;
    }
    
    this.mlOfButane -= mlToRelease
    
    // If tubing is connected, transfer butane through tubing
    if (this.connectedTubing != null) {
      this.connectedTubing.transferButane(mlToRelease);
    }
  }

  /**
   * Connects the tubing to the lighter, so that when butane is released it will
   * flow through the tubing.
   * 
   * Does nothing if there is already a connected Tubing.
   * 
   * @access public
   * 
   * @param {Tubing} tubing The tubing to connect to the lighter
   */
  connectTubing(tubing) {
    if (this.connectedTubing == null)
      this.connectedTubing = tubing;
  }

  /**
   * Removes the current Tubing from the lighter.
   * 
   * @access public
   */
  removeTubing() {
    this.connectedTubing = null;
  }
}

export default Lighter;