import Cylinder from "./Cylinder.js";
import Beaker from "./Beaker.js";
import Buret from "./Buret.js";
import RingStand from "./RingStand.js";
import ButterflyClamp from "./ButterflyClamp.js";
import Electrode from "./Electrode.js";

export default class TitrationExperiment {
  cylinder10Ml = new Cylinder(10);
  cylinder25Ml = new Cylinder(25);
  cylinder50Ml = new Cylinder(50);  
  beaker1 = new Beaker();
  beaker2 = new Beaker();
  beaker3 = new Beaker();
  wasteBeaker = new Beaker(600);
  buret = new Buret();
  ringStand = new RingStand();
  butterflyClamp = new ButterflyClamp();
  indicatorElectrode = new Electrode();
}

export var titrationExperiment = new TitrationExperiment();
