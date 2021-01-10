import { LengthType } from "../types/LengthType";
import { RunningTimes } from "../types/RunningTimes";
import { SportType } from "../types/SportType";
import BikeMode from "./BikeMode";
import RunMode from "./RunMode";
import { WorkoutMode } from "./WorkoutMode";

interface CreateModeParams {
  sportType: SportType;
  ftp: number;
  weight: number;
  runningTimes: RunningTimes;
  lengthType: LengthType;
}

// Creates appropriate type of mode for current sport type
export default function createMode({sportType, ftp, weight, runningTimes, lengthType}: CreateModeParams): WorkoutMode {
  switch (sportType) {
    case "bike": return new BikeMode(ftp, weight);
    case "run": return new RunMode(runningTimes, lengthType);
  }
}
