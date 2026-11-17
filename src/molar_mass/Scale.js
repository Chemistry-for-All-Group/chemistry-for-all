import WeightedObject from "./WeightedObject.js";

/**
 * Represents a scale used for getting the mass of WeightedObjects.
 */
class Scale {
  /**
   * Represents the objects that are currently on the scale.
   * 
   * Should only contain objects that inherit from WeightedObject.
   * 
   * @access protected
   * 
   * @type {Array<WeightedObject>}
   */
  objectsOnScale = new Array();

  /**
   * Places the specified object onto the scale.
   * 
   * This object will now be factored into mass read from the scale.
   * 
   * @access public
   * 
   * @param {WeightedObject} object The object to place on the scale.
   */
  addObjectToScale(object) {
    this.objectsOnScale.push(object);
  }   

  /**
   * Removes the specified object from the scale.
   * 
   * If the object is not in the sink, does nothing.
   * 
   * @param {WeightedObject} object The object to remove from the scale.
   */
  removeObjectFromScale(object) {
    this.objectsOnScale.splice(this.objectsOnScale.findIndex((element) => element == object), 1);
  }
  
  /**
   * Returns the current mass reading of the scale in grams.
   * 
   * The mass reading is the combined mass of every object on the scale.
   * Mass is calculated using each object's getMass function.
   * 
   * @returns {number} The current mass of the objects on the scale in grams.
   */
  getCurrentMass() {
    var sum = 0;
    for (const object of this.objectsOnScale) {
      if (object.getMass() >= 0) // ignore objects with negative weight
        sum += object.getMass();
    }
    return sum;
  }
}

export default Scale;