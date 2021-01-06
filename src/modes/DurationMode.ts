import { distanceMultiplier, durationMultiplier, intensityMultiplier } from "../components/Bar/multipliers";
import { Duration, Length } from "../types/Length";
import { floor } from "../utils/math";

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

  widthToLength(width: number): Duration {
    return new Duration(floor(width * durationMultiplier, 5));
  }

  intensityToHeight(intensity: number): number {
    return intensity * intensityMultiplier;
  }

  heightToIntensity(height: number): number {
    return height / intensityMultiplier;
  }

  duration(length: Length): Duration {
    if (length instanceof Duration) {
      return length;
    } else {
      return new Duration(0); // TODO
    }
  }
}
