import Liquid from "./Liquid.js";

/**
 * The April sample from the titration experiment.
 * 
 * @category Titration
 * @subcategory Liquids
 * @extends Liquid
 */
class AprilSample extends Liquid {
  /**
   * Possible values for the April sample.
   * 
   * @category Titration
   * @subcategory Liquids
   * @access public
   * @type {Array<string, number>}
   */
  static aprilSampleValues = {
    "28429677": 0.02879671,
    "28409680": 0.03513884,
    "28389678": 0.03462461,
    "28359675": 0.17140898,
    "28329676": 0.03428180,
    "28329671": 0.09221803,
    "28329660": 0.03942407,
    "28329652": 0.04748029,
    "28289668": 0.29482345,
    "28209680": 0.03428180
  };

  static molarConcentration = this.aprilSampleValues["28429677"];
}

export default AprilSample;