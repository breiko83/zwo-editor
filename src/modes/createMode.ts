import { DurationType } from "../types/DurationType";
import { RunningTimes } from "../types/RunningTimes";
import { SportType } from "../types/SportType";
import BikeMode from "./BikeMode";
import RunMode from "./RunMode";
import { WorkoutMode } from "./WorkoutMode";

// Creates appropriate type of mode for current sport type
export default function createMode(sportType: SportType, ftp: number, weight: number, runningTimes: RunningTimes, durationType: DurationType): WorkoutMode {
  switch (sportType) {
    case "bike": return new BikeMode(ftp, weight);
    case "run": return new RunMode(runningTimes, durationType);
  }
}
