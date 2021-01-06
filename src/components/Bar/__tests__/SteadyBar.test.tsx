import React from 'react';
import SteadyBar from '../SteadyBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

test('SteadyBar renders correctly', () => {
  const interval = intervalFactory.steady({
    length: new Duration(50),
    intensity: Zones.Z3.min,
  });
  const mode = createMode("bike", 250, 75, [], "time");

  const component = renderer.create(
    <SteadyBar
      interval={interval}
      mode={mode}
      selected={false}
      showLabel={false}
      onChange={() => { }}
      onClick={() => { }}
    />
  );

  expect(component).toMatchSnapshot();
});
