import { jest } from "@jest/globals";
import Tubing from "./Tubing.js";

describe("Tubing", () => {
  let tubing;
  let cylinder;

  beforeEach(() => {
    tubing = new Tubing();
    cylinder = {
      transferButane: jest.fn(),
    };
  });

  test("Should start disconnected", () => {
    expect(tubing.connectedCylinder).toBeNull();
  });

  describe("connectCylinder", () => {
    test("Should connect a cylinder", () => {
      tubing.connectCylinder(cylinder);

      expect(tubing.connectedCylinder).toBe(cylinder);
    });

    test("Should not replace an existing connection", () => {
      const otherCylinder = { transferButane: jest.fn() };

      tubing.connectCylinder(cylinder);
      tubing.connectCylinder(otherCylinder);

      expect(tubing.connectedCylinder).toBe(cylinder);
    });
  });

  describe("transferButane", () => {
    test("Should forward the exact amount once", () => {
      tubing.connectCylinder(cylinder);

      tubing.transferButane(0.5);

      expect(cylinder.transferButane).toHaveBeenCalledTimes(1);
      expect(cylinder.transferButane).toHaveBeenCalledWith(0.5);
    });

    test("Should do nothing when disconnected", () => {
      expect(() => tubing.transferButane(0.5)).not.toThrow();
      expect(cylinder.transferButane).not.toHaveBeenCalled();
    });

    test("Should stop forwarding after disconnection", () => {
      tubing.connectCylinder(cylinder);
      tubing.removeCylinder();

      tubing.transferButane(0.5);

      expect(cylinder.transferButane).not.toHaveBeenCalled();
    });
  });

  describe("removeCylinder", () => {
    test("Should clear the connection", () => {
      tubing.connectCylinder(cylinder);
      tubing.removeCylinder();

      expect(tubing.connectedCylinder).toBeNull();
    });

    test("Should allow another cylinder to connect afterward", () => {
      const otherCylinder = { transferButane: jest.fn() };
      tubing.connectCylinder(cylinder);
      tubing.removeCylinder();

      tubing.connectCylinder(otherCylinder);

      expect(tubing.connectedCylinder).toBe(otherCylinder);
    });
  });
});