import { call } from "./call.js";
import { delayP } from "../util.js";

export function* delay(ms: number): Generator {
  return yield call(delayP, ms);
}
