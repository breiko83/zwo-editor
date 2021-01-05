const helpers = {
  floor: function (x: number, roundTo: number): number {
    return Math.floor(x / roundTo) * roundTo
  },
}

export default helpers;
