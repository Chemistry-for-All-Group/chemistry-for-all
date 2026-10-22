import Cylinder from "./Cylinder.js";
import WaterTrough from "./WaterTrough.js";

describe("Cylinder", () => {
  let cylinder;
  let trough;
  let originalOffset;

  beforeEach(() => {
    cylinder = new Cylinder();
    trough = new WaterTrough();
    trough.fillCompletely();

    originalOffset = Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED;
    Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED = 0.25;
  });

  afterEach(() => {
    Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED = originalOffset;
  });

  function prepareInvertedCylinder() {
    cylinder.submergeInWaterTrough(trough);
    cylinder.invertInWaterTrough();
  }

  test("Should start empty, upright, and disconnected", () => {
    expect(cylinder.capacity).toBe(50);
    expect(cylinder.getCurrentLevel()).toBe(0);
    expect(cylinder.waterTrough).toBeNull();
    expect(cylinder.isInvertedInTrough).toBe(false);
    expect(cylinder.isLeveledWithTroughWater).toBe(false);
  });

  describe("submergeInWaterTrough", () => {
    test("Should attach to the trough without automatically filling", () => {
      cylinder.submergeInWaterTrough(trough);

      expect(cylinder.waterTrough).toBe(trough);
      expect(cylinder.getCurrentLevel()).toBe(0);
      expect(trough.getCurrentLevel()).toBe(2000);
    });
  });

  describe("invertInWaterTrough", () => {
    test("Should transfer 50 mL from trough to empty cylinder", () => {
      prepareInvertedCylinder();

      expect(cylinder.isInvertedInTrough).toBe(true);
      expect(cylinder.getCurrentLevel()).toBe(50);
      expect(trough.getCurrentLevel()).toBe(1950);
    });

    test("Should not invert without a trough", () => {
      cylinder.invertInWaterTrough();

      expect(cylinder.isInvertedInTrough).toBe(false);
      expect(cylinder.getCurrentLevel()).toBe(0);
    });

    test("Should not take more water when already inverted", () => {
      prepareInvertedCylinder();

      cylinder.invertInWaterTrough();

      expect(cylinder.getCurrentLevel()).toBe(50);
      expect(trough.getCurrentLevel()).toBe(1950);
    });

    test("Should only take available water", () => {
      trough.emptyCompletely();
      trough.addLiquid(20);

      prepareInvertedCylinder();

      expect(cylinder.getCurrentLevel()).toBe(20);
      expect(trough.getCurrentLevel()).toBe(0);
    });
  });

  describe("setIsLeveledWithTroughWater", () => {
    test("Should not level an upright cylinder", () => {
      cylinder.submergeInWaterTrough(trough);

      cylinder.setIsLeveledWithTroughWater(true);

      expect(cylinder.isLeveledWithTroughWater).toBe(false);
    });

    test("Should allow leveling and lowering an inverted cylinder", () => {
      prepareInvertedCylinder();

      cylinder.setIsLeveledWithTroughWater(true);
      expect(cylinder.isLeveledWithTroughWater).toBe(true);

      cylinder.setIsLeveledWithTroughWater(false);
      expect(cylinder.isLeveledWithTroughWater).toBe(false);
    });
  });

  describe("transferButane", () => {
    test("Should displace water back into the trough", () => {
      prepareInvertedCylinder();

      cylinder.transferButane(10);

      expect(cylinder.getCurrentLevel()).toBe(40);
      expect(trough.getCurrentLevel()).toBe(1960);
    });

    test("Should not displace water while upright", () => {
      cylinder.submergeInWaterTrough(trough);
      cylinder.fillCompletely();

      cylinder.transferButane(10);

      expect(cylinder.getCurrentLevel()).toBe(50);
      expect(trough.getCurrentLevel()).toBe(2000);
    });

    test("Should not displace water while leveled", () => {
      prepareInvertedCylinder();
      cylinder.setIsLeveledWithTroughWater(true);

      cylinder.transferButane(10);

      expect(cylinder.getCurrentLevel()).toBe(50);
      expect(trough.getCurrentLevel()).toBe(1950);
    });

    test("Should not displace more water than is available", () => {
      prepareInvertedCylinder();

      cylinder.transferButane(100);

      expect(cylinder.getCurrentLevel()).toBe(0);
      expect(trough.getCurrentLevel()).toBe(2000);
    });

    test("Should safely do nothing without a trough", () => {
      cylinder.fillCompletely();

      cylinder.transferButane(10);

      expect(cylinder.getCurrentLevel()).toBe(50);
    });
  });

  describe("getDisplacedLevel", () => {
    test("Should include the offset when not leveled", () => {
      prepareInvertedCylinder();
      cylinder.transferButane(10);

      expect(cylinder.getDisplacedLevel()).toBeCloseTo(10.25, 8);
    });

    test("Should report exact displacement when leveled", () => {
      prepareInvertedCylinder();
      cylinder.transferButane(10);
      cylinder.setIsLeveledWithTroughWater(true);

      expect(cylinder.getDisplacedLevel()).toBeCloseTo(10, 8);
    });
  });

  describe("removeFromWaterTrough", () => {
    test("Should return remaining water and reset position flags", () => {
      prepareInvertedCylinder();
      cylinder.transferButane(10);
      cylinder.setIsLeveledWithTroughWater(true);

      cylinder.removeFromWaterTrough();

      expect(cylinder.getCurrentLevel()).toBe(0);
      expect(trough.getCurrentLevel()).toBe(2000);
      expect(cylinder.waterTrough).toBeNull();
      expect(cylinder.isInvertedInTrough).toBe(false);
      expect(cylinder.isLeveledWithTroughWater).toBe(false);
    });

    test("Should retain water when removed upright", () => {
      cylinder.submergeInWaterTrough(trough);
      cylinder.addLiquid(20);

      cylinder.removeFromWaterTrough();

      expect(cylinder.getCurrentLevel()).toBe(20);
      expect(cylinder.waterTrough).toBeNull();
    });

    test("Should safely handle removal without a trough", () => {
      expect(() => cylinder.removeFromWaterTrough()).not.toThrow();
    });
  });

  test.todo(
    "Check water conservation when an already-filled cylinder is inverted"
  );
});