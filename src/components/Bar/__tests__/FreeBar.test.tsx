import React from 'react';
import FreeBar from '../FreeBar';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';

test('FreeBar renders correctly', () => {
  const interval = intervalFactory.free({
    length: 50,
  });
  const mode = createMode("bike", 200, 75, [], "time");

  const component = renderer.create(
    <FreeBar
      interval={interval}
      mode={mode}
      selected={false}
      onChange={() => { }}
      onClick={() => { }}
    />
  );

  expect(component).toMatchSnapshot();
});
