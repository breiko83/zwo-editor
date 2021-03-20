import { RUNNING_PACES } from "../Constants";

const regex = {
  extractPower: function (workoutBlock, weight, ftp) {
    // extract watts
    const powerInWatts = workoutBlock.match(/([0-9]\d*w)/);
    const powerInWattsPerKg = workoutBlock.match(/([0-9]*.?[0-9]wkg)/);
    const powerInPercentageFtp = workoutBlock.match(/([0-9]\d*%)/);

    let power = powerInWatts ? parseInt(powerInWatts[0]) / ftp : 1;
    power = powerInWattsPerKg
      ? (parseFloat(powerInWattsPerKg[0]) * weight) / ftp
      : power;
    power = powerInPercentageFtp
      ? parseInt(powerInPercentageFtp[0]) / 100
      : power;
    return power;
  },
  extractDuration: function (workoutBlock) {
    const durationInSeconds = workoutBlock.match(/([0-9]\d*s)/);
    const durationInMinutes = workoutBlock.match(/([0-9]*:?[0-9][0-9]*m)/);

    let duration = durationInSeconds && parseInt(durationInSeconds[0]);
    duration = durationInMinutes
      ? parseInt(durationInMinutes[0].split(":")[0]) * 60 +
        (parseInt(durationInMinutes[0].split(":")[1]) || 0)
      : duration;
    return duration;
  },
  extractCadence: function (workoutBlock) {
    const cadence = workoutBlock.match(/([0-9]\d*rpm)/);
    const rpm = cadence ? parseInt(cadence[0]) : undefined;
    return rpm;
  },
  extractPace: function (workoutBlock) {
    const runningPace = workoutBlock.match(/(\w+) pace/);
    console.log(runningPace);
    const pace = runningPace ? runningPace[0].split(" ")[0] : "";
    const paceValue = RUNNING_PACES.findIndex((i) => i === pace);
    return paceValue;
  },
  extractDistance: function (workoutBlock) {
    const distanceInMeters = workoutBlock.match(/([0-9]\d*m)/);
    const distanceInKms = workoutBlock.match(/([0-9]*.?[02468]km)/);

    let distance = distanceInMeters && parseInt(distanceInMeters[0]);
    distance = distanceInKms
      ? parseInt(distanceInKms[0].split(".")[0]) * 1000 +
        (parseInt(distanceInKms[0].split(".")[1]) * 100 || 0)
      : distance;

    return distance;
  }
};

export default regex;
