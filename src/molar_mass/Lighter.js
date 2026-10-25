import WeightedObject from "./WeightedObject.js ";
import PressureSensor from "./PressureSensor.js";
import Thermometer from "./Thermometer.js";

const MOLAR_MASS_BUTANE = 58.1222;
/**
 * Gas constant for using L, atm, mol, and K.
 */
const GAS_CONSTANT = 0.08206;

export default class Lighter extends WeightedObject {
  mass = 14;
  mlOfButane = 300;

  connectedTubing = null;

  getMass() {
    // Mass is the mass of the lighter plus the mass of the butane inside
    return this.mass + this.getMassButane();
  }

  getMassButane() {
    // Use pV/RT = n to find amount of moles, then multiply by molar mass
    return ((PressureSensor.pressureATM() * this.litersButane()) /
      (Thermometer.temperatureKelvin() * GAS_CONSTANT)) * MOLAR_MASS_BUTANE;
  }

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

  connectTubing(tubing) {
    if (this.connectedTubing == null)
      this.connectedTubing = tubing;
  }

  removeTubing() {
    this.connectedTubing = null;
  }
}