import moment from "moment";
import "moment-duration-format";

import { BarType, PaceUnitType } from '../types/workout';

const helpers = {
  // calculate total time
  getWorkoutLength: function (bars: BarType[]): number {
    let length = 0;

    bars.forEach((bar) => {
      if (bar.type === "interval") {
        length += (bar.repeat || 0) * (bar.onDuration || 0);
        length += (bar.repeat || 0) * (bar.offDuration || 0);
      }else{
        length += bar.time;
      }
    });

    return length;
  },

  getStressScore: function (bars: BarType[], ftp: number): string {
    // TSS = [(sec x NP x IF)/(FTP x 3600)] x 100
    let tss = 0;

    bars.forEach((bar) => {
      if (bar.type === "bar" && bar.power !== undefined) {
        const np = bar.power * ftp;
        const iff = bar.power;

        tss += bar.time * np * iff;
      }
      if (bar.type === "trapeze" && bar.startPower !== undefined && bar.endPower !== undefined) {
        const np = ((bar.startPower + bar.endPower) / 2) * ftp;
        const iff = (bar.startPower + bar.endPower) / 2;

        tss += bar.time * np * iff;
      }
      if (bar.type === "interval" && bar.onPower !== undefined && bar.offPower !== undefined) {
        const npOn = bar.onPower * ftp;
        const iffOn = bar.onPower;

        tss += (bar.onDuration || 0) * (bar.repeat || 0) * npOn * iffOn;

        const npOff = bar.offPower * ftp;
        const iffOff = bar.offPower;

        tss += (bar.offDuration || 0) * (bar.repeat || 0) * npOff * iffOff;
      }
    });
    return ((tss / (ftp * 3600)) * 100).toFixed(0);
  },

  getWorkoutPace: function (bars: BarType[], paceUnitType: PaceUnitType): string {
    const pacedBars = bars.filter(b => b.type !== "freeRide");
    const length = this.getWorkoutLength(pacedBars);
    const distance = this.getWorkoutDistance(pacedBars);
    if (distance > 0) {
      const kph = +distance / (length / 3600);
      return this.speedToPace(kph, paceUnitType);
    } else {
      return "";
    }
  },

  calculateEstimatedTimes: function (distances: number[], times: string[]): string[] {
    const estimatedTimes: string[] = [];

    times.forEach((value, i) => {
      if (!value) {
        for (let index = 0; index < times.length; index++) {
          // found a time
          if (times[index]) {
            // Predictions calculated using Riegel's formula: T2 = T1 x (D2/D1) x 1.06
            // T1 = T2 / (1.06 * (D2/D1))
            const t = moment.duration(times[index]).asSeconds();

            let et = t * (distances[i] / distances[index]) * 1.06;

            estimatedTimes[i] = moment.utc(et * 1000).format("HH:mm:ss");

            break;
          }
        }
      }
    });
    return estimatedTimes;
  },

  getWorkoutDistance: function (bars: BarType[]): number {
    let distance = 0;
    bars.forEach((bar) => (distance += bar.length || 0));

    return parseFloat((distance / 1000).toFixed(1));
  },

  getTimeinSeconds: function (time: string): number {
    //convert time 01:00:00 to seconds 3600
    return moment.duration(time).asSeconds();
  },

  formatDuration: function (seconds: number): string {
    // 1 pixel equals 5 seconds
    return moment.duration(seconds, "seconds").format("mm:ss", { trim: false });
  },

  calculateTime: function (distance: number, speed: number): number {
    if (speed === 0) return 0;

    return distance / speed;
  },

  calculateDistance: function (time: number, speed: number): number {
    if (speed === 0) return 0;

    return time * speed;
  },

  round: function (x: number, roundTo: number): number {
    return Math.floor(x / roundTo) * roundTo;
  },

  calculateSpeed: function (time: number, distance: number): number {
    if (distance === 0) return 0;
    // in km/h
    return ((time / distance) * 18) / 5;
  },

  speedToPace: function (speedkph: number, paceUnitType: PaceUnitType): string {
    let pace = 0;
    if (paceUnitType === "metric") {
      pace = 3600 / speedkph;
    } else {
      pace = 1.60934 * 3600 / speedkph;
    }
    return moment.duration(pace, "seconds").format("mm:ss", { trim: false });
  }
};

export default helpers;
