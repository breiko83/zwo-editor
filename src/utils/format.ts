import moment from 'moment';
import 'moment-duration-format';
import { Duration } from '../types/Length';

export function duration(duration: Duration): string {
  return moment.duration(duration.seconds, "seconds").format("mm:ss", { trim: false });
}
