import FillableObject from "./FillableObject.js";
import WeightedObject from "./WeightedObject.js";

/**
 * Represents a sink that can fill FillableObjects with water.
 * 
 * @category Molar Mass
 */
class Sink {
  /**
   * Represents the objects that are currently in the sink.
   * 
   * Should only contain objects that inherit from FillableObject.
   * 
   * @access protected
   * 
   * @type {Array<FillableObject>}
   */
  objectsInSink = new Array();

  /**
   * Stores whether or not the sink is currently on.
   * 
   * @access protected
   * 
   * @type {boolean}
   */
  isOn = false;

  /**
   * Places the specified object into the sink.
   * 
   * This object will be filled if the sink is on.
   * 
   * @access public
   * 
   * @param {WeightedObject} object The object to place into the sink.
   */
  addObjectToSink(object) {
    this.objectsInSink.push(object);
    // If sink is on, fill object completely
    if (this.isOn) {
      object.fillCompletely();
    }
  }   

  /**
   * Removes the specified object from the sink.
   * 
   * If the object is not in the sink, does nothing.
   * 
   * @access public
   * 
   * @param {WeightedObject} object The object to remove from the sink.
   */
  removeObjectFromSink(object) {
    this.objectsInSink.splice(this.objectsInSink.findIndex((element) => element == object), 1);
  }

  /**
   * Turns the sink on.
   * 
   * This causes all objects in the sink to become filled with water.
   * 
   * @access public
   */
  turnOnSink() {
    this.isOn = true;
    // Fill all objects in the sink when it gets turned on
    for (const object of this.objectsInSink) {
      object.fillCompletely();
    }
  }

  /**
   * Turns the sink off.
   * 
   * @access public
   */
  turnOffSink() {
    this.isOn = false;
  }
}

export default Sink;