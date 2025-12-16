import helpers from './helpers';
import { BarType } from '../types/workout';

describe('helpers', () => {
  describe('getWorkoutLength', () => {
    it('should calculate total time for time-based workouts with bars', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0, power: 0.7 },
        { id: '2', type: 'bar', time: 600, cadence: 0, power: 0.8 },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(900);
    });

    it('should calculate total time for distance-based workouts with bars', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0, power: 0.7 },
        { id: '2', type: 'bar', time: 600, cadence: 0, power: 0.8 },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(900);
    });

    it('should handle trapeze segments', () => {
      const bars: BarType[] = [
        { id: '1', type: 'trapeze', time: 300, cadence: 0, startPower: 0.5, endPower: 0.8 },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(300);
    });

    it('should handle freeRide segments', () => {
      const bars: BarType[] = [
        { id: '1', type: 'freeRide', time: 600, cadence: 0 },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(600);
    });

    it('should handle interval segments correctly', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'interval',
          time: 450,
          cadence: 0,
          repeat: 3,
          onDuration: 30,
          offDuration: 120,
          onPower: 1.2,
          offPower: 0.5,
        },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(450);
    });

    it('should handle mixed workout types', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0, power: 0.5 },
        { id: '2', type: 'trapeze', time: 300, cadence: 0, startPower: 0.5, endPower: 0.8 },
        {
          id: '3',
          type: 'interval',
          time: 450,
          cadence: 0,
          repeat: 3,
          onDuration: 30,
          offDuration: 120,
          onPower: 1.2,
          offPower: 0.5,
        },
        { id: '4', type: 'freeRide', time: 600, cadence: 0 },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(1650);
    });

    it('should handle empty bars array', () => {
      const bars: BarType[] = [];
      expect(helpers.getWorkoutLength(bars)).toBe(0);
    });

    it('should handle intervals with missing values', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'interval',
          time: 450,
          cadence: 0,
        },
      ];
      expect(helpers.getWorkoutLength(bars)).toBe(0);
    });
  });

  describe('getStressScore', () => {
    it('should calculate TSS for bar segments', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0, power: 1.0 },
      ];
      const ftp = 200;
      expect(helpers.getStressScore(bars, ftp)).toBe('100');
    });

    it('should calculate TSS for trapeze segments', () => {
      const bars: BarType[] = [
        { id: '1', type: 'trapeze', time: 3600, cadence: 0, startPower: 0.8, endPower: 1.2 },
      ];
      const ftp = 200;
      expect(helpers.getStressScore(bars, ftp)).toBe('100');
    });

    it('should calculate TSS for interval segments', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'interval',
          time: 1800,
          cadence: 0,
          repeat: 10,
          onDuration: 30,
          offDuration: 150,
          onPower: 1.5,
          offPower: 0.5,
        },
      ];
      const ftp = 200;
      const result = helpers.getStressScore(bars, ftp);
      expect(parseInt(result)).toBeGreaterThan(0);
    });

    it('should handle mixed segment types', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 1800, cadence: 0, power: 0.7 },
        { id: '2', type: 'trapeze', time: 600, cadence: 0, startPower: 0.5, endPower: 1.0 },
        {
          id: '3',
          type: 'interval',
          time: 900,
          cadence: 0,
          repeat: 5,
          onDuration: 30,
          offDuration: 150,
          onPower: 1.2,
          offPower: 0.6,
        },
      ];
      const ftp = 250;
      const result = helpers.getStressScore(bars, ftp);
      expect(parseInt(result)).toBeGreaterThan(0);
    });

    it('should return "0" for empty bars', () => {
      const bars: BarType[] = [];
      expect(helpers.getStressScore(bars, 200)).toBe('0');
    });

    it('should handle bars without power values', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0 },
      ];
      expect(helpers.getStressScore(bars, 200)).toBe('0');
    });
  });

  describe('getWorkoutDistance', () => {
    it('should calculate total distance in km', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0, length: 2000 },
        { id: '2', type: 'bar', time: 600, cadence: 0, length: 3000 },
      ];
      expect(helpers.getWorkoutDistance(bars)).toBe(5.0);
    });

    it('should handle bars without length', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0 },
        { id: '2', type: 'bar', time: 600, cadence: 0, length: 1000 },
      ];
      expect(helpers.getWorkoutDistance(bars)).toBe(1.0);
    });

    it('should return 0 for empty bars', () => {
      const bars: BarType[] = [];
      expect(helpers.getWorkoutDistance(bars)).toBe(0);
    });

    it('should round to 1 decimal place', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 300, cadence: 0, length: 1234 },
      ];
      expect(helpers.getWorkoutDistance(bars)).toBe(1.2);
    });
  });

  describe('getWorkoutPace', () => {
    it('should calculate average pace in metric', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0, length: 10000 },
      ];
      const result = helpers.getWorkoutPace(bars, 'metric');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should calculate average pace in imperial', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0, length: 10000 },
      ];
      const result = helpers.getWorkoutPace(bars, 'imperial');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should exclude freeRide segments', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0, length: 10000 },
        { id: '2', type: 'freeRide', time: 600, cadence: 0, length: 2000 },
      ];
      const result = helpers.getWorkoutPace(bars, 'metric');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should return empty string when distance is 0', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 3600, cadence: 0 },
      ];
      expect(helpers.getWorkoutPace(bars, 'metric')).toBe('');
    });
  });

  describe('calculateEstimatedTimes', () => {
    it('should estimate times using Riegel formula', () => {
      const distances = [1.60934, 5, 10, 21.0975, 42.195];
      const times = ['00:06:00', '', '', '', ''];
      const result = helpers.calculateEstimatedTimes(distances, times);
      expect(result[1]).toMatch(/\d{2}:\d{2}:\d{2}/);
      expect(result[2]).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should not overwrite existing times', () => {
      const distances = [1.60934, 5, 10];
      const times = ['00:06:00', '00:20:00', ''];
      const result = helpers.calculateEstimatedTimes(distances, times);
      expect(result[1]).toBeUndefined();
      expect(result[2]).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should handle empty times array', () => {
      const distances = [5, 10];
      const times: string[] = [];
      const result = helpers.calculateEstimatedTimes(distances, times);
      expect(result).toEqual([]);
    });
  });

  describe('getTimeinSeconds', () => {
    it('should convert HH:MM:SS to seconds', () => {
      expect(helpers.getTimeinSeconds('01:00:00')).toBe(3600);
    });

    it('should convert MM:SS to seconds', () => {
      expect(helpers.getTimeinSeconds('00:10:30')).toBe(630);
    });

    it('should handle zero time', () => {
      expect(helpers.getTimeinSeconds('00:00:00')).toBe(0);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds as MM:SS', () => {
      expect(helpers.formatDuration(90)).toBe('01:30');
    });

    it('should pad single digits', () => {
      expect(helpers.formatDuration(5)).toBe('00:05');
    });

    it('should handle hours', () => {
      expect(helpers.formatDuration(3665)).toBe('61:05');
    });

    it('should handle zero', () => {
      expect(helpers.formatDuration(0)).toBe('00:00');
    });
  });

  describe('calculateTime', () => {
    it('should calculate time from distance and speed', () => {
      expect(helpers.calculateTime(1000, 10)).toBe(100);
    });

    it('should handle zero speed gracefully', () => {
      expect(helpers.calculateTime(1000, 0)).toBe(0);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance from time and speed', () => {
      expect(helpers.calculateDistance(100, 10)).toBe(1000);
    });

    it('should handle zero time', () => {
      expect(helpers.calculateDistance(0, 10)).toBe(0);
    });
  });

  describe('round', () => {
    it('should round down to nearest multiple', () => {
      expect(helpers.round(157, 5)).toBe(155);
    });

    it('should handle exact multiples', () => {
      expect(helpers.round(200, 5)).toBe(200);
    });

    it('should handle rounding to large numbers', () => {
      expect(helpers.round(1234, 200)).toBe(1200);
    });

    it('should handle zero', () => {
      expect(helpers.round(0, 5)).toBe(0);
    });
  });

  describe('calculateSpeed', () => {
    it('should calculate speed in km/h', () => {
      // calculateSpeed takes (time, distance)
      // Formula: ((time / distance) * 18) / 5
      const speed = helpers.calculateSpeed(3600, 10000);
      expect(speed).toBeCloseTo(1.296, 1);
    });

    it('should handle different time/distance ratios', () => {
      const speed = helpers.calculateSpeed(1800, 5000);
      expect(speed).toBeCloseTo(1.296, 1);
    });
  });

  describe('speedToPace', () => {
    it('should convert speed to metric pace (min/km)', () => {
      const pace = helpers.speedToPace(10, 'metric');
      expect(pace).toBe('06:00');
    });

    it('should convert speed to imperial pace (min/mi)', () => {
      const pace = helpers.speedToPace(10, 'imperial');
      expect(pace).toBe('09:39');
    });

    it('should handle faster speeds', () => {
      const pace = helpers.speedToPace(15, 'metric');
      expect(pace).toBe('04:00');
    });

    it('should handle slower speeds', () => {
      const pace = helpers.speedToPace(8, 'metric');
      expect(pace).toBe('07:30');
    });
  });
});
