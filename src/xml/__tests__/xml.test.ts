import createMode from "../../modes/createMode";
import { Workout } from "../../types/Workout";
import createWorkoutXml from "../createWorkoutXml";
import parseWorkoutXml from "../parseWorkoutXml";

describe("XML", () => {
  it('creates and parses an empty workout', () => {
    const mode = createMode("bike", 200, 75, [], "time");
    const workout: Workout = {
      name: "Sample Workout",
      author: "John Doe",
      description: "Some intervals for your pleasure (or pain).",
      tags: ["RECOVERY"],
      sportType: mode.sportType,
      lengthType: mode.lengthType,
      intervals: [],
      instructions: [],
    };
    const xml = createWorkoutXml(workout, mode);
    expect(xml).toMatchSnapshot();

    // Parsing of tags not yet supported
    expect(parseWorkoutXml(xml, mode)).toEqual({ ...workout, tags: [] });
  });
});
