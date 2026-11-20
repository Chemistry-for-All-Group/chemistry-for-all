/**
 * The minimum pressure in Torr possible for PressureSensor to select.
 * 
 * @category Molar Mass
 * @type {number}
 */
const MIN_PRESSURE = 740;
/**
 * The maximum pressure in Torr possible for PressureSensor to select.
 * 
 * @category Molar Mass
 * @type {number}
 */
const MAX_PRESSURE = 780;

/**
 * Stores the current pressure in the room.
 * 
 * @category Molar Mass
 */
class PressureSensor {
  /**
   * The ambient pressure in the room in Torr.
   * 
   * 
   * This value gets initialized to a random between MIN_PRESSURE and 
   * MAX_PRESSURE.
   * 
   * @access public
   * 
   * @type {number}
   */
  static pressure = Math.random() * (MAX_PRESSURE - MIN_PRESSURE) + MIN_PRESSURE;

  /**
   * Returns the ambient pressure in the room in ATM.
   * 
   * @access public
   * 
   * @returns {number} The ambient pressure in the room in ATM.
   */
  static pressureATM() {
    return this.pressure * 0.001315789;
  }
}

export default PressureSensor;