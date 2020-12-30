import React from 'react';
import Bar from '../../Bar/Bar';
import { Zones } from '../../Constants'
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'

test('Bar renders correctly', () => {
  const interval = {
    time: 50,
    power: Zones.Z3.min,
    type: 'bar',
    id: uuidv4()
  }

  const ftp = 250

  const component = renderer.create(
    <Bar
      key={interval.id}
      id={interval.id}
      time={interval.time}
      power={interval.power}
      ftp={ftp}
      onChange={() => { }}
      onClick={() => { }}
    />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})