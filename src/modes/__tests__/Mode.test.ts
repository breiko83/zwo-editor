import { Distance, Duration } from '../../types/Length';
import { PaceType } from '../../types/PaceType';
import BikeMode from '../BikeMode';
import Mode from '../Mode';
import RunMode from '../RunMode';

const defaultBikeMode = () => new BikeMode(200, 75);

const defaultRunMode = () => new RunMode([0, 300, 0, 0, 0], "time");

const defaultRunDistanceMode = () => new RunMode([0, 300, 0, 0, 0], "distance");

const allModes = (): Mode[] => [
  defaultBikeMode(),
  defaultRunMode(),
];

describe('Mode', () => {
  it('percentage() converts intensity to rounded percentage', () => {
    allModes().forEach((mode) => {
      expect(mode.percentage(0.5)).toEqual(50);
      expect(mode.percentage(0)).toEqual(0);
      expect(mode.percentage(1.0)).toEqual(100);
      expect(mode.percentage(1.2345)).toEqual(123);
      expect(mode.percentage(1.777)).toEqual(178);
    });
  });

  it('intensityToHeight() converts intensity to height in pixels and heightToIntensity() does the opposite', () => {
    allModes().forEach((mode) => {
      [0.5, 0, 1.0, 1.2345, 1.777].forEach((intensity) => {
        expect(mode.heightToIntensity(mode.intensityToHeight(intensity))).toEqual(intensity);
      })
    });
  });

  describe('lengthToWidth()', () => {
    it('converts duration to pixels', () => {
      allModes().forEach((mode) => {
        expect(mode.lengthToWidth(new Duration(60))).toEqual(20);
      });
    });

    it('converts distance to pixels in RunMode', () => {
      expect(defaultRunDistanceMode().lengthToWidth(new Distance(200))).toEqual(20);
    });
  });

  describe('widthToLength()', () => {
    it('converts pixels to duration in BikeMode', () => {
      expect(defaultBikeMode().widthToLength(20)).toEqual(new Duration(60));
    });

    it('converts pixels to duration in RunMode', () => {
      expect(defaultRunMode().widthToLength(20)).toEqual(new Duration(60));
    });

    it('converts pixels to distance in RunMode@distance', () => {
      expect(defaultRunDistanceMode().widthToLength(20)).toEqual(new Distance(200));
    });
  });

  describe('duration()', () => {
    it('returns the value unmodified when given a Duration', () => {
      expect(defaultBikeMode().duration(new Duration(60))).toEqual(new Duration(60));
      expect(defaultRunMode().duration(new Duration(60), 1.0, PaceType.fiveKm)).toEqual(new Duration(60));
    });

    it('converts Distance to Duration in RunMode, using the recorded runningTimes', () => {
      // when distance exactly 5km, ran at 5km pace
      expect(defaultRunMode().duration(new Distance(5000), 1.0, PaceType.fiveKm)).toEqual(new Duration(300));
      // when distance half of 5km, ran at 5km pace
      expect(defaultRunMode().duration(new Distance(2500), 1.0, PaceType.fiveKm)).toEqual(new Duration(150));
      // when distance exactly 5km, ran at 2 x 5km pace
      expect(defaultRunMode().duration(new Distance(5000), 2.0, PaceType.fiveKm)).toEqual(new Duration(150));
      // 0 distance == 0 duration 
      expect(defaultRunMode().duration(new Distance(0), 1.0, PaceType.fiveKm)).toEqual(new Duration(0));
    });

    it('BikeMode does not support Distance', () => {
      expect(() => defaultBikeMode().duration(new Distance(200)))
        .toThrow("Unexpected length:Distance encountered in BikeMode");
    });
  });

  describe('BikeMode', () => {
    it('power() converts intensity to power using FTP (rounded)', () => {
      expect(defaultBikeMode().power(0)).toEqual(0);
      expect(defaultBikeMode().power(1.5)).toEqual(300);
      expect(defaultBikeMode().power(1.12345)).toEqual(225);
    });

    // There's a minor problem here:
    // wkg() uses power() internally, which is also a rounded value, so the result might not be 100% exact
    it('wkg() converts intensity to w/kg using FTP and weight (rounded to one decimal)', () => {
      expect(defaultBikeMode().wkg(0)).toEqual(0);
      expect(defaultBikeMode().wkg(1.5)).toEqual(4);
      expect(defaultBikeMode().wkg(1.1)).toEqual(2.9);
    });
  });

  describe('RunMode', () => {
    it('shortPaceName() returns pace name abbreviation', () => {
      expect(defaultRunMode().shortPaceName(PaceType.oneMile)).toEqual('1M');
      expect(defaultRunMode().shortPaceName(PaceType.fiveKm)).toEqual('5K');
      expect(defaultRunMode().shortPaceName(PaceType.tenKm)).toEqual('10K');
      expect(defaultRunMode().shortPaceName(PaceType.halfMarathon)).toEqual('HM');
      expect(defaultRunMode().shortPaceName(PaceType.marathon)).toEqual('M');
    });

    it('speed() converts intensity & pace type to speed in m/s', () => {
      expect(defaultRunMode().speed(0, PaceType.fiveKm)).toEqual(0);
      expect(defaultRunMode().speed(0.3, PaceType.fiveKm)).toEqual(5);
      expect(defaultRunMode().speed(1.3, PaceType.fiveKm)).toEqual(21.666666666666668);
    });

    describe('distance()', () => {
      it('distance() converts duration to distance', () => {
        expect(defaultRunMode().distance(new Duration(60), 0, PaceType.fiveKm)).toEqual(new Distance(0));
        expect(defaultRunMode().distance(new Duration(60), 1.0, PaceType.fiveKm)).toEqual(new Distance(1000));
      });

      it('distance() keeps distance unchanged', () => {
        expect(defaultRunMode().distance(new Distance(200), 1.0, PaceType.fiveKm)).toEqual(new Distance(200));
      });
    });
  });
});
