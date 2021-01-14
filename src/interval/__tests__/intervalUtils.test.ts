import { moveInterval, updateIntervalDuration, updateIntervalIntensity } from '../intervalUtils';
import { Duration } from '../../types/Length';
import intervalFactory from '../intervalFactory';
import BikeMode from '../../modes/BikeMode';
import { WorkoutMode } from '../../modes/WorkoutMode';

const defaultBikeMode = () => new BikeMode(200, 75);

function deepFreeze<T>(object: T): T {
  for (const name of Object.getOwnPropertyNames(object)) {
    const value = (object as any)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

// Use freeze to ensure we aren't accidentally mutating our interval list
const defaultIntervals = (mode: WorkoutMode) => deepFreeze([
  intervalFactory.steady({
    id: "#1",
    length: new Duration(60),
    intensity: 0.5
  }, mode),
  intervalFactory.steady({
    id: "#2",
    length: new Duration(120),
    intensity: 1.0
  }, mode),
  intervalFactory.steady({
    id: "#3",
    length: new Duration(30),
    intensity: 0.75
  }, mode),
]);

describe('intervalUtils', () => {
  describe('updateIntervalDuration', () => {
    it('increases or decreses duration of specified interval', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalDuration("#2", new Duration(10), intervals, mode)).toMatchSnapshot();
      expect(updateIntervalDuration("#3", new Duration(-10), intervals, mode)).toMatchSnapshot();
    });

    it('does not allow decreasing duration to zero or below it', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalDuration("#1", new Duration(-65), intervals, mode)).toEqual(intervals);
      expect(updateIntervalDuration("#1", new Duration(-60), intervals, mode)).toEqual(intervals);
    });

    it('does nothing when ID not found', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalDuration("#blah", new Duration(10), intervals, mode)).toEqual(intervals);
    });
  });

  describe('updateIntervalIntensity', () => {
    it('increases or decreses duration of specified interval', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalIntensity("#2", 0.05, intervals)).toMatchSnapshot();
      expect(updateIntervalIntensity("#3", -0.05, intervals)).toMatchSnapshot();
    });

    it('does not allow decreasing intensity to zero or below it', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalIntensity("#1", -0.55, intervals)).toEqual(intervals);
      expect(updateIntervalIntensity("#1", -0.5, intervals)).toEqual(intervals);
    });

    it('does nothing when ID not found', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(updateIntervalIntensity("#blah", 0.1, intervals)).toEqual(intervals);
    });
  });

  describe('moveInterval', () => {
    it('moves interval index by +1 or -1', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(moveInterval("#2", -1, intervals)).toMatchSnapshot();
      expect(moveInterval("#2", +1, intervals)).toMatchSnapshot();
    });

    it('does not allow moving past start or end', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(moveInterval("#1", -1, intervals)).toEqual(intervals);
      expect(moveInterval("#3", +1, intervals)).toEqual(intervals);
    });

    it('does nothing when ID not found', () => {
      const mode = defaultBikeMode();
      const intervals = defaultIntervals(mode);
      expect(moveInterval("#blah", 1, intervals)).toEqual(intervals);
    });
  });
});
