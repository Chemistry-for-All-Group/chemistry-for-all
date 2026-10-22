const MIN_TEMPERATURE = 20.0;
const MAX_TEMPERATURE = 25.5;

export default class Thermometer {
  // temperature should be the ambient temperature in celsius by default
  static temperature = Math.random() * (MAX_TEMPERATURE - MIN_TEMPERATURE) + MIN_TEMPERATURE;

  static temperatureKelvin() {
    return this.temperature + 273.15;
  }
}