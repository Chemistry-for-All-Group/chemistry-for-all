import FillableObject from "./FillableObject.js";

export default class WaterTrough extends FillableObject {
  // Capacity should not matter for molar mass experiment, so 100 is arbitrary
  capacity = 2000;
}