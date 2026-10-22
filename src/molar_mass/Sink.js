export default class Sink {
  objectsInSink = new Array();
  isOn = false;

  addObjectToSink(object) {
    this.objectsInSink.push(object);
    // If sink is on, fill object completely
    if (this.isOn) {
      object.fillCompletely();
    }
  }   

  removeObjectFromSink(object) {
    this.objectsInSink.splice(this.objectsInSink.findIndex((element) => element == object), 1);
  }

  turnOnSink() {
    this.isOn = true;
    // Fill all objects in the sink when it gets turned on
    for (const object of this.objectsInSink) {
      object.fillCompletely();
    }
  }

  turnOffSink() {
    this.isOn = false;
  }
}
