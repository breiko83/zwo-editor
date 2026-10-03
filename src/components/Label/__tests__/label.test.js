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


describe('Label power input', () => {
  const { render, fireEvent } = require('@testing-library/react');

  const setup = () => {
    const setPower = jest.fn();
    const { container } = render(
      <Label sportType="bike" duration="05:00" power={200} setPower={setPower} />
    );
    return { setPower, input: container.querySelector('input[name="power"]') };
  };

  test('does not apply the power while typing', () => {
    const { setPower, input } = setup();
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.change(input, { target: { value: '30' } });
    expect(setPower).not.toHaveBeenCalled();
    expect(input.value).toBe('30');
  })

  test('applies the power on Enter and on blur', () => {
    const { setPower, input } = setup();
    fireEvent.change(input, { target: { value: '300' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(setPower).toHaveBeenLastCalledWith(300);
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.blur(input);
    expect(setPower).toHaveBeenLastCalledWith(250);
  })

  test('Escape and invalid values keep the current power', () => {
    const { setPower, input } = setup();
    fireEvent.change(input, { target: { value: '150' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input.value).toBe('200');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(setPower).not.toHaveBeenCalled();
    expect(input.value).toBe('200');
  })
})
