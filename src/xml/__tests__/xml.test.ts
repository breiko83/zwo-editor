import intervalFactory from "../../interval/intervalFactory";
import createMode from "../../modes/createMode";
import { createInstruction } from "../../types/Instruction";
import { Duration } from "../../types/Length";
import { Workout } from "../../types/Workout";
import createWorkoutXml from "../createWorkoutXml";
import parseWorkoutXml from "../parseWorkoutXml";

jest.mock('uuid', () => ({
  v4: () => "mock-id",
}));

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

  it('creates and parses bike workout (without cadence)', () => {
    const mode = createMode("bike", 200, 75, [], "time");
    const workout: Workout = {
      name: "Cycling Workout",
      author: "Eddy Merckx",
      description: "Featuring a mixture of different interval types.",
      tags: [],
      sportType: mode.sportType,
      lengthType: mode.lengthType,
      intervals: [
        // Warmup: 10:00 30%..75%
        intervalFactory.ramp({ length: new Duration(10 * 60), startIntensity: 0.3, endIntensity: 0.75 }, mode),
        // Steady: 5:00 80%
        intervalFactory.steady({ length: new Duration(5 * 60), intensity: 0.8 }, mode),
        // Intervals: 4 x ON 0:30 120%, OFF 1:00 60%
        intervalFactory.repetition({ repeat: 4, onLength: new Duration(30), onIntensity: 1.2, offLength: new Duration(60), offIntensity: 0.6 }, mode),
        // Ramp 1:00 80%..150%
        intervalFactory.ramp({ length: new Duration(60), startIntensity: 0.8, endIntensity: 1.5 }, mode),
        // Freeride: 20:00
        intervalFactory.free({ length: new Duration(20 * 60) }, mode),
        // Cooldown: 10:00 30%..30%
        intervalFactory.ramp({ length: new Duration(10 * 60), startIntensity: 0.7, endIntensity: 0.3 }, mode),
      ],
      instructions: [
        // @ 00:00 - at the start of warmup
        createInstruction({ offset: new Duration(0), text: "Welcome to the workout!" }, mode),
        // @ 12:30 - at the middle of second block
        createInstruction({ offset: new Duration(12 * 60 + 30), text: "This is just a warmup still" }, mode),
        // @ 15:00 - at the start of repetition block
        createInstruction({ offset: new Duration(15 * 60), text: "It's the first one of four sprint efforts" }, mode),
        // @ 19:30 - at the start of last repetition block
        createInstruction({ offset: new Duration(19 * 60 + 30), text: "It's the first one of four sprint efforts" }, mode),
        // @ 21:00 - at the start of a ramp
        createInstruction({ offset: new Duration(21 * 60), text: "As a bonus, we'll ramp up really hard :)" }, mode),
        // @ 32:00 - inside freeride
        createInstruction({ offset: new Duration(32 * 60), text: "Ride as hard as you can for 20 minutes!" }, mode),
        // @ 51:50 - almost at the very end of cooldown
        createInstruction({ offset: new Duration(51 * 60 + 50), text: "This was it. See you next time." }, mode),
      ],
    };
    const xml = createWorkoutXml(workout, mode);
    expect(xml).toMatchSnapshot();

    expect(parseWorkoutXml(xml, mode)).toEqual({ ...workout });
  });

  it('creates and parses bike workout (with cadence)', () => {
    const mode = createMode("bike", 200, 75, [], "time");
    const workout: Workout = {
      name: "Cycling Workout",
      author: "Eddy Merckx",
      description: "Featuring a mixture of different interval types.",
      tags: [],
      sportType: mode.sportType,
      lengthType: mode.lengthType,
      intervals: [
        // Warmup: 10:00 30%..75% 80rpm
        intervalFactory.ramp({ length: new Duration(10 * 60), startIntensity: 0.3, endIntensity: 0.75, cadence: 80 }, mode),
        // Steady: 5:00 80% 90rpm
        intervalFactory.steady({ length: new Duration(5 * 60), intensity: 0.8, cadence: 90 }, mode),
        // Intervals: 4 x ON 0:30 120% 100rpm, OFF 1:00 60% 60rpm
        intervalFactory.repetition({ repeat: 4, onLength: new Duration(30), onIntensity: 1.2, cadence: 100, offLength: new Duration(60), offIntensity: 0.6, restingCadence: 60 }, mode),
        // Ramp 1:00 80%..150% 90rpm
        intervalFactory.ramp({ length: new Duration(60), startIntensity: 0.8, endIntensity: 1.5, cadence: 90 }, mode),
        // Freeride: 20:00
        intervalFactory.free({ length: new Duration(20 * 60) }, mode),
        // Cooldown: 10:00 30%..30% 85rpm
        intervalFactory.ramp({ length: new Duration(10 * 60), startIntensity: 0.7, endIntensity: 0.3, cadence: 85 }, mode),
      ],
      instructions: [],
    };
    const xml = createWorkoutXml(workout, mode);
    expect(xml).toMatchSnapshot();

    expect(parseWorkoutXml(xml, mode)).toEqual({ ...workout });
  });
});
