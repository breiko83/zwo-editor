import { SportType } from "../components/Editor/Editor";
import { Instruction } from "../components/Instruction";
import { Interval } from "../components/Interval";

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
