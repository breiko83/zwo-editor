import moment from 'moment';
import { calculateEstimatedTimes } from '../RunningTimesEditor';

const readTimes = (times: string[]) =>
  times.map(t => moment.duration(t).asSeconds());

const writeTimes = (times: number[]) =>
  times.map(t => moment.utc(t * 1000).format('HH:mm:ss'));

describe('calculateEstimatedTimes()', () => {
  test('changes nothing estimates, when all times present', () => {
    const times = readTimes(["00:05:00", "00:30:00", "01:10:00", "02:30:00", "05:20:00"]);
    expect(calculateEstimatedTimes(times)).toEqual(times);
  });

  test('estimates all times, when none provided', () => {
    const times = readTimes(["", "", "", "", ""]);
    expect(writeTimes(calculateEstimatedTimes(times))).toEqual([
      "00:12:00",
      "00:37:19",
      "01:14:38",
      "02:37:29",
      "05:14:58",
    ]);
  });

  test('estimates only missing times', () => {
    const times = readTimes(["", "00:20:00", "", "", "04:00:00"]);
    expect(writeTimes(calculateEstimatedTimes(times))).toEqual([
      "00:06:49",
      "00:20:00",
      "00:42:24",
      "01:29:27",
      "04:00:00",
    ]);
  });

  test('estimates only missing times vol2', () => {
    const times = readTimes(["00:05:00", "", "", "02:00:00", ""]);
    expect(writeTimes(calculateEstimatedTimes(times))).toEqual([
      "00:05:00",
      "00:16:27",
      "00:32:55",
      "02:00:00",
      "02:18:57",
    ]);
  });

  test('estimates all other times from one time', () => {
    const times = readTimes(["", "", "", "", "04:00:00"]);
    expect(writeTimes(calculateEstimatedTimes(times))).toEqual([
      "00:09:42",
      "00:30:08",
      "01:00:17",
      "02:07:12",
      "04:00:00",
    ]);
  });
});
