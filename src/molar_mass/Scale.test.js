import Scale from "./Scale";
import WeightedObject from "./WeightedObject";

describe("Scale", () => {
  describe("addObjectToScale", () => {
    let scale;
    let weightedObjects;

    beforeAll(() => {
      scale = new Scale();
      // Various weighted objects to add
      weightedObjects = [ 
        new WeightedObject(25),
        new WeightedObject(2),
      ];
    });

    test("Should start with no objects on the scale", () => {
      expect(scale.objectsOnScale.length).toStrictEqual(0);
    });

    test("Should add object to the empty array", () => {
      scale.addObjectToScale(weightedObjects[0]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[0]]);
    });

    test("Should add object to end array if other items are present", () => {
      scale.addObjectToScale(weightedObjects[1]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[0], weightedObjects[1]]);
    });
  });

  describe("removeObjectFromScale", () => {
    let scale;
    let weightedObjects;

    beforeEach(() => {
      scale = new Scale();
      // Various weighted objects to add and remove
      weightedObjects = [ 
        new WeightedObject(25),
        new WeightedObject(2),
        new WeightedObject(1),
        new WeightedObject(5)
      ];

      scale.addObjectToScale(weightedObjects[0]);
      scale.addObjectToScale(weightedObjects[1]);
      scale.addObjectToScale(weightedObjects[2]);
      scale.addObjectToScale(weightedObjects[3]);
    });

    test("Should remove item from front of the array", () => {
      scale.removeObjectFromScale(weightedObjects[0]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[1],
         weightedObjects[2], weightedObjects[3]]);
    });

    test("Should remove item from end of the array", () => {
      scale.removeObjectFromScale(weightedObjects[3]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[0], 
          weightedObjects[1], weightedObjects[2]]);
    });

    test("Should remove item from middle of the array", () => {
      scale.removeObjectFromScale(weightedObjects[2]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[0],
          weightedObjects[1], weightedObjects[3]]);
    });

    test("Should remove first duplicate from array", () => {
      scale.addObjectToScale(new WeightedObject(1));
      scale.removeObjectFromScale(weightedObjects[2]);
      expect(scale.objectsOnScale).toStrictEqual([weightedObjects[0],
          weightedObjects[1], weightedObjects[3], new WeightedObject(1)]);
    });
  });

  describe("getCurrentMass", () => {
    let scale;
    
    beforeEach(() => {
      scale = new Scale();
    });

    test("Scale with no objects should have weight 0", () => {
      expect(scale.getCurrentMass()).toBe(0);
    });

    test("Scale with single object of weight 25 should return 25", () => {
      scale.addObjectToScale(new WeightedObject(25));
      expect(scale.getCurrentMass()).toBe(25);
    });

    test("Scale with multiple objects should total the sum of their weights", () => {
      scale.addObjectToScale(new WeightedObject(25));
      scale.addObjectToScale(new WeightedObject(1));
      scale.addObjectToScale(new WeightedObject(50));
      scale.addObjectToScale(new WeightedObject(1000));
      expect(scale.getCurrentMass()).toBe(1076);
    });

    test("Object with 0 weight should not influence weight", () => {
      scale.addObjectToScale(new WeightedObject(0));
      scale.addObjectToScale(new WeightedObject(0));
      scale.addObjectToScale(new WeightedObject(0));
      scale.addObjectToScale(new WeightedObject(0));
      scale.addObjectToScale(new WeightedObject(0));
      expect(scale.getCurrentMass()).toBe(0);
      scale.addObjectToScale(new WeightedObject(1));
      expect(scale.getCurrentMass()).toBe(1);
    });

    test("Objects with negative weight should not influence weight", () => {
      scale.addObjectToScale(new WeightedObject(-25));
      scale.addObjectToScale(new WeightedObject(-1000));
      scale.addObjectToScale(new WeightedObject(-200));
      scale.addObjectToScale(new WeightedObject(-2));
      expect(scale.getCurrentMass()).toBe(0);
      scale.addObjectToScale(new WeightedObject(1));
      expect(scale.getCurrentMass()).toBe(1);
    });
  });
});