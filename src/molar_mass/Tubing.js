import Cylinder from "./Cylinder.js";

/**
 * Represents tubing that can connect a Cylinder and a Lighter.
 */
class Tubing {
  /**
   * Represents the Cylinder that the tubing is inserted into.
   * 
   * @access protected
   * 
   * @type {Beaker}
   */
  connectedCylinder = null;

  /**
   * Transfers a specified amount of butane to the connected cylinder. 
   * 
   * Should only be called by Lighter that is connected to this tubing.
   * 
   * If there is no connected cylinder, does nothing. 
   * 
   * @access public
   * 
   * @param {number} amountToTransfer The amount of butane to transfer in mL.
   */
  transferButane(amountToTransfer) {
    if (this.connectedCylinder != null) {
      this.connectedCylinder.transferButane(amountToTransfer);
    }
  }

  /**
   * Inserts the Tubing into the Cylinder, so that any butane that is 
   * transferred to the Tubing is then transferred to the Cylinder.
   * 
   * Does nothing if there is already a connected Cylinder.
   * 
   * @param {Cylinder} cylinder The Cylinder to connect to the Tubing.
   */
  connectCylinder(cylinder) {
    if (this.connectedCylinder == null)
      this.connectedCylinder = cylinder;
  }

  /**
   * Removes the Tubing from the current connected Cylinder.
   */
  removeCylinder() {
    this.connectedCylinder = null;
  }
}

export default Tubing;