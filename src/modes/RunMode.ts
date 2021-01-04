import { SportType } from "../types/SportType";
import { PaceType } from "../types/PaceType";

export default class RunMode {
  public readonly sportType: SportType = "run";

  percentage(intensity: number): number {
    return Math.round(intensity * 100);
  }

  shortPaceName(pace: PaceType): string {
    const paces = ["1M", "5K", "10K", "HM", "M"];
    return paces[pace];
  }
}
