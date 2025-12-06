import { BarType, SportType, DurationType } from '../components/Editor/Editor';
import helpers from '../components/helpers';

/**
 * Service for workout manipulation operations
 */

export const workoutService = {
  /**
   * Calculate speed from pace
   */
  calculateSpeed(pace: number): number {
    if (pace === 0) return 0;
    return 60 / pace;
  },

  /**
   * Create a new bar segment
   */
  createBar(
    zone: number,
    duration: number,
    cadence: number,
    pace: number,
    length: number,
    incline: number,
    durationType: DurationType,
    uuidv4: () => string
  ): BarType {
    const speed = this.calculateSpeed(pace);
    
    return {
      time:
        durationType === 'time'
          ? duration
          : helpers.round(helpers.calculateTime(length, speed), 1),
      length:
        durationType === 'time'
          ? helpers.round(helpers.calculateDistance(duration, speed), 1)
          : length,
      power: zone,
      cadence: cadence,
      type: 'bar',
      id: uuidv4(),
      pace: pace,
      incline: incline,
    };
  },

  /**
   * Create a new trapeze segment (warmup/cooldown)
   */
  createTrapeze(
    zone1: number,
    zone2: number,
    duration: number,
    pace: number,
    length: number,
    cadence: number,
    durationType: DurationType,
    uuidv4: () => string
  ): BarType {
    const speed = this.calculateSpeed(pace);
    
    return {
      time:
        durationType === 'time'
          ? duration
          : helpers.round(helpers.calculateTime(length, speed), 1),
      length:
        durationType === 'time'
          ? helpers.round(helpers.calculateDistance(duration, speed), 1)
          : length,
      startPower: zone1,
      endPower: zone2,
      cadence: cadence,
      pace: pace,
      type: 'trapeze',
      id: uuidv4(),
    };
  },

  /**
   * Create a new free ride segment
   */
  createFreeRide(
    duration: number,
    cadence: number,
    length: number,
    durationType: DurationType,
    uuidv4: () => string
  ): BarType {
    return {
      time: durationType === 'time' ? duration : 0,
      length: durationType === 'time' ? 0 : length,
      cadence: cadence,
      type: 'freeRide',
      id: uuidv4(),
    };
  },

  /**
   * Create a new interval segment
   */
  createInterval(
    repeat: number,
    onDuration: number,
    offDuration: number,
    onPower: number,
    offPower: number,
    cadence: number,
    restingCadence: number,
    pace: number,
    onLength: number,
    offLength: number,
    durationType: DurationType,
    uuidv4: () => string
  ): BarType {
    const speed = this.calculateSpeed(pace);
    
    return {
      time:
        durationType === 'time'
          ? (onDuration + offDuration) * repeat
          : helpers.round(
              helpers.calculateTime((onLength + offLength) * repeat, speed),
              1
            ),
      length:
        durationType === 'time'
          ? helpers.round(
              helpers.calculateDistance((onDuration + offDuration) * repeat, speed),
              1
            )
          : (onLength + offLength) * repeat,
      id: uuidv4(),
      type: 'interval',
      cadence: cadence,
      restingCadence: restingCadence,
      repeat: repeat,
      onDuration:
        durationType === 'time'
          ? onDuration
          : helpers.round(
              helpers.calculateTime((onLength * 1) / onPower, speed),
              1
            ),
      offDuration:
        durationType === 'time'
          ? offDuration
          : helpers.round(
              helpers.calculateTime((offLength * 1) / offPower, speed),
              1
            ),
      onPower: onPower,
      offPower: offPower,
      pace: pace,
      onLength:
        durationType === 'time'
          ? helpers.round(
              helpers.calculateDistance((onDuration * 1) / onPower, speed),
              1
            )
          : onLength,
      offLength:
        durationType === 'time'
          ? helpers.round(
              helpers.calculateDistance((offDuration * 1) / offPower, speed),
              1
            )
          : offLength,
    };
  },

  /**
   * Duplicate a bar segment
   */
  duplicateBar(bar: BarType, createFunctions: {
    addBar: (zone: number, duration: number, cadence: number, pace?: number, length?: number) => void;
    addFreeRide: (duration: number, cadence: number, length: number) => void;
    addTrapeze: (zone1: number, zone2: number, duration: number, pace: number, length?: number, cadence?: number) => void;
    addInterval: (
      repeat?: number,
      onDuration?: number,
      offDuration?: number,
      onPower?: number,
      offPower?: number,
      cadence?: number,
      restingCadence?: number,
      pace?: number,
      onLength?: number,
      offLength?: number
    ) => void;
  }): void {
    if (bar.type === 'bar') {
      createFunctions.addBar(
        bar.power || 80,
        bar.time,
        bar.cadence,
        bar.pace,
        bar.length
      );
    }
    if (bar.type === 'freeRide') {
      createFunctions.addFreeRide(bar.time, bar.cadence, bar.length || 0);
    }
    if (bar.type === 'trapeze') {
      createFunctions.addTrapeze(
        bar.startPower || 80,
        bar.endPower || 160,
        bar.time,
        bar.pace || 0,
        bar.length,
        bar.cadence
      );
    }
    if (bar.type === 'interval') {
      createFunctions.addInterval(
        bar.repeat,
        bar.onDuration,
        bar.offDuration,
        bar.onPower,
        bar.offPower,
        bar.cadence,
        bar.restingCadence,
        bar.pace,
        bar.onLength,
        bar.offLength
      );
    }
  },

  /**
   * Move a bar to the left in the array
   */
  moveLeft(bars: BarType[], id: string): BarType[] {
    const index = bars.findIndex((bar) => bar.id === id);
    if (index > 0) {
      const updatedArray = [...bars];
      const element = bars[index];
      updatedArray.splice(index, 1);
      updatedArray.splice(index - 1, 0, element);
      return updatedArray;
    }
    return bars;
  },

  /**
   * Move a bar to the right in the array
   */
  moveRight(bars: BarType[], id: string): BarType[] {
    const index = bars.findIndex((bar) => bar.id === id);
    if (index < bars.length - 1) {
      const updatedArray = [...bars];
      const element = bars[index];
      updatedArray.splice(index, 1);
      updatedArray.splice(index + 1, 0, element);
      return updatedArray;
    }
    return bars;
  },

  /**
   * Adjust time for a bar
   */
  adjustTime(
    bars: BarType[],
    id: string,
    increment: number,
    durationType: DurationType,
    minTime: number = 5,
    minDistance: number = 200
  ): BarType[] {
    const updatedArray = [...bars];
    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];

    if (!element) return bars;

    if (durationType === 'time') {
      if (increment > 0 || element.time > minTime) {
        element.time = element.time + increment;
        element.length =
          (helpers.calculateDistance(
            element.time,
            this.calculateSpeed(element.pace || 0)
          ) *
            1) /
          (element.power || 1);
      }
    } else {
      if (increment > 0 || (element.length || 0) > minDistance) {
        element.length = (element.length || 0) + increment;
        element.time =
          (helpers.calculateTime(
            element.length,
            this.calculateSpeed(element.pace || 0)
          ) *
            1) /
          (element.power || 1);
      }
    }

    return updatedArray;
  },

  /**
   * Adjust power for a bar
   */
  adjustPower(
    bars: BarType[],
    id: string,
    increment: number,
    ftp: number,
    durationType: DurationType,
    minPower: number
  ): BarType[] {
    const updatedArray = [...bars];
    const index = updatedArray.findIndex((bar) => bar.id === id);
    const element = updatedArray[index];

    if (!element || !element.power) return bars;

    const newPower = parseFloat((element.power + increment / ftp).toFixed(3));
    
    if (increment < 0 && newPower < minPower) {
      return bars;
    }

    element.power = newPower;

    if (durationType === 'time') {
      element.length =
        (helpers.calculateDistance(
          element.time,
          this.calculateSpeed(element.pace || 0)
        ) *
          1) /
        element.power;
    } else {
      element.time =
        (helpers.calculateTime(
          element.length || 0,
          this.calculateSpeed(element.pace || 0)
        ) *
          1) /
        element.power;
    }

    return updatedArray;
  },

  /**
   * Generate a random ID
   */
  generateId(): string {
    return Math.random().toString(36).substr(2, 16);
  },
};
