import { LengthType } from "../types/LengthType";
import { Duration, Length } from "../types/Length";
import { SportType } from "../types/SportType";
import Mode from "./Mode";
import { Interval } from "../types/Interval";

export default class BikeMode extends Mode {
  private ftp: number;
  private weight: number;
  public readonly sportType: SportType = "bike";
  public readonly lengthType: LengthType = "time";

  constructor(ftp: number, weight: number) {
    super();
    this.ftp = ftp;
    this.weight = weight;
  }

  power(intensity: number): number {
    return intensity * this.ftp;
  }

  wkg(intensity: number): number {
    return this.power(intensity) / this.weight;
  }

  duration(length: Length): Duration {
    if (length instanceof Duration) {
      return length;
    } else {
      throw new Error("Unexpected length:Distance encountered in BikeMode");
    }
  }

  intervalDuration(interval: Interval): Duration {
    switch (interval.type) {
      case 'free':
      case 'steady':
      case 'ramp':
        return this.duration(interval.length);
      case 'repetition': {
        const onDuration = this.duration(interval.onLength);
        const offDuration = this.duration(interval.offLength);
        return new Duration(interval.repeat * (onDuration.seconds + offDuration.seconds));
      }
    }
  }
}
