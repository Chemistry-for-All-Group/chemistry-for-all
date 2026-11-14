import Liquid from "./Liquid.js";

/**
 * The March sample from the titration experiment.
 * 
 * @category Titration
 * @subcategory Liquids
 * @extends Liquid
 */
class MarchSample extends Liquid {
  /**
   * Possible values for the March sample.
   * 
   * @category Titration
   * @subcategory Liquids
   * @access public
   * @type {Array<string, number>}
   */
  static marchSampleValues = {
    "28429677": 0.03359616,
    "28409680": 0.03805279,
    "28389678": 0.03411039,
    "28359675": 0.05485087,
    "28329676": 0.03256771,
    "28329671": 0.05827905,
    "28329660": 0.06822077,
    "28329652": 0.10935893,
    "28289668": 0.10215975,
    "28209680": 0.05142269
  };

  static molarConcentration = this.marchSampleValues["28429677"];
}

export default MarchSample;