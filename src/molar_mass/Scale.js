export default class Scale {
  objectsOnScale = new Array();
  pageContent = '<h1>Scale</h1><input type="button" id="back" value="Back" onclick="replaceElement(\'body\', oldContent, \'cylinderButton\')" /><p id="weight-reading"></p>';

  addObjectToScale(object) {
    this.objectsOnScale.push(object);
  }   

  removeObjectFromScale(object) {
    this.objectsOnScale.splice(this.objectsOnScale.findIndex((element) => element == object), 1);
  }

  getCurrentMass() {
    var sum = 0;
    for (const object of this.objectsOnScale) {
      if (object.getMass() >= 0) // ignore objects with negative weight
        sum += object.getMass();
    }
    return sum;
  }
}