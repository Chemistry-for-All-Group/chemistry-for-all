/**
 * Base class for defining liquids.
 */
class Liquid {
  /**
   * The molar concentration of this liquid.
   * 
   * @type {number}
   */
  static molarConcentration;
}

/**
 * Contains values for solubility constants of certain solutions.
 */
const SOLUBILITY_CONSTANTS = {
  AgCl: 0.00000000018
};

export default Liquid;
export { SOLUBILITY_CONSTANTS };