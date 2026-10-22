import WeightedObject from "./WeightedObject.js";

describe("WeightedObject", () => {
  describe("constructor", () => {
    test("Should store the supplied mass", () => {
      const object = new WeightedObject(25);

      expect(object.mass).toBe(25);
    });
  });

  describe("getMass", () => {
    test("Should return a positive mass", () => {
      const object = new WeightedObject(25);

      expect(object.getMass()).toBe(25);
    });

    test("Should return zero", () => {
      const object = new WeightedObject(0);

      expect(object.getMass()).toBe(0);
    });

    test("Should preserve a decimal mass", () => {
      const object = new WeightedObject(14.125);

      expect(object.getMass()).toBe(14.125);
    });

    test("Should return a negative mass unchanged", () => {
      const object = new WeightedObject(-5);

      expect(object.getMass()).toBe(-5);
    });

    test("Should keep objects independent", () => {
      const first = new WeightedObject(25);
      const second = new WeightedObject(2);

      expect(first.getMass()).toBe(25);
      expect(second.getMass()).toBe(2);
    });
  });
});