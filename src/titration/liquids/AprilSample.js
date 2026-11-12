import Liquid from "./Liquid.js";

/**
 * The April sample from the titration experiment.
 * 
 * @category Titration
 * @subcategory Liquids
 * @extends Liquid
 */
class AprilSample extends Liquid {
  // TODO: Determine good value for this
  static molarConcentration = 0.032;
}

export default AprilSample;