/**
 * Base class for defining liquids.
 * 
 * @category Titration
 * @subcategory Liquids
 */
class Liquid {
  /**
   * The molar concentration of this liquid.
   * 
   * @category Titration
   * @type {number}
   */
  static molarConcentration;
}

/**
 * Contains values for solubility constants of certain solutions.
 * 
 * @category Titration
 */
const SOLUBILITY_CONSTANTS = {
  AgCl: 0.00000000018
};

export default Liquid;
export { SOLUBILITY_CONSTANTS };