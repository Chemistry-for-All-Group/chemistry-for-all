import Thermometer from "./Thermometer.js";

describe("Thermometer", () => {
  const initialTemperature = Thermometer.temperature;

  afterEach(() => {
    Thermometer.temperature = initialTemperature;
  });

  test("Should initialize between 20 inclusive and 25.5 exclusive", () => {
    expect(initialTemperature).toBeGreaterThanOrEqual(20);
    expect(initialTemperature).toBeLessThan(25.5);
  });

  describe("temperatureKelvin", () => {
    test("Should convert zero Celsius to 273.15 Kelvin", () => {
      Thermometer.temperature = 0;

      expect(Thermometer.temperatureKelvin()).toBeCloseTo(273.15, 8);
    });

    test("Should convert room temperature to Kelvin", () => {
      Thermometer.temperature = 25;

      expect(Thermometer.temperatureKelvin()).toBeCloseTo(298.15, 8);
    });

    test("Should convert a negative Celsius temperature", () => {
      Thermometer.temperature = -10;

      expect(Thermometer.temperatureKelvin()).toBeCloseTo(263.15, 8);
    });

    test("Should preserve decimal precision", () => {
      Thermometer.temperature = 22.5;

      expect(Thermometer.temperatureKelvin()).toBeCloseTo(295.65, 8);
    });
  });
});