import React from 'react';
import RampBar from '../RampBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

test('RampBar renders correctly', () => {
  const mode = createMode({sportType: "bike", ftp: 250, weight: 75, runningTimes: [], lengthType: "time"});
  const interval = intervalFactory.ramp({
    length: new Duration(50),
    startIntensity: Zones.Z2.min,
    endIntensity: Zones.Z4.min,
  }, mode);

  const component = renderer.create(
    <RampBar
      interval={interval}
      mode={mode}
      selected={false}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  expect(component).toMatchSnapshot();
})