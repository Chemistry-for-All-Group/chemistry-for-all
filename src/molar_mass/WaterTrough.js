import FillableObject from "./FillableObject.js";

class WaterTrough extends FillableObject {
  // Capacity should not matter for molar mass experiment, so 100 is arbitrary
  capacity = 2000;
}

export default WaterTrough;