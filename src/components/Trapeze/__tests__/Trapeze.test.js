import React from 'react';
import Trapeze from '../../Trapeze/Trapeze';
import { Zones } from '../../Constants'
import renderer from 'react-test-renderer';
import { uuidv4 } from '../../../utils/uuid'
import '@testing-library/jest-dom/extend-expect'


test('Trapeze renders correctly', () => {

  const bar = {
    time: 50,
    startPower: Zones.Z2.min,
    endPower: Zones.Z4.min,
    type: 'bar',
    id: uuidv4()
  }

  const ftp = 250

  const component = renderer.create(    
    <Trapeze
        key={bar.id}
        id={bar.id}
        time={bar.time}
        startPower={bar.startPower}
        endPower={bar.endPower}
        ftp={ftp}
        onChange={() => handleOnChange}
        onClick={() => handleOnClick}
      />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})