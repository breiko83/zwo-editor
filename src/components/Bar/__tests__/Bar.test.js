import React from 'react';
import Bar from '../../Bar/Bar';
import { Zones } from '../../Constants'
import renderer from 'react-test-renderer';
import { v4 as uuidv4 } from 'uuid'
import '@testing-library/jest-dom/extend-expect'


test('Bar renders correctly', () => {

  const bar = {
    time: 50,
    power: Zones.Z3.min,
    type: 'bar',
    id: uuidv4()
  }

  const ftp = 250
  const handleOnChange = jest.fn()
  const handleOnClick = jest.fn()

  const component = renderer.create(    
      <Bar
        key={bar.id}
        id={bar.id}
        time={bar.time}
        length={200}
        power={bar.power}
        cadence={0}
        ftp={ftp}
        weight={75}
        pace={0}
        sportType="bike"
        durationType="time"
        speed={0}
        onChange={handleOnChange}
        onClick={handleOnClick}
        selected={false}
        showLabel={true}
        paceUnitType="metric"
        incline={0}
      />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})