import Beaker from "./Beaker.js";

class Electrode {
  baseElectrodePotential = 0.222;

  /**
   * @type {Beaker}
   */
  connectedBeaker = null;

  electrodePotentialCell() {
    // E of cell = E of cathode - E of anode
    return this.electrodePotentialCathode() - this.electrodePotentialAnode();
  }

  electrodePotentialCathode() {
    if (this.connectedBeaker != null) {
      // getTitrationCurve value returns pCl which is -log([Cl])
      // this means the negative is already factored in, so the electrode constant
      // is used instead
      // TODO: Figure out derivation of 0.0592
      return 0.222 + (0.0592 * this.connectedBeaker.getTitrationCurveValue());
    }
    else
      return this.baseElectrodePotential;
  }

  electrodePotentialAnode() {
    return this.baseElectrodePotential;
  }

  connectBeaker(beaker) {
    if (this.connectedBeaker == null)
      this.connectedBeaker = beaker;
  }

  removeBeaker() {
    this.connectedBeaker = null;
  }

  hasBeaker() {
    return this.connectedBeaker != null;
  }
}

export default Electrode;
