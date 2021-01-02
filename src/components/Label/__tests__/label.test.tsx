import React from 'react';
import Label from '../Label';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'

test('Label renders correctly', () => {
  const component = renderer.create(
    <Label duration={100} power={250} weight={75} sportType="bike" cadence={0} onCadenceChange={() => {}} />
  )

  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
})