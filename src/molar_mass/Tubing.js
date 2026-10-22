export default class Tubing {
  connectedCylinder = null;

  transferButane(amountToTransfer) {
    if (this.connectedCylinder != null) {
      this.connectedCylinder.transferButane(amountToTransfer);
    }
  }

  connectCylinder(cylinder) {
    if (this.connectedCylinder == null)
      this.connectedCylinder = cylinder;
  }

  removeCylinder() {
    this.connectedCylinder = null;
  }
}