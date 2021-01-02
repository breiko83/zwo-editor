import React from 'react';
import FreeBar from '../FreeBar';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { v4 as uuidv4 } from 'uuid'
import { Zones } from '../../../types/Zones'

test('FreeBar renders correctly', () => {
  const interval = {
    duration: 50,
    power: Zones.Z3.min,
    type: 'steady',
    id: uuidv4()
  }

  const component = renderer.create(
    <FreeBar
      interval={interval}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})