import React from 'react';
import Bar from '../../Bar/Bar';
import { Zones } from '../../Constants'
import renderer from 'react-test-renderer';
import {cleanup, fireEvent, render} from '@testing-library/react';
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

  const component = renderer.create(    
      <Bar
        key={bar.id}
        id={bar.id}
        time={bar.time}
        power={bar.power}
        ftp={ftp}
        onChange={() => handleOnChange}
        onClick={() => handleOnClick}
      />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})