import React from 'react';
import RampBar from '../RampBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'

test('RampBar renders correctly', () => {
  const interval = {
    duration: 50,
    startPower: Zones.Z2.min,
    endPower: Zones.Z4.min,
    type: 'steady',
    id: uuidv4()
  }

  const ftp = 250

  const component = renderer.create(
    <RampBar
      interval={interval}
      ftp={ftp}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  expect(component).toMatchSnapshot();
})