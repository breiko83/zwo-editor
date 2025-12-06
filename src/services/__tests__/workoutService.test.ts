import { workoutService } from '../workoutService';
import { BarType } from '../../components/Editor/Editor';

describe('workoutService', () => {
  const mockUuid = () => 'test-uuid-123';

  describe('createBar', () => {
    it('should create a bar with time-based duration', () => {
      const bar = workoutService.createBar(
        0.75, // zone
        300, // duration
        85, // cadence
        0, // pace
        200, // length
        0, // incline
        'time',
        mockUuid
      );

      expect(bar).toMatchObject({
        type: 'bar',
        power: 0.75,
        time: 300,
        cadence: 85,
        pace: 0,
        incline: 0,
        id: 'test-uuid-123',
      });
      expect(bar.length).toBeDefined();
    });

    it('should create a bar with distance-based duration', () => {
      const bar = workoutService.createBar(
        1.0,
        300,
        90,
        0,
        1000, // length
        0,
        'distance',
        mockUuid
      );

      expect(bar).toMatchObject({
        type: 'bar',
        power: 1.0,
        length: 1000,
        cadence: 90,
        id: 'test-uuid-123',
      });
      expect(bar.time).toBeDefined();
    });
  });

  describe('createTrapeze', () => {
    it('should create a trapeze with start and end power', () => {
      const trapeze = workoutService.createTrapeze(
        0.5, // startPower
        1.2, // endPower
        600, // duration
        0,
        1000,
        85,
        'time',
        mockUuid
      );

      expect(trapeze).toMatchObject({
        type: 'trapeze',
        startPower: 0.5,
        endPower: 1.2,
        time: 600,
        cadence: 85,
        id: 'test-uuid-123',
      });
    });
  });

  describe('createFreeRide', () => {
    it('should create a free ride segment', () => {
      const freeRide = workoutService.createFreeRide(
        600,
        0,
        1000,
        'time',
        mockUuid
      );

      expect(freeRide).toMatchObject({
        type: 'freeRide',
        time: 600,
        cadence: 0,
        id: 'test-uuid-123',
      });
    });

    it('should create a free ride with distance duration', () => {
      const freeRide = workoutService.createFreeRide(
        0,
        85,
        2000,
        'distance',
        mockUuid
      );

      expect(freeRide).toMatchObject({
        type: 'freeRide',
        length: 2000,
        cadence: 85,
        id: 'test-uuid-123',
      });
    });
  });

  describe('createInterval', () => {
    it('should create an interval with on/off durations and powers', () => {
      const interval = workoutService.createInterval(
        5, // repeat
        30, // onDuration
        90, // offDuration
        1.5, // onPower
        0.5, // offPower
        100, // cadence
        80, // restingCadence
        0,
        200,
        200,
        'time',
        mockUuid
      );

      expect(interval).toMatchObject({
        type: 'interval',
        repeat: 5,
        onDuration: 30,
        offDuration: 90,
        onPower: 1.5,
        offPower: 0.5,
        cadence: 100,
        restingCadence: 80,
        id: 'test-uuid-123',
      });
    });
  });

  describe('duplicateBar', () => {
    const mockCallbacks = {
      addBar: jest.fn(),
      addFreeRide: jest.fn(),
      addTrapeze: jest.fn(),
      addInterval: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should duplicate a bar', () => {
      const bar: BarType = {
        id: '1',
        type: 'bar',
        time: 300,
        power: 0.8,
        cadence: 85,
        pace: 0,
        length: 200,
      };

      workoutService.duplicateBar(bar, mockCallbacks);

      expect(mockCallbacks.addBar).toHaveBeenCalledWith(
        0.8, // power
        300, // time
        85, // cadence
        0, // pace
        200 // length
      );
    });

    it('should duplicate a trapeze', () => {
      const trapeze: BarType = {
        id: '2',
        type: 'trapeze',
        time: 600,
        startPower: 0.5,
        endPower: 1.2,
        cadence: 90,
        pace: 0,
        length: 1000,
      };

      workoutService.duplicateBar(trapeze, mockCallbacks);

      expect(mockCallbacks.addTrapeze).toHaveBeenCalledWith(
        0.5, // startPower
        1.2, // endPower
        600, // time
        0, // pace
        1000, // length
        90 // cadence
      );
    });

    it('should duplicate a free ride', () => {
      const freeRide: BarType = {
        id: '3',
        type: 'freeRide',
        time: 600,
        cadence: 0,
        length: 2000,
      };

      workoutService.duplicateBar(freeRide, mockCallbacks);

      expect(mockCallbacks.addFreeRide).toHaveBeenCalledWith(600, 0, 2000);
    });

    it('should duplicate an interval', () => {
      const interval: BarType = {
        id: '4',
        type: 'interval',
        repeat: 3,
        onDuration: 30,
        offDuration: 90,
        onPower: 1.5,
        offPower: 0.5,
        cadence: 100,
        restingCadence: 80,
        pace: 0,
        onLength: 200,
        offLength: 200,
        time: 360,
      };

      workoutService.duplicateBar(interval, mockCallbacks);

      expect(mockCallbacks.addInterval).toHaveBeenCalledWith(
        3, // repeat
        30, // onDuration
        90, // offDuration
        1.5, // onPower
        0.5, // offPower
        100, // cadence
        80, // restingCadence
        0, // pace
        200, // onLength
        200 // offLength
      );
    });
  });

  describe('moveLeft', () => {
    it('should move bar to the left', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 100, cadence: 0 },
        { id: '2', type: 'bar', time: 200, cadence: 0 },
        { id: '3', type: 'bar', time: 300, cadence: 0 },
      ];

      const result = workoutService.moveLeft(bars, '2');

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
      expect(result[2].id).toBe('3');
    });

    it('should not move if already at the start', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 100, cadence: 0 },
        { id: '2', type: 'bar', time: 200, cadence: 0 },
      ];

      const result = workoutService.moveLeft(bars, '1');

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('moveRight', () => {
    it('should move bar to the right', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 100, cadence: 0 },
        { id: '2', type: 'bar', time: 200, cadence: 0 },
        { id: '3', type: 'bar', time: 300, cadence: 0 },
      ];

      const result = workoutService.moveRight(bars, '2');

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('2');
    });

    it('should not move if already at the end', () => {
      const bars: BarType[] = [
        { id: '1', type: 'bar', time: 100, cadence: 0 },
        { id: '2', type: 'bar', time: 200, cadence: 0 },
      ];

      const result = workoutService.moveRight(bars, '2');

      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('adjustTime', () => {
    it('should increase time by 5 seconds', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 100,
          power: 0.8,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustTime(bars, '1', 5, 'time');

      expect(result[0].time).toBe(105);
    });

    it('should decrease time by 5 seconds', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 100,
          power: 0.8,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustTime(bars, '1', -5, 'time');

      expect(result[0].time).toBe(95);
    });

    it('should not decrease time below minimum', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 3,
          power: 0.8,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustTime(bars, '1', -5, 'time');

      expect(result[0].time).toBe(3);
    });
  });

  describe('adjustPower', () => {
    it('should increase power', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 100,
          power: 0.8,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustPower(bars, '1', 20, 200, 'time', 0.2);

      expect(result[0].power).toBeCloseTo(0.9, 2);
    });

    it('should decrease power', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 100,
          power: 0.8,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustPower(bars, '1', -20, 200, 'time', 0.2);

      expect(result[0].power).toBeCloseTo(0.7, 2);
    });

    it('should not decrease power below minimum', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 100,
          power: 0.25,
          cadence: 0,
        },
      ];

      const result = workoutService.adjustPower(bars, '1', -100, 200, 'time', 0.25);

      expect(result[0].power).toBe(0.25);
    });
  });
});
