import { v4 as uuidv4 } from "uuid";

export interface Instruction {
  id: string,
  text: string,
  time: number,
}

export function createInstruction(fields: Partial<Instruction>): Instruction {
  return {
    id: uuidv4(),
    text: "",
    time: 0,
    ...fields,
  };
}
