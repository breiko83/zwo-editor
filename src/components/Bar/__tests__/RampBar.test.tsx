import React from 'react';
import RampBar from '../RampBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';

test('RampBar renders correctly', () => {
  const interval = intervalFactory.ramp({
    duration: 50,
    startPower: Zones.Z2.min,
    endPower: Zones.Z4.min,
  });

  const component = renderer.create(
    <RampBar
      interval={interval}
      ftp={250}
      weight={75}
      sportType="bike"
      selected={false}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  expect(component).toMatchSnapshot();
})