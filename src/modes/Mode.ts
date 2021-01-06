import { distanceMultiplier, durationMultiplier, intensityMultiplier } from "../components/Bar/multipliers";
import { Distance, Duration, Length } from "../types/Length";
import { LengthType } from "../types/LengthType";
import { SportType } from "../types/SportType";
import { floor } from "../utils/math";

// Base class for duration-based Mode classes
export default abstract class Mode {
  public abstract readonly sportType: SportType;
  public abstract readonly lengthType: LengthType;

  percentage(intensity: number): number {
    return Math.round(intensity * 100);
  }

  lengthToWidth(length: Length): number {
    if (length instanceof Duration) {
      return length.seconds / durationMultiplier;
    } else {
      return length.meters / distanceMultiplier;
    }
  }

  widthToLength(width: number): Length {
    if (this.lengthType === "time") {
      return new Duration(floor(width * durationMultiplier, 5));
    } else {
      return new Distance(floor(width * distanceMultiplier, 200));
    }
  }

  intensityToHeight(intensity: number): number {
    return intensity * intensityMultiplier;
  }

  heightToIntensity(height: number): number {
    return height / intensityMultiplier;
  }
}
