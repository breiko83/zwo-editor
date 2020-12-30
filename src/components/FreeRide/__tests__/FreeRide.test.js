import React from 'react';
import FreeRide from '../../FreeRide/FreeRide';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { v4 as uuidv4 } from 'uuid'
import { Zones } from '../../Constants'

test('Freeride renders correctly', () => {

  const interval = {
    time: 50,
    power: Zones.Z3.min,
    type: 'bar',
    id: uuidv4()
  }

  const component = renderer.create(
    <FreeRide
      key={interval.id}
      id={interval.id}
      time={interval.time}
      onChange={() => handleOnChange}
      onClick={() => handleOnClick}
    />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})