import { Zones } from "../../components/Constants";
import {
  multiplier,
  maxHeight,
  maxPower,
  maxPowerWatts,
  powerToHeight,
  heightToPower,
} from "../segmentScaling";

describe("powerToHeight / heightToPower", () => {
  const ftp = 250;

  test("is linear up to Z6.min", () => {
    expect(powerToHeight(0.5, ftp)).toBe(0.5 * multiplier);
    expect(powerToHeight(Zones.Z6.min, ftp)).toBeCloseTo(Zones.Z6.min * multiplier);
  });

  test("maps maxPowerWatts to the top of the canvas", () => {
    expect(maxPower(ftp)).toBe(maxPowerWatts / ftp);
    expect(powerToHeight(maxPowerWatts / ftp, ftp)).toBeCloseTo(maxHeight);
  });

  test("compresses Z6 so 2x FTP sits below the top", () => {
    const h = powerToHeight(2, ftp);
    expect(h).toBeGreaterThan(Zones.Z6.min * multiplier);
    expect(h).toBeLessThan(maxHeight);
  });

  test("heightToPower inverts powerToHeight", () => {
    [0.3, 1, Zones.Z6.min, 1.5, 4, 8].forEach((power) => {
      expect(heightToPower(powerToHeight(power, ftp), ftp)).toBeCloseTo(power);
    });
  });

  test("never stretches the scale when maxPowerWatts is below 2x FTP", () => {
    expect(maxPower(1500)).toBe(Zones.Z6.max);
    expect(powerToHeight(Zones.Z6.max, 1500)).toBeCloseTo(maxHeight);
  });

  test("falls back to the old scale without an FTP", () => {
    expect(maxPower(0)).toBe(Zones.Z6.max);
    expect(powerToHeight(Zones.Z6.max, 0)).toBeCloseTo(maxHeight);
  });
});

test("a drag ending within a pixel of the top gives exactly maxPowerWatts", () => {
  const ftp = 200;
  expect(heightToPower(maxHeight - 0.5, ftp) * ftp).toBe(maxPowerWatts);
});
