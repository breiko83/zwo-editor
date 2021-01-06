import { LengthType } from "../types/LengthType";
import { Duration, Length } from "../types/Length";
import { SportType } from "../types/SportType";
import DurationMode from "./DurationMode";

export default class BikeMode extends DurationMode {
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
    return Math.round(intensity * this.ftp);
  }

  wkg(intensity: number): number {
    return Math.round(this.power(intensity) / this.weight * 10) / 10;
  }

  duration(length: Length): Duration {
    if (length instanceof Duration) {
      return length;
    } else {
      throw new Error("Unexpected length:Distance encountered in BikeMode");
    }
  }
}
