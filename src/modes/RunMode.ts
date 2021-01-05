import { SportType } from "../types/SportType";
import { PaceType } from "../types/PaceType";
import { RunningTimes } from "../types/RunningTimes";
import { runningDistances } from "../types/runningDistances";
import { DurationType } from "../types/DurationType";

export default class RunMode {
  private runningTimes: RunningTimes;
  public readonly sportType: SportType = "run";
  public readonly durationType: DurationType;

  constructor(runningTimes: RunningTimes, durationType: DurationType) {
    this.runningTimes = runningTimes;
    this.durationType = durationType;
  }

  percentage(intensity: number): number {
    return Math.round(intensity * 100);
  }

  shortPaceName(pace: PaceType): string {
    const paces = ["1M", "5K", "10K", "HM", "M"];
    return paces[pace];
  }

  speed(intensity: number, pace: PaceType): number {
    return runningDistances[pace] / this.runningTimes[pace] * intensity; // in m/s
  }

  distance(duration: number, intensity: number, pace: PaceType): number {
    return Math.round(this.speed(intensity, pace) * duration); // in meters
  }
}
