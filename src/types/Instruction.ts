import { v4 as uuidv4 } from "uuid";
import { WorkoutMode } from "../modes/WorkoutMode";
import { Distance, Duration, Length } from "./Length";

export interface Instruction {
  id: string,
  text: string,
  offset: Length,
}

export function createInstruction(fields: Partial<Instruction>, mode: WorkoutMode): Instruction {
  return {
    id: uuidv4(),
    text: "",
    offset: mode.lengthType === "time" ? new Duration(0) : new Distance(0),
    ...fields,
  };
}
