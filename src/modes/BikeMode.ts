import { SportType } from "../types/SportType";

export default class BikeMode {
  public readonly sportType: SportType = "bike";

  constructor(private ftp: number, private weight: number) {}

  power(intensity: number): number {
    return Math.round(intensity * this.ftp);
  }

  percentage(intensity: number): number {
    return Math.round(intensity * 100);
  }

  wkg(intensity: number): number {
    return Math.round(this.power(intensity) / this.weight * 10) / 10;
  }
}
