import { textParserService } from '../textParserService';

describe('textParserService', () => {
  const ftp = 200;
  const weight = 75;

  describe('parseWorkoutText', () => {
    it('should parse steady block with power in watts', () => {
      const text = 'steady 150w 5m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'steady',
        power: 0.75, // 150w / 200 FTP
        duration: 300, // 5 minutes
      });
      expect(result[0].cadence).toBeUndefined();
    });

    it('should parse steady block with power in w/kg', () => {
      const text = 'steady 3.0wkg 10m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'steady',
        power: 1.125, // 3.0 * 75kg / 200 FTP
        duration: 600, // 10 minutes
      });
    });

    it('should parse steady block with power in percentage', () => {
      const text = 'steady 80% 30s';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'steady',
        power: 0.8,
        duration: 30,
      });
    });

    it('should parse steady block with cadence', () => {
      const text = 'steady 200w 5m 95rpm';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'steady',
        power: 1.0,
        duration: 300,
        cadence: 95,
      });
    });

    it('should parse warmup block', () => {
      const text = 'warmup 100w-200w 10m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'warmup',
        startPower: 0.5, // 100w / 200 FTP
        endPower: 1.0, // 200w / 200 FTP
        duration: 600,
      });
    });

    it('should parse cooldown block', () => {
      const text = 'cooldown 180w-100w 5m 85rpm';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'cooldown',
        startPower: 0.9,
        endPower: 0.5,
        duration: 300,
        cadence: 85,
      });
    });

    it('should parse ramp block', () => {
      const text = 'ramp 50%-100% 8m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'ramp',
        startPower: 0.5,
        endPower: 1.0,
        duration: 480,
      });
    });

    it('should parse interval block', () => {
      const text = 'interval 5x 30s-90s 250w-150w';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('interval');
      expect(result[0].repeat).toBe(5);
      expect(result[0].duration).toBe(30);
      expect(result[0].offDuration).toBe(90);
      // Intervals use 'power' and 'endPower' properties
      expect(result[0].power).toBeDefined();
      expect(result[0].endPower).toBeDefined();
    });

    it('should parse interval block with cadence', () => {
      const text = 'interval 3x 1m-2m 300w-180w 110rpm-85rpm';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('interval');
      expect(result[0].repeat).toBe(3);
      expect(result[0].duration).toBe(60);
      expect(result[0].offDuration).toBe(120);
      expect(result[0].cadence).toBe(110);
      expect(result[0].restingCadence).toBe(85);
      // Power values should be defined
      expect(result[0].endPower).toBeDefined();
    });

    it('should parse freeride block', () => {
      const text = 'freeride 10m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('freeride');
      expect(result[0].duration).toBe(600);
      expect(result[0].cadence).toBeUndefined();
    });

    it('should parse freeride block with cadence', () => {
      const text = 'freeride 5m 90rpm';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: 'freeride',
        duration: 300,
        cadence: 90,
      });
    });

    it('should parse message block with time offset', () => {
      const text = 'message "Get ready!" 30s';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('message');
      expect(result[0].text).toBe('get ready!'); // Text is lowercased
      expect(result[0].duration).toBe(30);
    });

    it('should parse message block with minute offset', () => {
      const text = 'message "Last one!" 20m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('message');
      expect(result[0].text).toBe('last one!'); // Text is lowercased
      expect(result[0].duration).toBe(1200);
    });

    it('should parse multiple blocks', () => {
      const text = `warmup 100w-200w 10m
steady 250w 5m 95rpm
interval 5x 30s-90s 300w-150w
cooldown 200w-100w 5m`;

      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(4);
      expect(result[0].type).toBe('warmup');
      expect(result[1].type).toBe('steady');
      expect(result[2].type).toBe('interval');
      expect(result[3].type).toBe('cooldown');
    });

    it('should skip empty lines', () => {
      const text = `steady 200w 5m

warmup 100w-200w 10m`;

      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(2);
    });

    it('should handle time format hh:mm', () => {
      const text = 'steady 200w 1:30m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].duration).toBe(90); // 1:30 minutes = 90 seconds
    });

    it('should handle mixed w/kg and percentage power', () => {
      const text = 'ramp 2.5wkg-95% 10m';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('ramp');
      expect(result[0].duration).toBe(600);
      // Power values should be defined
      expect(result[0].startPower).toBeDefined();
      expect(result[0].endPower).toBeDefined();
    });

    it('should return empty array for invalid input', () => {
      const text = 'invalid input without proper format';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(0);
    });

    it('should handle intervals with w/kg format', () => {
      const text = 'interval 10x 30s-30s 4.0wkg-1.0wkg';
      const result = textParserService.parseWorkoutText(text, ftp, weight);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('interval');
      expect(result[0].repeat).toBe(10);
      expect(result[0].duration).toBe(30);
      expect(result[0].offDuration).toBe(30);
      // Intervals use 'power' property
      expect(result[0].power).toBeDefined();
      expect(result[0].endPower).toBeDefined();
    });
  });

  describe('parseSteady', () => {
    it('should parse steady with all parameters', () => {
      const result = textParserService.parseSteady('steady 200w 5m 90rpm', ftp, weight);

      expect(result).toMatchObject({
        type: 'steady',
        power: 1.0,
        duration: 300,
        cadence: 90,
      });
    });

    it('should return steady with default values for invalid format', () => {
      const result = textParserService.parseSteady('invalid', ftp, weight);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('steady');
    });
  });

  describe('parseRamp', () => {
    it('should parse ramp with power range', () => {
      const result = textParserService.parseRamp('ramp 100w-200w 10m', ftp, weight);

      expect(result).toMatchObject({
        type: 'ramp',
        startPower: 0.5,
        endPower: 1.0,
        duration: 600,
      });
    });

    it('should return ramp with default values for invalid format', () => {
      const result = textParserService.parseRamp('invalid', ftp, weight);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('ramp');
    });
  });

  describe('parseFreeRide', () => {
    it('should parse freeride with duration', () => {
      const result = textParserService.parseFreeRide('freeride 10m');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('freeride');
      expect(result?.duration).toBe(600);
    });

    it('should still return freeride with default values for invalid format', () => {
      const result = textParserService.parseFreeRide('invalid');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('freeride');
      expect(result?.duration).toBe(600);
    });
  });

  describe('parseInterval', () => {
    it('should parse interval with all parameters', () => {
      const result = textParserService.parseInterval('interval 5x 30s-90s 250w-150w 100rpm-80rpm', ftp, weight);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('interval');
      expect(result?.repeat).toBe(5);
      expect(result?.duration).toBe(30);
      expect(result?.offDuration).toBe(90);
      expect(result?.cadence).toBe(100);
      expect(result?.restingCadence).toBe(80);
      // Intervals use 'power' not 'startPower'
      expect(result?.power).toBeDefined();
      expect(result?.endPower).toBeDefined();
    });

    it('should return interval with default values for invalid format', () => {
      const result = textParserService.parseInterval('invalid', ftp, weight);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('interval');
    });
  });

  describe('parseMessage', () => {
    it('should parse message with quoted text', () => {
      const result = textParserService.parseMessage('message "Hello World!" 30s');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('message');
      expect(result?.text).toBe('Hello World!');
      expect(result?.duration).toBe(30);
    });

    it('should return default values for invalid message format', () => {
      const result = textParserService.parseMessage('invalid');

      expect(result).not.toBeNull();
      expect(result?.type).toBe('message');
      expect(result?.text).toBe('');
      expect(result?.duration).toBe(0);
    });
  });
});
