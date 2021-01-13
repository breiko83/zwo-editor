import { Duration } from '../../types/Length';
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
});
