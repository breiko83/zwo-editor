import { SportType } from "../types/SportType";
import { Instruction } from "../types/Instruction";
import { Interval } from "../types/Interval";

export interface Workout {
  author: string;
  name: string;
  description: string;
  sportType: SportType;
  tags: string[];
  intervals: Array<Interval>;
  instructions: Array<Instruction>;
}

export function createEmptyWorkout(): Workout {
  return {
    author: "",
    name: "",
    description: "",
    sportType: "bike",
    tags: [],
    intervals: [],
    instructions: [],
  };
}
