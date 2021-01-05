import { durationMultiplier, intensityMultiplier } from "../components/Bar/multipliers";
import { DurationType } from "../types/DurationType";
import { SportType } from "../types/SportType";
import { floor } from "../utils/math";

export default class BikeMode {
  public readonly sportType: SportType = "bike";
  public readonly durationType: DurationType = "time";

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

  durationToWidth(duration: number): number {
    return duration / durationMultiplier;
  }

  widthToDuration(width: number): number {
    return floor(width * durationMultiplier, 5);
  }

  intensityToHeight(intensity: number): number {
    return intensity * intensityMultiplier;
  }

  heightToIntensity(height: number): number {
    return height / intensityMultiplier;
  }
}
