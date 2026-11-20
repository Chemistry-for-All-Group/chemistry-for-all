/**
 * The minimum temperature in Celsius possible for Thermometer to select.
 * 
 * @category Molar Mass
 * @type {number}
 */
const MIN_TEMPERATURE = 20.0;
/**
 * The maximum temperature in Celsius possible for Thermometer to select.
 * 
 * @category Molar Mass
 * @type {number}
 */
const MAX_TEMPERATURE = 25.5;

/**
 * Stores the current temperature in the room.
 * 
 * @category Molar Mass
 */
class Thermometer {
  /**
   * The ambient temperature in the room in Celsius.
   * 
   * 
   * This value gets initialized to a random between MIN_TEMPERATURE and 
   * MAX_TEMPERATURE.
   * 
   * @access public
   * 
   * @type {number}
   */
  static temperature = Math.random() * (MAX_TEMPERATURE - MIN_TEMPERATURE) + MIN_TEMPERATURE;

  /**
   * Returns the ambient temperature in the room in Kelvin.
   * 
   * @access public
   * 
   * @returns The ambient temperature in the room in Kelvin.
   */
  static temperatureKelvin() {
    return this.temperature + 273.15;
  }
}

export default Thermometer;