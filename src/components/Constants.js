export const Colors = {
  GRAY: '#807F80',
  BLUE: '#0E90D4',
  GREEN: '#00C46A',
  YELLOW: '#FFCB00',
  ORANGE: '#FF6430',
  RED: '#E90000',
  WHITE: '#FFFFFF'
}

export const Zones = {
  Z1: {
    min: 0.1,
    max: 0.605
  },
  Z2: {
    min: 0.605,
    max: 0.763
  },
  Z3: {
    min: 0.763,
    max: 0.901
  },
  Z4: {
    min: 0.901,
    max: 1.053
  },
  Z5: {
    min: 1.053,
    max: 1.194
  },
  Z6: {
    min: 1.194,
    max: 2.0
  }
}

export const ZonesArray = [
  [Zones.Z1.min,Zones.Z1.max],
  [Zones.Z2.min,Zones.Z2.max],
  [Zones.Z3.min,Zones.Z3.max],
  [Zones.Z4.min,Zones.Z4.max],
  [Zones.Z5.min,Zones.Z5.max],
  [Zones.Z6.min,Zones.Z6.max],
]

export const RUNNING_PACES = ['1M','5K','10K','HM','M']