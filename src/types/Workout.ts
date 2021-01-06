import { SportType } from "./SportType";
import { Instruction } from "./Instruction";
import { Interval } from "./Interval";
import { LengthType } from "./LengthType";

export interface Workout {
  author: string;
  name: string;
  description: string;
  sportType: SportType;
  lengthType: LengthType;
  tags: string[];
  intervals: Array<Interval>;
  instructions: Array<Instruction>;
}

export function createEmptyWorkout(sportType: SportType, lengthType: LengthType): Workout {
  return {
    author: "",
    name: "",
    description: "",
    sportType: sportType,
    lengthType: lengthType,
    tags: [],
    intervals: [],
    instructions: [],
  };
}
