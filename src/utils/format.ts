import moment from 'moment';
import 'moment-duration-format';
import { Distance, Duration } from '../types/Length';
import { PaceType } from '../types/PaceType';

export const duration = (duration: Duration): string =>
  moment.duration(duration.seconds, "seconds").format("mm:ss", { trim: false });

export const distance = (distance: Distance): string =>
  Math.round(distance.meters) + " m";

export const power = (power: number): string => Math.round(power) + "W";

export const wkg = (wkg: number): string => Math.round(wkg * 10) / 10 + "W/kg";

export const percentage = (intensity: number): string => Math.round(intensity * 100) + "%";

export const shortPaceName = (pace: PaceType): string => {
  const paces = ["1M", "5K", "10K", "HM", "M"];
  return paces[pace] + " pace";
};
