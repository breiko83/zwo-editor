import { Zones } from "../components/Constants";

/** Converts power fraction → pixel height (linear part of powerToHeight) */
export const multiplier = 250;

/** Converts seconds → pixel width */
export const timeMultiplier = 3;

/** Converts meters → pixel width */
export const lengthMultiplier = 10;

/** Minimum time step for rounding (seconds) */
export const minTime = 5;

/** Minimum distance step for rounding (meters) */
export const minDistance = 200;

/** Highest power (watts) a segment can be dragged to; it sits at the top of the canvas */
export const maxPowerWatts = 2000;

/** Power (fraction of FTP) up to which height is linear; above it the scale is compressed */
const kneePower = Zones.Z6.min;
const kneeHeight = kneePower * multiplier;

/** Pixel height of the top of the canvas */
export const maxHeight = Zones.Z6.max * multiplier;

/** Power (fraction of FTP) drawn at the top of the canvas — never below Z6.max so the scale only compresses */
export const maxPower = (ftp: number) =>
  ftp > 0 ? Math.max(maxPowerWatts / ftp, Zones.Z6.max) : Zones.Z6.max;

/** Converts power fraction → pixel height: linear through Z5, compressed in Z6 so maxPowerWatts reaches maxHeight */
export const powerToHeight = (power: number, ftp: number) => {
  if (power <= kneePower) return power * multiplier;
  const slope = (maxHeight - kneeHeight) / (maxPower(ftp) - kneePower);
  return kneeHeight + (power - kneePower) * slope;
};

/** Inverse of powerToHeight */
export const heightToPower = (height: number, ftp: number) => {
  if (height <= kneeHeight) return height / multiplier;
  // Drags snap to whole pixels from a fractional start, so treat the last pixel as the top
  if (height >= maxHeight - 1) return maxPower(ftp);
  const slope = (maxHeight - kneeHeight) / (maxPower(ftp) - kneePower);
  return kneePower + (height - kneeHeight) / slope;
};
