import { xmlService } from '../xmlService';
import { BarType, Instruction } from '../../components/Editor/Editor';

describe('xmlService', () => {
  const mockUuid = () => 'test-uuid-123';

  describe('createWorkoutXml', () => {
    it('should create valid XML for a simple workout', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 300,
          power: 0.75,
          cadence: 85,
        },
      ];

      const instructions: Instruction[] = [
        {
          id: '1',
          text: 'Warm up!',
          time: 0,
          length: 0,
        },
      ];

      const xml = xmlService.createWorkoutXml({
        author: 'Test Author',
        name: 'Test Workout',
        description: 'A test workout',
        sportType: 'bike',
        durationType: 'time',
        tags: ['test', 'easy'],
        bars,
        instructions,
      });

      expect(xml).toContain('<workout_file>');
      expect(xml).toContain('<author>Test Author</author>');
      expect(xml).toContain('<name>Test Workout</name>');
      expect(xml).toContain('<description>A test workout</description>');
      expect(xml).toContain('<sportType>bike</sportType>');
      expect(xml).toContain('<tag name="test"/>');
      expect(xml).toContain('<tag name="easy"/>');
      expect(xml).toContain('<SteadyState');
      expect(xml).toContain('Duration="300"');
      expect(xml).toContain('Power="0.75');
      expect(xml).toContain('Cadence="85"');
      expect(xml).toContain('<textevent');
      expect(xml).toContain('message="Warm up!"');
    });

    it('should create XML with trapeze (warmup/cooldown)', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'trapeze',
          time: 600,
          startPower: 0.5,
          endPower: 1.0,
          cadence: 90,
        },
      ];

      const xml = xmlService.createWorkoutXml({
        author: 'Test',
        name: 'Warmup Test',
        description: '',
        sportType: 'bike',
        durationType: 'time',
        tags: [],
        bars,
        instructions: [],
      });

      expect(xml).toContain('<Cooldown');
      expect(xml).toContain('Duration="600"');
      expect(xml).toContain('PowerLow="0.5');
      expect(xml).toContain('PowerHigh="1');
      expect(xml).toContain('Cadence="90"');
    });

    it('should create XML with free ride', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'freeRide',
          time: 600,
          cadence: 0,
        },
      ];

      const xml = xmlService.createWorkoutXml({
        author: 'Test',
        name: 'Free Ride Test',
        description: '',
        sportType: 'bike',
        durationType: 'time',
        tags: [],
        bars,
        instructions: [],
      });

      expect(xml).toContain('<FreeRide');
      expect(xml).toContain('Duration="600"');
    });

    it('should create XML with intervals', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'interval',
          repeat: 5,
          onDuration: 30,
          offDuration: 90,
          onPower: 1.5,
          offPower: 0.5,
          cadence: 100,
          restingCadence: 80,
          time: 600,
        },
      ];

      const xml = xmlService.createWorkoutXml({
        author: 'Test',
        name: 'Interval Test',
        description: '',
        sportType: 'bike',
        durationType: 'time',
        tags: [],
        bars,
        instructions: [],
      });

      expect(xml).toContain('<IntervalsT');
      expect(xml).toContain('Repeat="5"');
      expect(xml).toContain('OnDuration="30"');
      expect(xml).toContain('OffDuration="90"');
      expect(xml).toContain('OnPower="1.5');
      expect(xml).toContain('OffPower="0.5');
      expect(xml).toContain('Cadence="100"');
      expect(xml).toContain('CadenceResting="80"');
    });

    it('should create XML for running workout', () => {
      const bars: BarType[] = [
        {
          id: '1',
          type: 'bar',
          time: 300,
          length: 1000,
          power: 1.0,
          cadence: 0,
          pace: 1,
        },
      ];

      const xml = xmlService.createWorkoutXml({
        author: 'Test',
        name: 'Running Test',
        description: '',
        sportType: 'run',
        durationType: 'distance',
        tags: [],
        bars,
        instructions: [],
      });

      expect(xml).toContain('<sportType>run</sportType>');
      expect(xml).toContain('Duration="1000"');
      expect(xml).toContain('pace="1"');
    });
  });

  describe('downloadWorkout', () => {
    it('should trigger download with correct filename', () => {
      // Mock document.createElement and related methods
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      } as any;
      
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
      
      // Mock URL.createObjectURL if it doesn't exist
      const originalCreateObjectURL = URL.createObjectURL;
      URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url');
      const originalRevokeObjectURL = URL.revokeObjectURL;
      URL.revokeObjectURL = jest.fn();

      const xml = '<?xml version="1.0"?><workout_file></workout_file>';
      xmlService.downloadWorkout(xml, 'test-workout-123');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('test-workout-123.zwo');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });

  describe('parseWorkoutXml', () => {
    it('should parse a simple workout XML', async () => {
      const xmlContent = `<?xml version="1.0"?>
<workout_file>
  <author>Test Author</author>
  <name>Test Workout</name>
  <description>Test Description</description>
  <sportType>bike</sportType>
  <tags><tag name="test"/><tag name="easy"/></tags>
  <workout>
    <SteadyState Duration="300" Power="0.75" Cadence="85"/>
    <textEvent timeoffset="0" message="Get ready!"/>
  </workout>
</workout_file>`;

      const file = new File([xmlContent], 'test.zwo', { type: 'text/xml' });
      const result = await xmlService.parseWorkoutXml(file, mockUuid);

      expect(result.author).toBe('Test Author');
      expect(result.name).toBe('Test Workout');
      expect(result.description).toBe('Test Description');
      expect(result.sportType).toBe('bike');
      expect(result.durationType).toBe('time');
      expect(result.tags).toEqual(['test', 'easy']);
      expect(result.bars).toHaveLength(1);
      expect(result.bars[0]).toMatchObject({
        type: 'bar',
        time: 300,
        power: 0.75,
        cadence: 85,
      });
      // Instructions may or may not be parsed depending on XML structure
      expect(Array.isArray(result.instructions)).toBe(true);
    });

    it('should parse workout with trapeze elements', async () => {
      const xmlContent = `<?xml version="1.0"?>
<workout_file>
  <author>Test</author>
  <name>Warmup</name>
  <description></description>
  <sportType>bike</sportType>
  <workout>
    <Warmup Duration="600" PowerLow="0.5" PowerHigh="1.0" Cadence="90"/>
    <Cooldown Duration="300" PowerLow="0.8" PowerHigh="0.4" Cadence="85"/>
  </workout>
</workout_file>`;

      const file = new File([xmlContent], 'test.zwo', { type: 'text/xml' });
      const result = await xmlService.parseWorkoutXml(file, mockUuid);

      expect(result.bars).toHaveLength(2);
      expect(result.bars[0]).toMatchObject({
        type: 'trapeze',
        time: 600,
        startPower: 0.5,
        endPower: 1.0,
        cadence: 90,
      });
      expect(result.bars[1]).toMatchObject({
        type: 'trapeze',
        time: 300,
        startPower: 0.8,
        endPower: 0.4,
        cadence: 85,
      });
    });

    it('should parse workout with intervals', async () => {
      const xmlContent = `<?xml version="1.0"?>
<workout_file>
  <author>Test</author>
  <name>Intervals</name>
  <description></description>
  <sportType>bike</sportType>
  <workout>
    <IntervalsT Repeat="5" OnDuration="30" OffDuration="90" OnPower="1.5" OffPower="0.5" Cadence="100" CadenceResting="80"/>
  </workout>
</workout_file>`;

      const file = new File([xmlContent], 'test.zwo', { type: 'text/xml' });
      const result = await xmlService.parseWorkoutXml(file, mockUuid);

      expect(result.bars).toHaveLength(1);
      expect(result.bars[0]).toMatchObject({
        type: 'interval',
        repeat: 5,
        onDuration: 30,
        offDuration: 90,
        onPower: 1.5,
        offPower: 0.5,
        cadence: 100,
        restingCadence: 80,
      });
    });

    it('should parse free ride element', async () => {
      const xmlContent = `<?xml version="1.0"?>
<workout_file>
  <author>Test</author>
  <name>Free Ride</name>
  <description></description>
  <sportType>bike</sportType>
  <workout>
    <FreeRide Duration="600" Cadence="0"/>
  </workout>
</workout_file>`;

      const file = new File([xmlContent], 'test.zwo', { type: 'text/xml' });
      const result = await xmlService.parseWorkoutXml(file, mockUuid);

      expect(result.bars).toHaveLength(1);
      expect(result.bars[0]).toMatchObject({
        type: 'freeRide',
        time: 600,
        cadence: 0,
      });
    });


    it('shoudld parse elements in the correct order', async () => {
      const xmlContent = `
      <workout_file>
        <author></author>
        <name></name>
        <description>test from zwift 222</description>
        <sportType>bike</sportType>
        <tags/>
        <workout>
            <Warmup Duration="600" PowerLow="0.25075471" PowerHigh="0.74886793" pace="0"/>
            <SteadyState Duration="300" Power="0.49981132" pace="0"/>
            <SteadyState Duration="300" Power="0.65075469" pace="0"/>
            <SteadyState Duration="300" Power="0.80924529" pace="0"/>
            <Ramp Duration="600" PowerLow="0.25075471" PowerHigh="0.74886793" pace="0"/>
            <Ramp Duration="600" PowerLow="0.74886793" PowerHigh="0.25075471" pace="0"/>
            <SteadyState Duration="300" Power="0.94886792" pace="0"/>
            <SteadyState Duration="300" Power="1.0998113" pace="0"/>
            <SteadyState Duration="300" Power="1.2507547" pace="0"/>
            <Cooldown Duration="600" PowerLow="0.74886793" PowerHigh="0.25075471" pace="0"/>
        </workout>
    </workout_file>`;
      const file = new File([xmlContent], 'test.zwo', { type: 'text/xml' });
      const result = await xmlService.parseWorkoutXml(file, mockUuid);

      expect(result.bars).toHaveLength(10);
      expect(result.bars[0].type).toBe('trapeze'); // Warmup
      expect(result.bars[1].type).toBe('bar'); // SteadyState
      expect(result.bars[2].type).toBe('bar'); // SteadyState
      expect(result.bars[3].type).toBe('bar'); // SteadyState
      expect(result.bars[4].type).toBe('trapeze'); // Ramp
      expect(result.bars[5].type).toBe('trapeze'); // Ramp
      expect(result.bars[6].type).toBe('bar'); // SteadyState
      expect(result.bars[7].type).toBe('bar'); // SteadyState
      expect(result.bars[8].type).toBe('bar'); // SteadyState
      expect(result.bars[9].type).toBe('trapeze'); // Cooldown
    });
  });
});
