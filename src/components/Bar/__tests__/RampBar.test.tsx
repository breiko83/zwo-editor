import React from 'react';
import RampBar from '../RampBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';

test('RampBar renders correctly', () => {
  const interval = intervalFactory.ramp({
    length: 50,
    startIntensity: Zones.Z2.min,
    endIntensity: Zones.Z4.min,
  });
  const mode = createMode("bike", 250, 75, [], "time");

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