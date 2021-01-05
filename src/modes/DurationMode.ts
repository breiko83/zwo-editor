import { durationMultiplier, intensityMultiplier } from "../components/Bar/multipliers";
import { floor } from "../utils/math";

// Base class for duration-based Mode classes
export default abstract class DurationMode {
  percentage(intensity: number): number {
    return Math.round(intensity * 100);
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
