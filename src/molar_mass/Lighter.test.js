import { jest } from "@jest/globals";
import Lighter from "./Lighter.js";
import PressureSensor from "./PressureSensor.js";
import Thermometer from "./Thermometer.js";

describe("Lighter", () => {
  let lighter;

  beforeEach(() => {
    lighter = new Lighter();

    // A random value of 0.5 produces zero release error.
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    // Restore original functions after every test.
    jest.restoreAllMocks();
  });

  describe("initial state", () => {
    test("Should start with a 14 g body and 300 mL of butane", () => {
      expect(lighter.mass).toBe(14);
      expect(lighter.mlOfButane).toBe(300);
      expect(lighter.connectedTubing).toBeNull();
    });
  });

  describe("litersButane", () => {
    test("Should convert 300 mL to 0.3 L", () => {
      expect(lighter.litersButane()).toBeCloseTo(0.3, 10);
    });

    test("Should convert zero mL to zero L", () => {
      lighter.mlOfButane = 0;

      expect(lighter.litersButane()).toBe(0);
    });
  });

  describe("getMass and getMassButane", () => {
    test("Should return only the body mass when empty", () => {
      lighter.mlOfButane = 0;

      expect(lighter.getMassButane()).toBe(0);
      expect(lighter.getMass()).toBe(14);
    });

    test("Should lose mass after releasing butane", () => {
      const initialMass = lighter.getMass();

      lighter.releaseButane(10);

      expect(lighter.getMass()).toBeLessThan(initialMass);
      expect(lighter.getMass()).toBeGreaterThanOrEqual(14);
    });

    test("Should calculate the mass of a known gas volume", () => {
      jest.spyOn(PressureSensor, "pressureATM").mockReturnValue(1);
      jest.spyOn(Thermometer, "temperatureKelvin")
        .mockReturnValue(273.15);

      // With the project's gas constant, this volume represents
      // 0.001 mole at 1 atmosphere and 273.15 Kelvin.
      lighter.mlOfButane = 22.414689;

      expect(lighter.getMassButane()).toBeCloseTo(0.0581222, 8);
      expect(lighter.getMass()).toBeCloseTo(14.0581222, 8);
    });
  });

  describe("releaseButane", () => {
    test("Should release 0.5 mL by default with zero random error", () => {
      lighter.releaseButane();

      expect(lighter.mlOfButane).toBeCloseTo(299.5, 8);
    });

    test("Should support a custom release amount", () => {
      lighter.releaseButane(2);

      expect(lighter.mlOfButane).toBeCloseTo(298, 8);
    });

    test("Should apply the lower random release offset", () => {
      Math.random.mockReturnValue(0);

      lighter.releaseButane(0.5);

      expect(lighter.mlOfButane).toBeCloseTo(299.6, 8);
    });

    test("Should apply a positive random release offset", () => {
      Math.random.mockReturnValue(0.75);

      lighter.releaseButane(0.5);

      expect(lighter.mlOfButane).toBeCloseTo(299.45, 8);
    });

    test("Should clamp a calculated negative release to zero", () => {
      Math.random.mockReturnValue(0);

      lighter.releaseButane(0.05);

      expect(lighter.mlOfButane).toBe(300);
    });

    test("Should transfer only the remaining butane", () => {
      const tubing = {
        transferButane: jest.fn(),
      };

      lighter.mlOfButane = 0.2;
      lighter.connectTubing(tubing);

      lighter.releaseButane(1);

      expect(lighter.mlOfButane).toBe(0);
      expect(tubing.transferButane).toHaveBeenCalledTimes(1);
      expect(tubing.transferButane).toHaveBeenCalledWith(0.2);
    });

    test("Should stay empty when released again", () => {
      lighter.mlOfButane = 0;

      lighter.releaseButane();

      expect(lighter.mlOfButane).toBe(0);
    });

    test("Should forward the released amount to connected tubing", () => {
      const tubing = {
        transferButane: jest.fn(),
      };

      lighter.connectTubing(tubing);

      lighter.releaseButane();

      expect(tubing.transferButane).toHaveBeenCalledTimes(1);
      expect(tubing.transferButane).toHaveBeenCalledWith(0.5);
    });
  });

  describe("connectTubing and removeTubing", () => {
    test("Should retain the first connection until removed", () => {
      const first = {
        transferButane: jest.fn(),
      };
      const second = {
        transferButane: jest.fn(),
      };

      lighter.connectTubing(first);
      lighter.connectTubing(second);

      expect(lighter.connectedTubing).toBe(first);

      lighter.removeTubing();

      expect(lighter.connectedTubing).toBeNull();

      lighter.connectTubing(second);

      expect(lighter.connectedTubing).toBe(second);
    });

    test("Should stop forwarding after tubing is removed", () => {
      const tubing = {
        transferButane: jest.fn(),
      };

      lighter.connectTubing(tubing);
      lighter.removeTubing();

      lighter.releaseButane();

      expect(tubing.transferButane).not.toHaveBeenCalled();
      expect(lighter.mlOfButane).toBeCloseTo(299.5, 8);
    });
  });
});