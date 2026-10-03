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

describe('Label placement', () => {
  const { render } = require('@testing-library/react');

  const renderInCanvas = (labelTop, canvasTop) => {
    const spy = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
      return { top: this.classList.contains('canvas') ? canvasTop : labelTop };
    });
    const { container } = render(
      <div className="canvas">
        <div className="segment">
          <Label sportType="bike" duration="05:00" power={250} />
        </div>
      </div>
    );
    spy.mockRestore();
    return container.querySelector('.label');
  };

  test('stays above the segment when it fits in the canvas', () => {
    expect(renderInCanvas(200, 100)).not.toHaveClass('label-inside');
  })

  test('moves inside the segment when it would be clipped by the canvas', () => {
    expect(renderInCanvas(50, 100)).toHaveClass('label-inside');
  })
})
