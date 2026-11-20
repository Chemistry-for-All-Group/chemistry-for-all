import FillableObject from "./FillableObject.js";

/**
 * Represents a plastic container that can be filled with water.
 * 
 * @category Molar Mass
 * @extends FillableObject
 */
class WaterTrough extends FillableObject {
  // Capacity is arbitrary, since for the molar mass experiment 
  // it only needs to be able to be able to fill the cylinder.
  capacity = 2000;
}

export default WaterTrough;