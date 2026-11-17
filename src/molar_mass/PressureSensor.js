const MIN_PRESSURE = 740;
const MAX_PRESSURE = 780;

class PressureSensor {
  // pressure should be the ambient pressure in torr by default
  static pressure = Math.random() * (MAX_PRESSURE - MIN_PRESSURE) + MIN_PRESSURE;

  static pressureATM() {
    return this.pressure * 0.001315789;
  }
}

export default PressureSensor;