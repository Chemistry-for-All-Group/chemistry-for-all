import FillableObject from "./FillableObject.js";

describe("FillableObject", () => {
  let object;

  beforeEach(() => {
    object = new FillableObject();
    object.capacity = 100;
  });

  describe("initial state", () => {
    test("Should start empty", () => {
      expect(object.getCurrentLevel()).toBe(0);
      expect(object.isFull()).toBe(false);
    });
  });

  describe("fillCompletely and emptyCompletely", () => {
    test("Should fill to capacity", () => {
      object.fillCompletely();

      expect(object.getCurrentLevel()).toBe(100);
      expect(object.isFull()).toBe(true);
    });

    test("Should empty a filled object", () => {
      object.fillCompletely();
      object.emptyCompletely();

      expect(object.getCurrentLevel()).toBe(0);
      expect(object.isFull()).toBe(false);
    });

    test("Should allow repeated filling and emptying", () => {
      object.fillCompletely();
      object.fillCompletely();
      expect(object.getCurrentLevel()).toBe(100);

      object.emptyCompletely();
      object.emptyCompletely();
      expect(object.getCurrentLevel()).toBe(0);
    });
  });

  describe("addLiquid", () => {
    test("Should add liquid to the existing amount", () => {
      object.addLiquid(20);
      object.addLiquid(30);

      expect(object.getCurrentLevel()).toBe(50);
      expect(object.isFull()).toBe(false);
    });

    test("Should become full at exactly capacity", () => {
      object.addLiquid(100);

      expect(object.isFull()).toBe(true);
    });

    test("Should not exceed capacity", () => {
      object.addLiquid(90);
      object.addLiquid(50);

      expect(object.getCurrentLevel()).toBe(100);
    });

    test("Should leave the level unchanged when adding zero", () => {
      object.addLiquid(25);
      object.addLiquid(0);

      expect(object.getCurrentLevel()).toBe(25);
    });

    test("Should support decimal amounts", () => {
      object.addLiquid(0.1);
      object.addLiquid(0.2);

      expect(object.getCurrentLevel()).toBeCloseTo(0.3, 10);
    });
  });

  describe("removeLiquid", () => {
    test("Should return the amount actually removed", () => {
      object.addLiquid(60);

      const removed = object.removeLiquid(20);

      expect(removed).toBe(20);
      expect(object.getCurrentLevel()).toBe(40);
    });

    test("Should remove exactly the remaining amount", () => {
      object.addLiquid(30);

      expect(object.removeLiquid(30)).toBe(30);
      expect(object.getCurrentLevel()).toBe(0);
    });

    test("Should not remove more than is available", () => {
      object.addLiquid(30);

      expect(object.removeLiquid(100)).toBe(30);
      expect(object.getCurrentLevel()).toBe(0);
    });

    test("Should return zero when already empty", () => {
      expect(object.removeLiquid(10)).toBe(0);
      expect(object.getCurrentLevel()).toBe(0);
    });

    test("Should leave the level unchanged when removing zero", () => {
      object.addLiquid(30);

      expect(object.removeLiquid(0)).toBe(0);
      expect(object.getCurrentLevel()).toBe(30);
    });
  });

  test.todo("Define and test handling of negative liquid amounts");
  test.todo("Define and test handling of NaN and nonnumeric amounts");
});