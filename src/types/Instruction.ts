import { v4 as uuidv4 } from "uuid";

export interface Instruction {
  id: string,
  text: string,
  offset: number,
}

export function createInstruction(fields: Partial<Instruction>): Instruction {
  return {
    id: uuidv4(),
    text: "",
    offset: 0,
    ...fields,
  };
}
