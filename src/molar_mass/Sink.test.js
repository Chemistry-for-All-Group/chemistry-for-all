import Sink from "./Sink.js";
import WaterTrough from "./WaterTrough.js";
import Cylinder from "./Cylinder.js";

describe("Sink", () => {
  let sink;
  let trough;
  let cylinder;

  beforeEach(() => {
    sink = new Sink();
    trough = new WaterTrough();
    cylinder = new Cylinder();
  });

  test("Should start off and empty", () => {
    expect(sink.isOn).toBe(false);
    expect(sink.objectsInSink).toStrictEqual([]);
  });

  describe("addObjectToSink", () => {
    test("Should add an object without filling it while off", () => {
      sink.addObjectToSink(trough);

      expect(sink.objectsInSink).toStrictEqual([trough]);
      expect(trough.getCurrentLevel()).toBe(0);
    });

    test("Should immediately fill an object while on", () => {
      sink.turnOnSink();
      sink.addObjectToSink(trough);

      expect(trough.getCurrentLevel()).toBe(2000);
    });
  });

  describe("turnOnSink", () => {
    test("Should fill every object already in the sink", () => {
      sink.addObjectToSink(trough);
      sink.addObjectToSink(cylinder);

      sink.turnOnSink();

      expect(sink.isOn).toBe(true);
      expect(trough.getCurrentLevel()).toBe(2000);
      expect(cylinder.getCurrentLevel()).toBe(50);
    });

    test("Should turn on safely when empty", () => {
      expect(() => sink.turnOnSink()).not.toThrow();
      expect(sink.isOn).toBe(true);
    });
  });

  describe("turnOffSink", () => {
    test("Should turn off without draining equipment", () => {
      sink.addObjectToSink(trough);
      sink.turnOnSink();

      sink.turnOffSink();

      expect(sink.isOn).toBe(false);
      expect(trough.getCurrentLevel()).toBe(2000);
    });

    test("Should stop automatically filling newly added equipment", () => {
      sink.turnOnSink();
      sink.turnOffSink();

      sink.addObjectToSink(cylinder);

      expect(cylinder.getCurrentLevel()).toBe(0);
    });
  });

  describe("removeObjectFromSink", () => {
    test("Should remove the requested object and retain the other", () => {
      sink.addObjectToSink(trough);
      sink.addObjectToSink(cylinder);

      sink.removeObjectFromSink(trough);

      expect(sink.objectsInSink).toStrictEqual([cylinder]);
    });

    test("Should not fill an object removed before the faucet turns on", () => {
      sink.addObjectToSink(trough);
      sink.removeObjectFromSink(trough);

      sink.turnOnSink();

      expect(trough.getCurrentLevel()).toBe(0);
    });

    test("Should preserve water in a removed object", () => {
      sink.addObjectToSink(trough);
      sink.turnOnSink();

      sink.removeObjectFromSink(trough);

      expect(sink.objectsInSink).toStrictEqual([]);
      expect(trough.getCurrentLevel()).toBe(2000);
    });

    test.todo(
      "BUG: removing an absent object should leave existing objects unchanged"
    );
  });
});