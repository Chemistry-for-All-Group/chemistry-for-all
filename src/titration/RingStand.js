class RingStand {
  connectedButterflyClamp = null;

  connectButterflyClamp(butterflyClamp) {
    if (this.connectedButterflyClamp == null)
      this.connectedButterflyClamp = butterflyClamp;
  }

  removeButterflyClamp() {
    this.connectedButterflyClamp = null;
  }

  hasButterflyClamp() {
    return this.connectedButterflyClamp != null;
  }
}

export default RingStand;