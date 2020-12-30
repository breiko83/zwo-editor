import React from 'react';
import Label from '../../Label/Label';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'

test('Label renders correctly', () => {
  const label = {
    duration: 100,
    power: 250,
    weight: 75
  }

  const component = renderer.create(
    <Label duration={label.duration} power={label.power} weight={label.weight} />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})