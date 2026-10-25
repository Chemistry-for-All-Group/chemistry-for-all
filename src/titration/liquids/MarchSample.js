import Liquid from "./Liquid.js";

/**
 * The March sample from the titration experiment.
 * 
 * @extends Liquid
 */
class MarchSample extends Liquid {
  // TODO: Determine good value for this
  static molarConcentration = 0.023;
}

export default MarchSample;