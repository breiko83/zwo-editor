export class Duration {
  constructor(public readonly seconds: number) {}
}

export class Distance {
  constructor(public readonly meters: number) {}
}

export type Length = Distance | Duration;
