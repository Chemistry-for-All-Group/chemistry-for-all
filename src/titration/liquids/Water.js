import Liquid from "./Liquid.js";

/**
 * Represents distilled water.
 * 
 * @category Titration
 * @subcategory Liquids
 * @extends Liquid
 */
class Water extends Liquid {
  static molarConcentration = 1;
}

export default Water;