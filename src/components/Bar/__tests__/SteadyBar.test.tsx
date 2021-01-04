import React from 'react';
import SteadyBar from '../SteadyBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';

test('SteadyBar renders correctly', () => {
  const interval = intervalFactory.steady({
    duration: 50,
    intensity: Zones.Z3.min,
  });
  const mode = createMode("bike", 250, 75);

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
