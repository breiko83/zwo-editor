/**
 * Service for parsing text-based workout descriptions
 * Converts text like "steady 200w 5m" into workout segments
 */

interface ParsedBlock {
  type: 'steady' | 'ramp' | 'warmup' | 'cooldown' | 'freeride' | 'interval' | 'message';
  power?: number;
  startPower?: number;
  endPower?: number;
  duration?: number;
  offDuration?: number;
  cadence?: number;
  restingCadence?: number;
  repeat?: number;
  text?: string;
}

export const textParserService = {
  /**
   * Parse workout text blocks into structured data
   */
  parseWorkoutText(
    text: string,
    ftp: number,
    weight: number
  ): ParsedBlock[] {
    const workoutBlocks = text
      .toLowerCase()
      .split('\n')
      .filter((line) => line.trim() !== '');

    const parsedBlocks: ParsedBlock[] = [];

    workoutBlocks.forEach((workoutBlock) => {
      // Handle messages first to avoid false positives with keywords
      if (workoutBlock.includes('message')) {
        const parsed = this.parseMessage(workoutBlock);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (workoutBlock.includes('steady')) {
        const parsed = this.parseSteady(workoutBlock, ftp, weight);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (
        workoutBlock.includes('ramp') ||
        workoutBlock.includes('warmup') ||
        workoutBlock.includes('cooldown')
      ) {
        const parsed = this.parseRamp(workoutBlock, ftp, weight);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (workoutBlock.includes('freeride')) {
        const parsed = this.parseFreeRide(workoutBlock);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }

      if (workoutBlock.includes('interval')) {
        const parsed = this.parseInterval(workoutBlock, ftp, weight);
        if (parsed) parsedBlocks.push(parsed);
        return;
      }
    });

    return parsedBlocks;
  },

  /**
   * Parse message block
   * Format: message "text" 30s or message 'text' 5m
   */
  parseMessage(block: string): ParsedBlock | null {
    const doubleQuoteMatch = block.match(/"([^"]*)"/);
    const singleQuoteMatch = block.match(/'([^']*)'/);
    const message = doubleQuoteMatch || singleQuoteMatch;
    const text = message ? message[1] : '';

    const duration = this.parseDuration(block);

    return {
      type: 'message',
      text,
      duration: duration || 0,
    };
  },

  /**
   * Parse steady state block
   * Format: steady 200w 5m, steady 2.5wkg 300s, steady 80% 10m
   */
  parseSteady(block: string, ftp: number, weight: number): ParsedBlock | null {
    const power = this.parsePower(block, ftp, weight);
    const duration = this.parseDuration(block);
    const cadence = this.parseCadence(block);

    return {
      type: 'steady',
      power,
      duration: duration || 300,
      cadence,
    };
  },

  /**
   * Parse ramp/warmup/cooldown block
   * Format: ramp 100w-200w 10m, warmup 50%-100% 5m
   */
  parseRamp(block: string, ftp: number, weight: number): ParsedBlock | null {
    let type: 'ramp' | 'warmup' | 'cooldown' = 'ramp';
    if (block.includes('warmup')) type = 'warmup';
    if (block.includes('cooldown')) type = 'cooldown';

    // Extract start power
    const powerInWatts = block.match(/([0-9]\d*w)/);
    const powerInWattsPerKg = block.match(/([0-9]*.?[0-9]wkg)/);
    const powerInPercentageFtp = block.match(/([0-9]\d*%)/);

    let startPower = powerInWatts ? parseInt(powerInWatts[0]) / ftp : 1;
    startPower = powerInWattsPerKg
      ? (parseFloat(powerInWattsPerKg[0]) * weight) / ftp
      : startPower;
    startPower = powerInPercentageFtp
      ? parseInt(powerInPercentageFtp[0]) / 100
      : startPower;

    // Extract end power
    const endPowerInWatts = block.match(/(-[0-9]\d*w)/);
    const endPowerInWattsPerKg = block.match(/(-[0-9]*.?[0-9]wkg)/);
    const endPowerInPercentageFtp = block.match(/-([0-9]\d*%)/);

    let endPower = endPowerInWatts
      ? Math.abs(parseInt(endPowerInWatts[0])) / ftp
      : 1;
    endPower = endPowerInWattsPerKg
      ? (Math.abs(parseFloat(endPowerInWattsPerKg[0])) * weight) / ftp
      : endPower;
    endPower = endPowerInPercentageFtp
      ? Math.abs(parseInt(endPowerInPercentageFtp[0])) / 100
      : endPower;

    const duration = this.parseDuration(block);
    const cadence = this.parseCadence(block);

    return {
      type,
      startPower,
      endPower,
      duration: duration || 300,
      cadence,
    };
  },

  /**
   * Parse free ride block
   * Format: freeride 10m, freeride 600s 80rpm
   */
  parseFreeRide(block: string): ParsedBlock | null {
    const duration = this.parseDuration(block);
    const cadence = this.parseCadence(block);

    return {
      type: 'freeride',
      duration: duration || 600,
      cadence,
    };
  },

  /**
   * Parse interval block
   * Format: interval 5x 30s-120s 300w-150w 100rpm-80rpm
   */
  parseInterval(block: string, ftp: number, weight: number): ParsedBlock | null {
    // Extract repeat count
    const multiplier = block.match(/([0-9]\d*x)/);
    const repeat = multiplier ? parseInt(multiplier[0]) : 3;

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

    // Extract start power (on power)
    const startPowerInWatts = block.match(/([0-9]\d*w)/);
    const startPowerInWattsPerKg = block.match(/([0-9]*.?[0-9]wkg)/);
    const startPowerInPercentageFtp = block.match(/([0-9]\d*%)/);

    let startPower = startPowerInWatts
      ? parseInt(startPowerInWatts[0]) / ftp
      : 1;
    startPower = startPowerInWattsPerKg
      ? (parseFloat(startPowerInWattsPerKg[0]) * weight) / ftp
      : startPower;
    startPower = startPowerInPercentageFtp
      ? parseInt(startPowerInPercentageFtp[0]) / 100
      : startPower;

    // Extract end power (off power)
    const endPowerInWatts = block.match(/(-[0-9]\d*w)/);
    const endPowerInWattsPerKg = block.match(/(-[0-9]*.?[0-9]wkg)/);
    const endPowerInPercentageFtp = block.match(/-([0-9]\d*%)/);

    let endPower = endPowerInWatts
      ? Math.abs(parseInt(endPowerInWatts[0])) / ftp
      : 0.5;
    endPower = endPowerInWattsPerKg
      ? (Math.abs(parseFloat(endPowerInWattsPerKg[0])) * weight) / ftp
      : endPower;
    endPower = endPowerInPercentageFtp
      ? Math.abs(parseInt(endPowerInPercentageFtp[0])) / 100
      : endPower;

    // Extract cadence
    const cadence = this.parseCadence(block);

    // Extract resting cadence
    const restingCadenceMatch = block.match(/(-[0-9]\d*rpm)/);
    const restingCadence = restingCadenceMatch
      ? Math.abs(parseInt(restingCadenceMatch[0]))
      : undefined;

    return {
      type: 'interval',
      repeat,
      duration: duration || 30,
      offDuration: offDuration || 120,
      power: startPower,
      endPower,
      cadence,
      restingCadence,
    };
  },

  /**
   * Parse duration from text
   * Formats: 300s, 5m, 5:30m
   */
  parseDuration(block: string): number | undefined {
    const durationInSeconds = block.match(/([0-9]\d*s)/);
    const durationInMinutes = block.match(/([0-9]*:?[0-9][0-9]*m)/);

    let duration = durationInSeconds ? parseInt(durationInSeconds[0]) : undefined;
    
    if (durationInMinutes) {
      const parts = durationInMinutes[0].split(':');
      duration = parseInt(parts[0]) * 60 + (parseInt(parts[1]) || 0);
    }

    return duration;
  },

  /**
   * Parse power from text
   * Formats: 200w, 2.5wkg, 80%
   */
  parsePower(block: string, ftp: number, weight: number): number {
    const powerInWatts = block.match(/([0-9]\d*w)/);
    const powerInWattsPerKg = block.match(/([0-9]*.?[0-9]wkg)/);
    const powerInPercentageFtp = block.match(/([0-9]\d*%)/);

    let power = powerInWatts ? parseInt(powerInWatts[0]) / ftp : 1;
    power = powerInWattsPerKg
      ? (parseFloat(powerInWattsPerKg[0]) * weight) / ftp
      : power;
    power = powerInPercentageFtp
      ? parseInt(powerInPercentageFtp[0]) / 100
      : power;

    return power;
  },

  /**
   * Parse cadence from text
   * Format: 80rpm, 100rpm
   */
  parseCadence(block: string): number | undefined {
    const cadence = block.match(/([0-9]\d*rpm)/);
    return cadence ? parseInt(cadence[0]) : undefined;
  },
};
