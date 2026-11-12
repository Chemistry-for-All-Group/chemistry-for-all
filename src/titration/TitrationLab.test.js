/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";
import { readFileSync } from "node:fs";
import { TitrationLab, PIPET_VOLUME } from "./TitrationLab.js";
import SilverNitrate from "./liquids/SilverNitrate.js";
import MarchSample from "./liquids/MarchSample.js";
import Water from "./liquids/Water.js";

describe("TitrationLab", () => {
  let lab;

  beforeEach(() => {
    // 0.5 makes every random amount land exactly on its target.
    jest.spyOn(Math, "random").mockReturnValue(0.5);
    lab = new TitrationLab();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** Part A step 3: clamp the buret, rinse it, and fill it with 14 mL. */
  function setUpBuret() {
    lab.toggleClamp();
    lab.toggleBuretInClamp();
    lab.measureSilverNitrate();
    lab.rinseBuret();
    lab.pourIntoBuret();
  }

  /** Pipets 1 mL of a source into a beaker, fills it to a mark, and sets it up for titrating. */
  function prepareBeaker(source, beaker = "beaker1", mark = 20) {
    lab.setPipetSource(source);
    lab.drawSample();
    lab.setPipetTarget(beaker);
    lab.releasePipet();
    lab.setBeakerMark(beaker, mark);
    lab.fillBeakerToMark(beaker);
    lab.toggleBeakerUnderBuret(beaker);
    lab.setElectrodeTarget(beaker);
    lab.placeElectrodes();
  }

  function actionLabels(stationId) {
    const station = lab.stations().find((item) => item.id === stationId);
    return station.actions().filter(Boolean).map((action) => action.label);
  }

  describe("equipment capacities", () => {
    test("Should use the capacities given to the equipment", () => {
      expect(lab.equipment.cylinder25Ml.capacity).toBe(25);
      expect(lab.equipment.cylinder10Ml.capacity).toBe(10);
      expect(lab.equipment.wasteBeaker.capacity).toBe(600);
      expect(lab.equipment.beaker1.capacity).toBe(50);
      expect(lab.equipment.buret.capacity).toBe(50);
      expect(lab.equipment.serologicalPipet.capacity).toBe(2);
      expect(lab.equipment.volumetricFlask.capacity).toBe(10);
    });
  });

  describe("buret setup", () => {
    test("Should need the clamp on the ring stand before clamping the buret", () => {
      expect(actionLabels("ringStand")).toStrictEqual(["Attach clamp to ring stand"]);
      lab.toggleClamp();
      expect(actionLabels("ringStand")).toStrictEqual(["Take clamp off ring stand", "Clamp buret to ring stand"]);
      lab.toggleBuretInClamp();
      expect(actionLabels("ringStand")).toStrictEqual(["Take buret out of clamp"]);
      expect(lab.isBuretClamped()).toBe(true);
    });

    test("Should rinse the buret into the waste beaker, then fill it with the rest", () => {
      setUpBuret();
      expect(lab.equipment.wasteBeaker.getCurrentLevel()).toBeCloseTo(1);
      expect(lab.buret.getCurrentLevel()).toBeCloseTo(14);
      // 14 mL in a 50 mL buret sits at the 36 mL mark.
      expect(lab.readBuret()).toBe("36.00");
      expect(lab.silverNitrateCylinder.getCurrentLevel()).toBe(0);
    });

    test("Should refill the buret with another 10 mL", () => {
      setUpBuret();
      lab.setSilverNitrateAmount(10);
      lab.measureSilverNitrate();
      lab.pourIntoBuret();
      expect(lab.readBuret()).toBe("26.00");
    });

    test("Should not release silver nitrate unless the buret is clamped", () => {
      expect(lab.addTitrant()).toContain("Clamp the buret");
    });

    test("Should say when the buret is empty", () => {
      lab.toggleClamp();
      lab.toggleBuretInClamp();
      expect(lab.addTitrant()).toContain("The buret is empty");
    });

    test("Should spill silver nitrate when no beaker is under the buret", () => {
      setUpBuret();
      expect(lab.addTitrant()).toContain("drips onto the lab bench");
      expect(Number(lab.readBuret())).toBeCloseTo(36.5);
    });
  });

  describe("pipet", () => {
    test("Should rinse with a sample into the waste beaker", () => {
      lab.setPipetRinseSource("march");
      expect(lab.rinsePipet()).toContain("rinse the pipet");
      expect(lab.pipet.getCurrentLevel()).toBe(0);
      expect(lab.equipment.wasteBeaker.liquids.has(MarchSample)).toBe(true);
      expect(lab.stations().find((station) => station.id === "pipet").state()[1]).toContain("March bay water");
    });

    test("Should draw the sodium chloride standard only from the 10 mL cylinder", () => {
      lab.setPipetSource("sodiumChloride");
      expect(lab.drawSample()).toContain("not enough");
      lab.measureSodiumChloride();
      lab.drawSample();
      expect(lab.pipet.getCurrentLevel()).toBeCloseTo(PIPET_VOLUME);
      expect(lab.sodiumChlorideCylinder.getCurrentLevel()).toBeCloseTo(4);
    });

    test("Should not draw into a pipet that already holds liquid", () => {
      lab.setPipetSource("march");
      lab.drawSample();
      expect(lab.drawSample()).toContain("already holds liquid");
    });

    test("Should record the pipet volume into the next empty sample", () => {
      lab.setPipetSource("march");
      lab.drawSample();
      lab.readPipet();
      expect(lab.recordReading("sampleVolume")).toContain("sodium chloride standard, volume of sample");
      expect(lab.report.get("practice-sampleVolume")).toBe("1.00");
      lab.drawSample();
      expect(lab.recordTarget("sampleVolume")).toBe("march-sampleVolume");
    });
  });

  describe("dilution", () => {
    test("Should dilute 1 mL of sample tenfold in the volumetric flask", () => {
      lab.setPipetSource("march");
      lab.drawSample();
      lab.setPipetTarget("flask");
      lab.releasePipet();
      expect(actionLabels("flask")).toContain("Fill to the mark with distilled water and mix");
      lab.fillFlaskToMark();
      expect(lab.flask.getCurrentLevel()).toBeCloseTo(10);
      expect(actionLabels("flask")).not.toContain("Fill to the mark with distilled water and mix");

      // 1 mL from the flask holds a tenth of a milliliter of bay water.
      lab.setPipetSource("flask");
      lab.drawSample();
      lab.setPipetTarget("beaker1");
      lab.releasePipet();
      expect(lab.equipment.beaker1.liquids.get(MarchSample)).toBeCloseTo(0.1);
      expect(lab.equipment.beaker1.liquids.get(Water)).toBeCloseTo(0.9);
    });
  });

  describe("beakers", () => {
    test("Should fill a beaker to the chosen mark with distilled water", () => {
      lab.setBeakerMark("beaker2", 20);
      lab.fillBeakerToMark("beaker2");
      expect(lab.equipment.beaker2.getCurrentLevel()).toBeCloseTo(20);
      expect(lab.fillBeakerToMark("beaker2")).toContain("already filled");
    });

    test("Should only offer one beaker under the buret at a time", () => {
      lab.toggleBeakerUnderBuret("beaker1");
      expect(actionLabels("beaker1")).toContain("Take beaker out from under buret");
      expect(actionLabels("beaker2")).not.toContain("Place beaker under buret");
    });

    test("Should empty and rinse a beaker into the waste beaker", () => {
      lab.fillBeakerToMark("beaker1");
      lab.emptyAndRinse("beaker1");
      expect(lab.equipment.beaker1.getCurrentLevel()).toBe(0);
      expect(lab.equipment.wasteBeaker.getCurrentLevel()).toBeCloseTo(15);
      lab.disposeWaste();
      expect(lab.equipment.wasteBeaker.getCurrentLevel()).toBe(0);
    });
  });

  describe("voltmeter", () => {
    test("Should give no reading without electrodes in a beaker", () => {
      expect(lab.readBuretAndVoltmeter()).toContain("electrodes are not in a beaker");
      expect(lab.hasReading("titration")).toBe(false);
    });

    test("Should give no reading when the electrodes are not covered", () => {
      lab.setPipetSource("march");
      lab.drawSample();
      lab.releasePipet();
      lab.placeElectrodes();
      expect(lab.readBuretAndVoltmeter()).toContain("not enough liquid");
    });

    test("Should give no steady reading without a chloride sample", () => {
      lab.fillBeakerToMark("beaker1");
      lab.placeElectrodes();
      expect(lab.readBuretAndVoltmeter()).toContain("does not settle");
    });

    test("Should jump at the practice titration's calculated equivalence point", () => {
      lab.measureSodiumChloride();
      setUpBuret();
      prepareBeaker("sodiumChloride", "beaker1", 10);
      const start = Number(lab.readBuret());
      const voltageAfter = (added) => {
        lab.buret.transferLiquid(lab.equipment.beaker1, start + added - lab.buret.getBuretReading());
        return Number(lab.voltage().millivolts);
      };
      // 1 mL of 0.040 M chloride needs 4 mL of 0.010 M silver nitrate.
      const atStart = voltageAfter(0);
      const before = voltageAfter(3.5);
      const after = voltageAfter(4.5);
      expect(after - before).toBeGreaterThan(2 * (before - atStart));
      expect(lab.equipment.beaker1.liquids.has(SilverNitrate)).toBe(true);
    });
  });

  describe("recording titration readings", () => {
    test("Should record buret and voltmeter readings to the chosen titration", () => {
      lab.measureSodiumChloride();
      setUpBuret();
      prepareBeaker("sodiumChloride", "beaker1", 10);
      lab.readBuretAndVoltmeter();
      expect(actionLabels("buret")).toContain("Record reading in report");

      lab.setTitrationTarget("marchFast");
      expect(lab.recordTitrationReading()).toContain("Recorded reading 1 for the March fast titration");
      expect(lab.report.readings.marchFast).toStrictEqual([{ buret: "36.00", voltage: lab.voltage().millivolts }]);
      expect(lab.hasReading("titration")).toBe(false);
      expect(actionLabels("buret")).not.toContain("Record reading in report");
    });

    test("Should not record a reading taken before something changed", () => {
      lab.measureSodiumChloride();
      setUpBuret();
      prepareBeaker("sodiumChloride");
      lab.readBuretAndVoltmeter();
      lab.addTitrant();
      expect(lab.recordTitrationReading()).toContain("Read the buret and voltmeter first");
    });

    test("Should clear and remove readings in the report", () => {
      lab.report.addReading("aprilTrial1", "30.00", "100.0");
      lab.report.addReading("aprilTrial1", "31.00", "110.0");
      expect(lab.report.removeLastReading("aprilTrial1")).toStrictEqual({ buret: "31.00", voltage: "110.0" });
      lab.report.clearReadings("aprilTrial1");
      expect(lab.report.readings.aprilTrial1).toHaveLength(0);
    });
  });

  describe("page", () => {
    beforeEach(() => {
      // Use the real templates from titration.html.
      const html = readFileSync(new URL("../../titration.html", import.meta.url), "utf8");
      document.documentElement.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, "");
      lab.start();
    });

    const main = () => document.getElementById("main");
    const button = (label) => [...main().querySelectorAll("button")].find((item) => item.textContent === label);

    test("Should list every station on the lab bench", () => {
      const labels = [...main().querySelectorAll("ol button")].map((item) => item.textContent);
      expect(labels).toStrictEqual(lab.stations().map((station) => station.title));
    });

    test("Should run an action and announce the result", () => {
      button("Ring stand and clamp").click();
      expect(main().querySelector("h2").textContent).toBe("Ring stand and clamp");
      button("Attach clamp to ring stand").click();
      expect(document.getElementById("announcer").textContent).toContain("You attach the butterfly clamp");
      expect(button("Clamp buret to ring stand")).toBeDefined();
    });

    test("Should label each dropdown next to its button", () => {
      button("Buret and voltmeter").click();
      expect(document.querySelector('label[for="buret-increment"]').textContent).toBe("Amount per turn");
      expect(document.getElementById("buret-increment").value).toBe("0.5");
    });

    test("Should lay out the report like the lab's data summary", () => {
      document.querySelector('nav [data-view="report"]').click();
      expect([...main().querySelectorAll("h4")].map((heading) => heading.textContent))
        .toStrictEqual(["Practice: sodium chloride standard", "March bay water", "April bay water"]);
      expect([...main().querySelectorAll("caption")].map((caption) => caption.textContent)).toStrictEqual([
        "Practice titration readings",
        "March fast titration readings", "March trial 1 readings", "March trial 2 readings",
        "April fast titration readings", "April trial 1 readings", "April trial 2 readings",
      ]);
      expect(document.querySelector('label[for="report-march-diluted"]').textContent).toBe("Was this sample diluted?");
      expect(document.getElementById("report-april-salinity")).not.toBeNull();
    });

    test("Should show recorded readings in a table and remove them", () => {
      lab.report.addReading("practice", "36.00", "82.8");
      document.querySelector('nav [data-view="report"]').click();

      const table = main().querySelector("table");
      expect(table.hidden).toBe(false);
      expect([...table.querySelectorAll("tbody td")].map((cell) => cell.textContent)).toStrictEqual(["36.00", "82.8"]);

      button("Remove last reading from the practice titration").click();
      expect(lab.report.readings.practice).toHaveLength(0);
      expect(main().querySelector("table").hidden).toBe(true);
    });
  });
});
