import React from 'react';
import RampBar from '../RampBar';
import { Zones } from '../../Zones'
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'

test('RampBar renders correctly', () => {
  const interval = {
    time: 50,
    length: 0,
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

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})