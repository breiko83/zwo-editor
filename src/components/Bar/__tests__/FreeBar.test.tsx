import React from 'react';
import FreeBar from '../FreeBar';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';

test('FreeBar renders correctly', () => {
  const interval = intervalFactory.free({
    duration: 50,
  });

  const component = renderer.create(
    <FreeBar
      interval={interval}
      ftp={200}
      weight={75}
      sportType="bike"
      selected={false}
      onChange={() => { }}
      onClick={() => { }}
    />
  );

  expect(component).toMatchSnapshot();
});
