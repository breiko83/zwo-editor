import { distanceMultiplier, durationMultiplier, intensityMultiplier } from "../components/Bar/multipliers";
import { Distance, Duration, Length } from "../types/Length";
import { floor } from "../utils/math";
import { WorkoutMode } from "./WorkoutMode";

// Base class for duration-based Mode classes
export default abstract class DurationMode {
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

  widthToLength(width: number, mode: WorkoutMode): Length {
    if (mode.lengthType === "time") {
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
