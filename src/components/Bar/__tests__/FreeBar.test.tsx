import React from 'react';
import FreeBar from '../FreeBar';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

test('FreeBar renders correctly', () => {
  const mode = createMode("bike", 200, 75, [], "time");
  const interval = intervalFactory.free({
    length: new Duration(50),
  }, mode);

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
