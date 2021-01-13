import { Distance, Duration } from '../../types/Length';
import { PaceType } from '../../types/PaceType';
import * as format from '../format';

describe('format', () => {
  it('duration() formats seconds to mm:ss', () => {
    ([
      [0, "00:00"],
      [1, "00:01"],
      [15, "00:15"],
      [59, "00:59"],
      [60, "01:00"],
      [59 * 60 + 59, "59:59"],
      [60 * 60, "60:00"],
      [100 * 60, "100:00"],
    ] as [number, string][]).forEach(([seconds, expectedOutput]) => {
      expect(format.duration(new Duration(seconds))).toEqual(expectedOutput);
    }); 
  });

  it('distance() rounds and adds unit to meters', () => {
    ([
      [0, "0 m"],
      [200, "200 m"],
      [1378, "1378 m"],
      [1234.567, "1235 m"],
    ] as [number, string][]).forEach(([meters, expectedOutput]) => {
      expect(format.distance(new Distance(meters))).toEqual(expectedOutput);
    });
  });

  it('power() rounds and adds unit', () => {
    ([
      [0, "0W"],
      [280, "280W"],
      [199.73, "200W"],
    ] as [number, string][]).forEach(([power, expectedOutput]) => {
      expect(format.power(power)).toEqual(expectedOutput);
    }); 
  });

  it('wkg() rounds to 1 decimal and adds unit', () => {
    ([
      [0, "0W/Kg"],
      [3, "3W/Kg"],
      [2.5, "2.5W/Kg"],
      [4.271, "4.3W/Kg"],
    ] as [number, string][]).forEach(([wkg, expectedOutput]) => {
      expect(format.wkg(wkg)).toEqual(expectedOutput);
    }); 
  });

  it('percentage() converts intensity fraction to percentage and adds unit', () => {
    ([
      [0, "0%"],
      [0.5, "50%"],
      [0.996, "100%"],
    ] as [number, string][]).forEach(([intensity, expectedOutput]) => {
      expect(format.percentage(intensity)).toEqual(expectedOutput);
    }); 
  });

  it('shortPaceName() converts PaceType to short name', () => {
    ([
      [PaceType.oneMile, "1M pace"],
      [PaceType.fiveKm, "5K pace"],
      [PaceType.tenKm, "10K pace"],
      [PaceType.halfMarathon, "HM pace"],
      [PaceType.marathon, "M pace"],
    ] as [number, string][]).forEach(([pace, expectedOutput]) => {
      expect(format.shortPaceName(pace)).toEqual(expectedOutput);
    }); 
  });
});
