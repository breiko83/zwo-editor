/**
 * Service for parsing text-based running workout descriptions
 * Converts text like "steady 120%HM 2km" into workout segments
 * Running workouts are based on power percentage (e.g., 120%) and pace reference (1M, 5K, 10K, HM, M)
 */

import { DurationType } from '../types/workout';

interface ParsedRunningBlock {
  type: 'steady' | 'ramp' | 'warmup' | 'cooldown' | 'freerun' | 'interval' | 'message';
  power?: number; // power as decimal (e.g., 1.2 for 120%)
  startPower?: number;
  endPower?: number;
  pace?: number; // pace reference: 0=1M, 1=5K, 2=10K, 3=HM, 4=M
  duration?: number; // in seconds (for time-based)
  length?: number; // in meters (for distance-based)
  offDuration?: number; // in seconds (for time-based intervals)
  offLength?: number; // in meters (for distance-based intervals)
  incline?: number; // in percentage (e.g., 1 for i1%, -5 for i-5%)
  restingIncline?: number;
  repeat?: number;
  text?: string;
}

export const runningTextParserService = {
  /**
   * Parse running workout text blocks into structured data
   */
  parseWorkoutText(
    text: string,
    durationType: DurationType
  ): ParsedRunningBlock[] {
    const workoutBlocks = text
      .split('\n')
      .filter((line) => line.trim() !== '');

    const parsedBlocks: ParsedRunningBlock[] = [];

    workoutBlocks.forEach((workoutBlock) => {
      const lowerBlock = workoutBlock.toLowerCase();
      
      // Handle messages first to avoid false positives with keywords
      if (lowerBlock.includes('message')) {
        const parsed = this.parseMessage(workoutBlock, durationType);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (lowerBlock.includes('steady')) {
        const parsed = this.parseSteady(workoutBlock, durationType);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (
        lowerBlock.includes('ramp') ||
        lowerBlock.includes('warmup') ||
        lowerBlock.includes('cooldown')
      ) {
        const parsed = this.parseRamp(workoutBlock, durationType);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (lowerBlock.includes('freerun')) {
        const parsed = this.parseFreeRun(workoutBlock, durationType);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (lowerBlock.includes('interval')) {
        const parsed = this.parseInterval(workoutBlock, durationType);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }
    });

    return parsedBlocks;
  },

  /**
   * Parse message block
   * Format: message "text" 30s or message "text" 2km
   */
  parseMessage(block: string, durationType: DurationType): ParsedRunningBlock | null {
    const doubleQuoteMatch = block.match(/"([^"]*)"/);
    const singleQuoteMatch = block.match(/'([^']*)'/);
    const message = doubleQuoteMatch || singleQuoteMatch;
    const text = message ? message[1] : '';

    if (durationType === 'time') {
      const duration = this.parseDuration(block);
      return {
        type: 'message',
        text,
        duration: duration || 0,
      };
    } else {
      const length = this.parseDistance(block);
      return {
        type: 'message',
        text,
        length: length || 0,
      };
    }
  },

  /**
   * Parse steady state block
   * Format: steady 120%HM 30s, steady 100%5K 2km 180spm
   */
  parseSteady(block: string, durationType: DurationType): ParsedRunningBlock | null {
    const { power, pace } = this.parsePowerAndPace(block);
    const incline = this.parseIncline(block);

    if (durationType === 'time') {
      const duration = this.parseDuration(block);
      return {
        type: 'steady',
        power,
        pace,
        duration: duration || 300,
        incline,
      };
    } else {
      const length = this.parseDistance(block);
      return {
        type: 'steady',
        power,
        pace,
        length: length || 1000,
        incline,
      };
    }
  },

  /**
   * Parse ramp/warmup/cooldown block
   * Format: ramp 80%-120%HM 10m, warmup 60%-100%10K 1km
   */
  parseRamp(block: string, durationType: DurationType): ParsedRunningBlock | null {
    const lowerBlock = block.toLowerCase();
    let type: 'ramp' | 'warmup' | 'cooldown' = 'ramp';
    if (lowerBlock.includes('warmup')) type = 'warmup';
    if (lowerBlock.includes('cooldown')) type = 'cooldown';

    // Parse ramp format: startPower%-endPower%pace
    // Example: 80%-120%HM or 60%-100%5K
    const rampMatch = lowerBlock.match(/(\d+)%-(\d+)%([a-z0-9]+)/);
    
    let startPower = 0.5;
    let endPower = 1.0;
    let pace = 3; // default to HM
    
    if (rampMatch) {
      startPower = parseInt(rampMatch[1]) / 100;
      endPower = parseInt(rampMatch[2]) / 100;
      pace = this.parsePaceReference(rampMatch[3]);
    }

    const incline = this.parseIncline(block);

    if (durationType === 'time') {
      const duration = this.parseDuration(block);
      return {
        type,
        startPower,
        endPower,
        pace,
        duration: duration || 300,
        incline,
      };
    } else {
      const length = this.parseDistance(block);
      return {
        type,
        startPower,
        endPower,
        pace,
        length: length || 1000,
        incline,
      };
    }
  },

  /**
   * Parse free run block
   * Format: freerun 10m, freerun 2km 170spm
   */
  parseFreeRun(block: string, durationType: DurationType): ParsedRunningBlock | null {
    const incline = this.parseIncline(block);

    if (durationType === 'time') {
      const duration = this.parseDuration(block);
      return {
        type: 'freerun',
        duration: duration || 600,
        incline,
      };
    } else {
      const length = this.parseDistance(block);
      return {
        type: 'freerun',
        length: length || 1000,
        incline,
      };
    }
  },

  /**
   * Parse interval block
   * Format: interval 5x 30s-30s 150%-80%5K 180spm-160spm
   * Format: interval 3x 400m-400m 120%-100%HM
   */
  parseInterval(block: string, durationType: DurationType): ParsedRunningBlock | null {
    // Extract repeat count
    const multiplier = block.match(/([0-9]\d*x)/);
    const repeat = multiplier ? parseInt(multiplier[0]) : 3;

    // Parse interval format: onPower%-offPower%pace
    // Example: 150%-80%5K or 120%-100%HM
    const lowerBlock = block.toLowerCase();
    const intervalMatch = lowerBlock.match(/(\d+)%-(\d+)%([a-z0-9]+)/);
    
    let power = 1.5; // default 150%
    let endPower = 0.8; // default 80%
    let pace = 3; // default to HM
    
    if (intervalMatch) {
      power = parseInt(intervalMatch[1]) / 100;
      endPower = parseInt(intervalMatch[2]) / 100;
      pace = this.parsePaceReference(intervalMatch[3]);
    }

    // Extract incline
    const incline = this.parseIncline(block);

    // Extract resting incline (for interval off periods)
    const restingIncline = this.parseIncline(block, true);

    if (durationType === 'time') {
      // Extract on duration
      const durationInSeconds = block.match(/([0-9]\d*s)/);
      const durationInMinutes = block.match(/([0-9]*:?[0-9][0-9]*m)/);

      let duration = durationInSeconds && parseInt(durationInSeconds[0]);
      duration = durationInMinutes
        ? parseInt(durationInMinutes[0].split(':')[0]) * 60 +
          (parseInt(durationInMinutes[0].split(':')[1]) || 0)
        : duration;

      // Extract off duration
      const offDurationInSeconds = block.match(/(-[0-9]\d*s)/);
      const offDurationInMinutes = block.match(/(-[0-9]*:?[0-9][0-9]*m)/);

      let offDuration =
        offDurationInSeconds && Math.abs(parseInt(offDurationInSeconds[0]));
      offDuration = offDurationInMinutes
        ? Math.abs(parseInt(offDurationInMinutes[0].split(':')[0])) * 60 +
          (parseInt(offDurationInMinutes[0].split(':')[1]) || 0)
        : offDuration;

      return {
        type: 'interval',
        repeat,
        duration: duration || 30,
        offDuration: offDuration || 120,
        power,
        endPower,
        pace,
        incline,
        restingIncline,
      };
    } else {
      // Extract distances
      const distances = this.extractAllDistances(block);
      const length = distances[0] || 400; // default 400m
      const offLength = distances[1] || 400;

      return {
        type: 'interval',
        repeat,
        length,
        offLength,
        power,
        endPower,
        pace,
        incline,
        restingIncline,
      };
    }
  },

  /**
   * Parse duration from text (for time-based workouts)
   * Formats: 300s, 5m, 5:30m
   */
  parseDuration(block: string): number | undefined {
    const lowerBlock = block.toLowerCase();
    const durationInSeconds = lowerBlock.match(/([0-9]\d*s)/);
    // Match minutes but avoid matching pace references (1m, 5k, 10k, hm, m after %)
    const durationInMinutes = lowerBlock.match(/(?<!%)([0-9]*:?[0-9][0-9]*m)(?!i)/);

    let duration = durationInSeconds ? parseInt(durationInSeconds[0]) : undefined;
    
    if (durationInMinutes) {
      const parts = durationInMinutes[0].split(':');
      duration = parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
    }

    return duration;
  },

  /**
   * Parse distance from text (for distance-based workouts)
   * Formats: 5km, 400m
   */
  parseDistance(block: string): number | undefined {
    const lowerBlock = block.toLowerCase();
    const distanceInKm = lowerBlock.match(/([0-9]*\.?[0-9]+km)/);
    const distanceInMeters = lowerBlock.match(/\b([0-9]+m)\b/);

    let distance: number | undefined;
    
    if (distanceInKm) {
      distance = parseFloat(distanceInKm[0]) * 1000; // convert to meters
    } else if (distanceInMeters) {
      distance = parseInt(distanceInMeters[0]);
    }

    return distance;
  },

  /**
   * Extract all distances from block
   */
  extractAllDistances(block: string): number[] {
    const distances: number[] = [];
    const lowerBlock = block.toLowerCase();
    
    // Find all distance patterns
    const kmMatches = Array.from(lowerBlock.matchAll(/([0-9]*\.?[0-9]+km)/g));
    const mMatches = Array.from(lowerBlock.matchAll(/\b([0-9]+m)\b/g));

    for (const match of kmMatches) {
      distances.push(parseFloat(match[0]) * 1000);
    }
    for (const match of mMatches) {
      distances.push(parseInt(match[0]));
    }

    return distances;
  },

  /**
   * Parse power and pace from text
   * Formats: 120%HM, 100%5K, 80%1M, 150%10K, 90%M
   * Returns power as decimal (e.g., 1.2 for 120%) and pace as number (0-4)
   */
  parsePowerAndPace(block: string, first: boolean = true, second: boolean = false): { power: number; pace: number } {
    const lowerBlock = block.toLowerCase();
    
    // Match power%pace pattern (e.g., 120%hm, 100%5k)
    const patterns = Array.from(lowerBlock.matchAll(/([0-9]+)%([a-z0-9]+)/g));
    
    let matchIndex = 0;
    if (second && patterns.length > 1) {
      matchIndex = 1;
    }
    
    if (patterns.length > matchIndex) {
      const match = patterns[matchIndex];
      const powerPercent = parseInt(match[1]);
      const paceStr = match[2];
      
      const power = powerPercent / 100; // Convert percentage to decimal
      const pace = this.parsePaceReference(paceStr);

      return { power, pace };
    }
    
    // Default values
    return { power: 1.0, pace: 3 }; // 100% HM
  },

  /**
   * Parse pace reference from string
   * 1M or 1m -> 0
   * 5K or 5k -> 1
   * 10K or 10k -> 2
   * HM or hm -> 3
   * M or m (marathon) -> 4
   */
  parsePaceReference(paceStr: string): number {
    const lower = paceStr.toLowerCase();
    
    if (lower === '1m') return 0;
    if (lower === '5k') return 1;
    if (lower === '10k') return 2;
    if (lower === 'hm') return 3;
    if (lower === 'm') return 4;
    
    return 3; // default to HM
  },

  /**
   * Parse incline from text
   * Format: i1%, i-5%, i10%
   */
  parseIncline(block: string, second: boolean = false): number | undefined {
    const lowerBlock = block.toLowerCase();
    // Match incline pattern: i followed by optional minus and number, then %
    const patterns = Array.from(lowerBlock.matchAll(/i(-?[0-9]+)%/g));
    
    if (patterns.length === 0) return undefined;
    
    const matchIndex = second && patterns.length > 1 ? 1 : 0;
    const match = patterns[matchIndex];
    
    return match ? parseInt(match[1]) : undefined;
  },
};
