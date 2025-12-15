import { runningTextParserService } from '../runningTextParserService';

describe('runningTextParserService', () => {
  describe('Time-based workouts', () => {
    const durationType = 'time' as const;

    describe('parseWorkoutText', () => {
      it('should parse steady block with power and pace', () => {
        const text = 'steady 100%HM 5m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.0, // 100%
          pace: 3, // HM
          duration: 300, // 5 minutes
        });
      });

      it('should parse steady block with different pace reference', () => {
        const text = 'steady 120%5K 10m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.2, // 120%
          pace: 1, // 5K
          duration: 600, // 10 minutes
        });
      });

      it('should parse steady block with incline', () => {
        const text = 'steady 110%10K 5m i2%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.1, // 110%
          pace: 2, // 10K
          duration: 300,
          incline: 2,
        });
      });

      it('should parse warmup block', () => {
        const text = 'warmup 60%-100%HM 10m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'warmup',
          startPower: 0.6, // 60%
          endPower: 1.0, // 100%
          pace: 3, // HM
          duration: 600,
        });
      });

      it('should parse cooldown block', () => {
        const text = 'cooldown 100%-70%HM 5m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'cooldown',
          startPower: 1.0,
          endPower: 0.7,
          pace: 3, // HM
          duration: 300,
        });
      });

      it('should parse ramp block', () => {
        const text = 'ramp 80%-120%10K 8m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'ramp',
          startPower: 0.8,
          endPower: 1.2,
          pace: 2, // 10K
          duration: 480,
        });
      });

      it('should parse cooldown block with incline', () => {
        const text = 'cooldown 100%-70%HM 5m i-2%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'cooldown',
          startPower: 1.0,
          endPower: 0.7,
          pace: 3, // HM
          duration: 300,
          incline: -2,
        });
      });

      it('should parse ramp block', () => {
        const text = 'ramp 60%-120%5K 8m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'ramp',
          startPower: 0.6,
          endPower: 1.2,
          pace: 1, // 5K
          duration: 480,
        });
      });

      it('should parse interval block with time', () => {
        const text = 'interval 5x 30s-90s 150%-80%5K';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('interval');
        expect(result[0].repeat).toBe(5);
        expect(result[0].duration).toBe(30);
        expect(result[0].offDuration).toBe(90);
        expect(result[0].power).toBe(1.5); // 150%
        expect(result[0].endPower).toBe(0.8); // 80%
        expect(result[0].pace).toBe(1); // 5K
      });

      it('should parse interval block with incline', () => {
        const text = 'interval 3x 1m-2m 120%-100%HM i1%-i0%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('interval');
        expect(result[0].repeat).toBe(3);
        expect(result[0].duration).toBe(60);
        expect(result[0].offDuration).toBe(120);
        expect(result[0].incline).toBe(1);
        expect(result[0].restingIncline).toBe(0);
        expect(result[0].power).toBe(1.2); // 120%
        expect(result[0].pace).toBe(3); // HM
      });

      it('should parse freerun block', () => {
        const text = 'freerun 10m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('freerun');
        expect(result[0].duration).toBe(600);
        expect(result[0].incline).toBeUndefined();
      });

      it('should parse freerun block with incline', () => {
        const text = 'freerun 5m i3%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'freerun',
          duration: 300,
          incline: 3,
        });
      });

      it('should parse message block with time offset', () => {
        const text = 'message "Get ready!" 30s';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('message');
        expect(result[0].text).toBe('Get ready!');
        expect(result[0].duration).toBe(30);
      });

      it('should parse message block with minute offset', () => {
        const text = 'message "Last one!" 20m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('message');
        expect(result[0].text).toBe('Last one!');
        expect(result[0].duration).toBe(1200);
      });

      it('should parse multiple blocks', () => {
        const text = `warmup 60%-100%HM 10m
steady 100%5K 5m
interval 5x 30s-90s 150%-80%5K
cooldown 100%-70%HM 5m`;

        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(4);
        expect(result[0].type).toBe('warmup');
        expect(result[1].type).toBe('steady');
        expect(result[2].type).toBe('interval');
        expect(result[3].type).toBe('cooldown');
      });

      it('should skip empty lines', () => {
        const text = `steady 100%HM 5m

warmup 60%-100%HM 10m`;

        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(2);
      });

      it('should handle time format hh:mm', () => {
        const text = 'steady 100%HM 1:30m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].duration).toBe(90); // 1:30 minutes = 90 seconds
      });
    });
  });

  describe('Distance-based workouts', () => {
    const durationType = 'distance' as const;

    describe('parseWorkoutText', () => {
      it('should parse steady block with distance in km', () => {
        const text = 'steady 100%HM 2km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.0, // 100%
          pace: 3, // HM
          length: 2000, // 2km = 2000 meters
        });
      });

      it('should parse steady block with distance in meters', () => {
        const text = 'steady 110%10K 800m';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.1,
          pace: 2, // 10K
          length: 800,
        });
      });

      it('should parse steady block with incline', () => {
        const text = 'steady 100%HM 5km i1%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'steady',
          power: 1.0,
          pace: 3, // HM
          length: 5000,
          incline: 1,
        });
      });

      it('should parse warmup block', () => {
        const text = 'warmup 60%-100%HM 1km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'warmup',
          startPower: 0.6,
          endPower: 1.0,
          pace: 3, // HM
          length: 1000,
        });
      });

      it('should parse cooldown block', () => {
        const text = 'cooldown 100%-70%HM 2km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'cooldown',
          startPower: 1.0,
          endPower: 0.7,
          pace: 3, // HM
          length: 2000,
        });
      });

      it('should parse interval block with distance', () => {
        const text = 'interval 10x 400m-400m 150%-80%5K';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('interval');
        expect(result[0].repeat).toBe(10);
        expect(result[0].length).toBe(400);
        expect(result[0].offLength).toBe(400);
        expect(result[0].power).toBe(1.5); // 150%
        expect(result[0].endPower).toBe(0.8); // 80%
        expect(result[0].pace).toBe(1); // 5K
      });

      it('should parse interval block with different on/off distances', () => {
        const text = 'interval 3x 1km-400m 120%-100%HM';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('interval');
        expect(result[0].repeat).toBe(3);
        expect(result[0].length).toBe(1000);
        expect(result[0].offLength).toBe(400);
        expect(result[0].power).toBe(1.2); // 120%
        expect(result[0].pace).toBe(3); // HM
      });

      it('should parse interval block with incline', () => {
        const text = 'interval 5x 800m-400m 150%-80%5K i2%-i0%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('interval');
        expect(result[0].repeat).toBe(5);
        expect(result[0].length).toBe(800);
        expect(result[0].offLength).toBe(400);
        expect(result[0].incline).toBe(2);
        expect(result[0].restingIncline).toBe(0);
      });

      it('should parse freerun block', () => {
        const text = 'freerun 2km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('freerun');
        expect(result[0].length).toBe(2000);
        expect(result[0].incline).toBeUndefined();
      });

      it('should parse freerun block with incline', () => {
        const text = 'freerun 1km i5%';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          type: 'freerun',
          length: 1000,
          incline: 5,
        });
      });

      it('should parse message block with distance offset', () => {
        const text = 'message "Get ready!" 1km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('message');
        expect(result[0].text).toBe('Get ready!');
        expect(result[0].length).toBe(1000);
      });

      it('should parse multiple blocks', () => {
        const text = `warmup 60%-100%HM 1km
steady 120%HM 2km
interval 5x 400m-400m 150%-80%5K
cooldown 100%-70%HM 1km`;

        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(4);
        expect(result[0].type).toBe('warmup');
        expect(result[1].type).toBe('steady');
        expect(result[2].type).toBe('interval');
        expect(result[3].type).toBe('cooldown');
      });

      it('should handle decimal distances', () => {
        const text = 'steady 100%HM 2.5km';
        const result = runningTextParserService.parseWorkoutText(text, durationType);

        expect(result).toHaveLength(1);
        expect(result[0].length).toBe(2500);
      });
    });
  });

  describe('Helper methods', () => {
    describe('parsePowerAndPace', () => {
      it('should parse power and pace reference (120%HM)', () => {
        const result = (runningTextParserService as any).parsePowerAndPace('120%HM');
        expect(result).toEqual({ power: 1.2, pace: 3 });
      });

      it('should parse power and pace reference (150%5K)', () => {
        const result = (runningTextParserService as any).parsePowerAndPace('150%5K');
        expect(result).toEqual({ power: 1.5, pace: 1 });
      });

      it('should parse power and pace reference (80%M)', () => {
        const result = (runningTextParserService as any).parsePowerAndPace('80%M');
        expect(result).toEqual({ power: 0.8, pace: 4 });
      });

      it('should parse power and pace reference (100%1M)', () => {
        const result = (runningTextParserService as any).parsePowerAndPace('100%1M');
        expect(result).toEqual({ power: 1.0, pace: 0 });
      });

      it('should return default values for invalid format', () => {
        const result = (runningTextParserService as any).parsePowerAndPace('invalid');
        expect(result).toEqual({ power: 1.0, pace: 3 }); // Default to 100% HM
      });
    });

    describe('parsePaceReference', () => {
      it('should parse 1M as pace 0', () => {
        const result = (runningTextParserService as any).parsePaceReference('1M');
        expect(result).toBe(0);
      });

      it('should parse 5K as pace 1', () => {
        const result = (runningTextParserService as any).parsePaceReference('5K');
        expect(result).toBe(1);
      });

      it('should parse 10K as pace 2', () => {
        const result = (runningTextParserService as any).parsePaceReference('10K');
        expect(result).toBe(2);
      });

      it('should parse HM as pace 3', () => {
        const result = (runningTextParserService as any).parsePaceReference('HM');
        expect(result).toBe(3);
      });

      it('should parse M as pace 4', () => {
        const result = (runningTextParserService as any).parsePaceReference('M');
        expect(result).toBe(4);
      });

      it('should return 3 (HM) as default for unknown reference', () => {
        const result = (runningTextParserService as any).parsePaceReference('UNKNOWN');
        expect(result).toBe(3);
      });
    });

    describe('parseIncline', () => {
      it('should parse positive incline', () => {
        const incline = (runningTextParserService as any).parseIncline('steady 100%HM 2km i1%');
        expect(incline).toBe(1);
      });

      it('should parse negative incline', () => {
        const incline = (runningTextParserService as any).parseIncline('steady 100%HM 2km i-5%');
        expect(incline).toBe(-5);
      });

      it('should parse double digit incline', () => {
        const incline = (runningTextParserService as any).parseIncline('steady 100%HM 2km i10%');
        expect(incline).toBe(10);
      });

      it('should parse second incline value', () => {
        const incline = (runningTextParserService as any).parseIncline('interval 5x 400m-400m 150%-80%5K i2%-i0%', true);
        expect(incline).toBe(0);
      });

      it('should return undefined for missing incline', () => {
        const incline = (runningTextParserService as any).parseIncline('steady 100%HM 2km');
        expect(incline).toBeUndefined();
      });
    });

    describe('parseDistance', () => {
      it('should parse distance in km', () => {
        const distance = (runningTextParserService as any).parseDistance('steady 100%HM 5km');
        expect(distance).toBe(5000);
      });

      it('should parse distance in meters', () => {
        const distance = (runningTextParserService as any).parseDistance('interval 5x 400m-400m 150%-80%5K');
        expect(distance).toBe(400);
      });

      it('should return undefined for invalid format', () => {
        const distance = (runningTextParserService as any).parseDistance('invalid');
        expect(distance).toBeUndefined();
      });
    });

    describe('parseDuration', () => {
      it('should parse duration in seconds', () => {
        const duration = (runningTextParserService as any).parseDuration('steady 100%HM 30s');
        expect(duration).toBe(30);
      });

      it('should parse duration in minutes', () => {
        const duration = (runningTextParserService as any).parseDuration('steady 100%HM 10m');
        expect(duration).toBe(600);
      });

      it('should parse duration in mm:ss format', () => {
        const duration = (runningTextParserService as any).parseDuration('steady 100%HM 1:30m');
        expect(duration).toBe(90);
      });

      it('should return undefined for invalid format', () => {
        const duration = (runningTextParserService as any).parseDuration('invalid');
        expect(duration).toBeUndefined();
      });
    });
  });
});
