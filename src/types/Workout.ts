import { SportType } from "./SportType";
import { Instruction } from "./Instruction";
import { Interval } from "./Interval";

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
