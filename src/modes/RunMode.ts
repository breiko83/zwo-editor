import { SportType } from "../types/SportType";
import { PaceType } from "../types/PaceType";
import { RunningTimes } from "../types/RunningTimes";
import { runningDistances } from "../types/runningDistances";

export default class RunMode {
  public readonly sportType: SportType = "run";

  constructor(private runningTimes: RunningTimes) {}

  percentage(intensity: number): number {
    return Math.round(intensity * 100);
  }

  shortPaceName(pace: PaceType): string {
    const paces = ["1M", "5K", "10K", "HM", "M"];
    return paces[pace];
  }

  distance(duration: number, intensity: number, pace: PaceType): number {
    const speed = runningDistances[pace] / this.runningTimes[pace] * intensity; // in m/s
    return Math.round(speed * duration); // in meters
  }
}
