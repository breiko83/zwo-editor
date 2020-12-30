import React from 'react';
import Trapeze from '../../Trapeze/Trapeze';
import { Zones } from '../../Constants'
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'

test('Trapeze renders correctly', () => {
  const interval = {
    time: 50,
    startPower: Zones.Z2.min,
    endPower: Zones.Z4.min,
    type: 'steady',
    id: uuidv4()
  }

  const ftp = 250

  const component = renderer.create(
    <Trapeze
      key={interval.id}
      id={interval.id}
      time={interval.time}
      startPower={interval.startPower}
      endPower={interval.endPower}
      ftp={ftp}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})