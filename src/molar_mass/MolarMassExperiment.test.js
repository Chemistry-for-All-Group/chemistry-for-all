import { jest } from "@jest/globals";
import { MolarMassExperiment } from "./MolarMassExperiment.js";
import PressureSensor from "./PressureSensor.js";
import Thermometer from "./Thermometer.js";
import Cylinder from "./Cylinder.js";

describe("MolarMassExperiment", () => {
  let experiment;
  let originalPressure;
  let originalTemperature;
  let originalOffset;

  beforeEach(() => {
    originalPressure = PressureSensor.pressure;
    originalTemperature = Thermometer.temperature;
    originalOffset = Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED;

    PressureSensor.pressure = 760;
    Thermometer.temperature = 25;
    Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED = 0.25;

    jest.spyOn(Math, "random").mockReturnValue(0.5);
    experiment = new MolarMassExperiment();
  });

  afterEach(() => {
    PressureSensor.pressure = originalPressure;
    Thermometer.temperature = originalTemperature;
    Cylinder.AMOUNT_TO_ADD_WHEN_NOT_LEVELED = originalOffset;
    jest.restoreAllMocks();
  });

  function prepareCollection() {
    experiment.moveTrough("sink");
    experiment.toggleSink();
    experiment.toggleSink();
    experiment.moveTrough("bench");

    experiment.moveCylinder("trough");
    experiment.invertCylinder();

    experiment.toggleTubingAtLighter();
    experiment.toggleTubingAtCylinder();
  }

  function actionLabels(stationId) {
    const station = experiment.stations().find(
      (item) => item.id === stationId
    );

    return station.actions().filter(Boolean).map(
      (action) => action.label
    );
  }

  test("Should start with equipment on the bench", () => {
    expect(experiment.troughLocation).toBe("bench");
    expect(experiment.cylinderLocation).toBe("bench");
    expect(experiment.lighterLocation).toBe("bench");
    expect(experiment.sink.isOn).toBe(false);
    expect(experiment.scale.getCurrentMass()).toBe(0);
  });

  describe("moving and filling equipment", () => {
    test("Should fill the trough in the sink and remove it afterward", () => {
      experiment.moveTrough("sink");
      expect(experiment.sink.objectsInSink).toContain(experiment.trough);

      expect(experiment.toggleSink()).toContain("turn on");
      expect(experiment.trough.getCurrentLevel()).toBe(2000);

      expect(experiment.toggleSink()).toContain("turn off");
      expect(experiment.sink.isOn).toBe(false);

      experiment.moveTrough("bench");

      expect(experiment.troughLocation).toBe("bench");
      expect(experiment.sink.objectsInSink).not.toContain(
        experiment.trough
      );
      expect(experiment.trough.getCurrentLevel()).toBe(2000);
    });

    test("Should fill a cylinder moved into a running sink", () => {
      experiment.toggleSink();
      experiment.moveCylinder("sink");

      expect(experiment.cylinder.getCurrentLevel()).toBe(50);
      expect(experiment.sink.objectsInSink).toContain(
        experiment.cylinder
      );

      experiment.moveCylinder("bench");

      expect(experiment.sink.objectsInSink).not.toContain(
        experiment.cylinder
      );
      expect(experiment.cylinderLocation).toBe("bench");
    });

    test("Should place and remove the lighter on the scale", () => {
      experiment.moveLighter("scale");

      expect(experiment.lighterLocation).toBe("scale");
      expect(experiment.scale.objectsOnScale).toStrictEqual([
        experiment.lighter,
      ]);

      experiment.moveLighter("bench");

      expect(experiment.lighterLocation).toBe("bench");
      expect(experiment.scale.getCurrentMass()).toBe(0);
    });
  });

  describe("troughWater", () => {
    test.each([
      [0, "empty"],
      [1, "partly full of water"],
      [1899, "partly full of water"],
      [1900, "full of water"],
      [2000, "full of water"],
    ])("Should describe %s mL as %s", (amount, description) => {
      experiment.trough.addLiquid(amount);

      expect(experiment.troughWater()).toBe(description);
    });
  });

  describe("gasInCylinder", () => {
    test.each([
      [50, "The cylinder is full of water with no gas at the top."],
      [40, "There is a small pocket of gas at the top of the cylinder."],
      [37.5, "Gas fills roughly half of the cylinder."],
      [12.5, "Gas fills most of the cylinder."],
      [0, "The cylinder is completely full of gas."],
    ])("Should describe a water level of %s mL", (water, description) => {
      experiment.cylinder.addLiquid(water);

      expect(experiment.gasInCylinder()).toBe(description);
    });
  });

  describe("pressLighterValve", () => {
    test("Should report an empty lighter", () => {
      experiment.lighter.mlOfButane = 0;

      expect(experiment.pressLighterValve()).toContain("out of butane");
      expect(experiment.lighter.mlOfButane).toBe(0);
    });

    test("Should report escaping gas without tubing", () => {
      expect(experiment.pressLighterValve()).toContain(
        "No tubing is attached"
      );
      expect(experiment.lighter.mlOfButane).toBeCloseTo(299.5, 8);
    });

    test("Should report an unattached cylinder outlet", () => {
      experiment.toggleTubingAtLighter();

      expect(experiment.pressLighterValve()).toContain(
        "outlet is not under the cylinder"
      );
    });

    test("Should not collect gas in an upright cylinder", () => {
      experiment.moveCylinder("trough");
      experiment.toggleTubingAtLighter();
      experiment.toggleTubingAtCylinder();

      expect(experiment.pressLighterValve()).toContain(
        "not positioned over the outlet"
      );
      expect(experiment.cylinder.getCurrentLevel()).toBe(0);
    });

    test("Should collect gas through the complete equipment setup", () => {
      prepareCollection();
      const initialMass = experiment.lighter.getMass();

      expect(experiment.pressLighterValve()).toContain(
        "rise into the cylinder"
      );

      expect(experiment.lighter.mlOfButane).toBeCloseTo(299.5, 8);
      expect(experiment.lighter.getMass()).toBeLessThan(initialMass);
      expect(experiment.cylinder.getCurrentLevel()).toBeCloseTo(49.5, 8);
      expect(experiment.trough.getCurrentLevel()).toBeCloseTo(1950.5, 8);

      experiment.setCylinderLeveled(true);

      expect(experiment.cylinder.getDisplacedLevel()).toBeCloseTo(0.5, 8);
      expect(experiment.readCylinder()).toContain("0.5 milliliters");
    });

    test("Should stop collecting while leveled and resume when lowered", () => {
      prepareCollection();
      experiment.setCylinderLeveled(true);

      expect(experiment.pressLighterValve()).toContain(
        "not positioned over the outlet"
      );
      expect(experiment.cylinder.getCurrentLevel()).toBe(50);

      experiment.setCylinderLeveled(false);
      experiment.pressLighterValve();

      expect(experiment.cylinder.getCurrentLevel()).toBeCloseTo(49.5, 8);
      expect(experiment.lighter.mlOfButane).toBeCloseTo(299, 8);
    });
  });

  describe("disconnecting equipment", () => {
    test("Should toggle both tubing connections off", () => {
      prepareCollection();

      experiment.toggleTubingAtLighter();
      experiment.toggleTubingAtCylinder();

      expect(experiment.lighter.connectedTubing).toBeNull();
      expect(experiment.tubing.connectedCylinder).toBeNull();
    });

    test("Should disconnect the outlet when removing the cylinder", () => {
      prepareCollection();

      experiment.moveCylinder("bench");

      expect(experiment.cylinderLocation).toBe("bench");
      expect(experiment.cylinder.waterTrough).toBeNull();
      expect(experiment.tubing.connectedCylinder).toBeNull();
      expect(experiment.trough.getCurrentLevel()).toBe(2000);
    });
  });

  describe("measurement messages", () => {
    test("Should format an empty scale reading to three decimals", () => {
      expect(experiment.readScale()).toBe(
        "The scale reads 0.000 grams."
      );
    });

    test("Should report temperature and pressure with units", () => {
      expect(experiment.readThermometer()).toBe(
        "The thermometer reads 25.0 degrees Celsius."
      );
      expect(experiment.readBarometer()).toBe(
        "The barometer reads 760.0 torr."
      );
    });

    test("Should describe an upright cylinder's water level", () => {
      experiment.cylinder.addLiquid(20);

      expect(experiment.readCylinder()).toBe(
        "The upright cylinder holds 20.0 milliliters of water."
      );
    });

    test("Should identify an inverted cylinder that is not leveled", () => {
      prepareCollection();

      expect(experiment.readCylinder()).toContain(
        "not level with the trough water"
      );
    });
  });

  describe("stations", () => {
    test("Should provide all eight stations", () => {
      expect(experiment.stations().map((station) => station.id))
        .toStrictEqual([
          "sink",
          "trough",
          "cylinder",
          "tubing",
          "lighter",
          "scale",
          "thermometer",
          "barometer",
        ]);
    });

    test("Should execute the sink action and update its label", () => {
      const sinkStation = experiment.stations().find(
        (station) => station.id === "sink"
      );

      expect(sinkStation.actions()[0].label).toBe("Turn on faucet");
      sinkStation.actions()[0].run();

      expect(experiment.sink.isOn).toBe(true);
      expect(sinkStation.actions()[0].label).toBe("Turn off faucet");
    });

    test("Should offer inversion only after moving into the trough", () => {
      const label = "Turn cylinder upside down under the water";

      expect(actionLabels("cylinder")).not.toContain(label);

      experiment.moveCylinder("trough");

      expect(actionLabels("cylinder")).toContain(label);
    });

    test("Should hide the scale action while tubing is attached", () => {
      expect(actionLabels("lighter")).toContain("Place lighter on scale");

      experiment.toggleTubingAtLighter();

      expect(actionLabels("lighter")).not.toContain(
        "Place lighter on scale"
      );
    });

    test("Should offer removal when the lighter is on the scale", () => {
      experiment.moveLighter("scale");

      expect(actionLabels("lighter")).toStrictEqual([
        "Take lighter off scale",
      ]);
    });
  });

  test.todo("Test start() and rendered page actions in jsdom");
  test.todo("Define handling of invalid movement destinations");
  test.todo("Prevent repeated placement from duplicating the lighter on the scale");
});