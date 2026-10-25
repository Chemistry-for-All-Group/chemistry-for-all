/**
 * Base class for defining liquids.
 */
export default class Liquid {
  /**
   * The molar concentration of this liquid.
   * 
   * @type {Number}
   */
  static molarConcentration;
}

/**
 * Contains values for solubility constants of certain solutions.
 */
export const SOLUBILITY_CONSTANTS = {
  AgCl: 0.00000000018
};