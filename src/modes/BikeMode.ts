import { DurationType } from "../types/DurationType";
import { SportType } from "../types/SportType";
import DurationMode from "./DurationMode";

export default class BikeMode extends DurationMode {
  private ftp: number;
  private weight: number;
  public readonly sportType: SportType = "bike";
  public readonly durationType: DurationType = "time";

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
}
