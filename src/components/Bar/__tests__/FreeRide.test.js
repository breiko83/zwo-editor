import React from 'react';
import FreeRide from '../FreeRide';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { v4 as uuidv4 } from 'uuid'
import { Zones } from '../../Constants'

test('Freeride renders correctly', () => {
  const interval = {
    time: 50,
    power: Zones.Z3.min,
    type: 'steady',
    id: uuidv4()
  }

  const component = renderer.create(
    <FreeRide
      interval={interval}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})