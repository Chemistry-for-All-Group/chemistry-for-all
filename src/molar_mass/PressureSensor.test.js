import PressureSensor from "./PressureSensor.js";

describe("PressureSensor", () => {
  const initialPressure = PressureSensor.pressure;

  afterEach(() => {
    PressureSensor.pressure = initialPressure;
  });

  test("Should initialize between 740 inclusive and 780 exclusive", () => {
    expect(initialPressure).toBeGreaterThanOrEqual(740);
    expect(initialPressure).toBeLessThan(780);
  });

  describe("pressureATM", () => {
    test("Should convert 760 torr to approximately 1 atmosphere", () => {
      PressureSensor.pressure = 760;

      expect(PressureSensor.pressureATM()).toBeCloseTo(1, 5);
    });

    test("Should convert 380 torr to approximately 0.5 atmospheres", () => {
      PressureSensor.pressure = 380;

      expect(PressureSensor.pressureATM()).toBeCloseTo(0.5, 5);
    });

    test("Should convert zero torr to zero atmospheres", () => {
      PressureSensor.pressure = 0;

      expect(PressureSensor.pressureATM()).toBe(0);
    });

    test("Should use the updated pressure reading", () => {
      PressureSensor.pressure = 1520;

      expect(PressureSensor.pressureATM()).toBeCloseTo(2, 5);
    });
  });
});
