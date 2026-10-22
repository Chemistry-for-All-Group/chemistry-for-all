import WaterTrough from "./WaterTrough.js";
import FillableObject from "./FillableObject.js";

describe("WaterTrough", () => {
  let trough;

  beforeEach(() => {
    trough = new WaterTrough();
  });

  test("Should inherit from FillableObject", () => {
    expect(trough).toBeInstanceOf(FillableObject);
  });

  test("Should start empty with a capacity of 2000 mL", () => {
    expect(trough.capacity).toBe(2000);
    expect(trough.getCurrentLevel()).toBe(0);
  });

  test("Should fill to 2000 mL", () => {
    trough.fillCompletely();

    expect(trough.getCurrentLevel()).toBe(2000);
    expect(trough.isFull()).toBe(true);
  });

  test("Should cap added water at 2000 mL", () => {
    trough.addLiquid(2500);

    expect(trough.getCurrentLevel()).toBe(2000);
  });

  test("Should return the amount removed", () => {
    trough.fillCompletely();

    expect(trough.removeLiquid(50)).toBe(50);
    expect(trough.getCurrentLevel()).toBe(1950);
  });

  test("Should empty completely", () => {
    trough.fillCompletely();
    trough.emptyCompletely();

    expect(trough.getCurrentLevel()).toBe(0);
  });

  test("Should keep separate troughs independent", () => {
    const otherTrough = new WaterTrough();
    trough.fillCompletely();

    expect(otherTrough.getCurrentLevel()).toBe(0);
  });
});