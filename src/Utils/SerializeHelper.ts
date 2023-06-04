import Anatomy from "../Anatomy/Anatomy";
import WorldEnvironment from "../Environment/WorldEnvironment";
import Organism from "../Organism/Organism";
import FossilRecord from "../Stats/FossilRecord";
import Species from "../Stats/Species";

type SerializableType = any; //Anatomy | WorldEnvironment | Organism | FossilRecord | Species;

// @todo: fix me
class SerializeHelper {
  public static copyNonObjects(obj: SerializableType) {
    let newobj = {};
    /*for (let key in obj) {
      if (typeof obj[key] !== 'object') newobj[key] = obj[key];
    }*/
    return newobj;
  }
  public static overwriteNonObjects(copyFrom: SerializableType, copyTo: SerializableType) {
    for (let key in copyFrom) {
      /*if (
        typeof copyFrom[key] !== 'object' &&
        typeof copyTo[key] !== 'object'
      ) {
        // only overwrite if neither are objects
        copyTo[key] = copyFrom[key];
      }*/
    }
  }
};

export default SerializeHelper;
