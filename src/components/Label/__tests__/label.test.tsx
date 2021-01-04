import React from 'react';
import Label from '../Label';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { PaceType } from '../../../types/PaceType';
import intervalFactory from '../../../interval/intervalFactory';

const MockReact = React;

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon(props: any) {
    return MockReact.createElement("FontAwesomeIcon", props);
  },
}));

jest.mock('@fortawesome/free-solid-svg-icons', () => ({
  faBolt: "faBolt",
  faClock: "faClock",
}));

describe('<Label>', () => {
  test('for cycling, renders: duration, power, w/kg, %FTP, cadence', () => {
    const interval = intervalFactory.steady({ duration: 100, intensity: 1.25, cadence: 0 });
    const component = renderer.create(
      <Label interval={interval} weight={75} ftp={200} sportType="bike" onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for cycling ramp, renders: duration, power-range, %FTP-range, cadence', () => {
    const interval = intervalFactory.ramp({ duration: 100, startIntensity: 0.5, endIntensity: 1.0, cadence: 0 });
    const component = renderer.create(
      <Label interval={interval} weight={75} ftp={200} sportType="bike" onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for running, renders: duration, %pace, pace type', () => {
    const interval = intervalFactory.steady({ duration: 100, intensity: 1.25, cadence: 0, pace: PaceType.tenKm });
    const component = renderer.create(
      <Label interval={interval} weight={75} ftp={1234} sportType="run" onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for running ramp, renders: duration, %pace-range, pace type', () => {
    const interval = intervalFactory.ramp({ duration: 100, startIntensity: 0.5, endIntensity: 1.0, cadence: 0, pace: PaceType.tenKm });
    const component = renderer.create(
      <Label interval={interval} weight={75} ftp={1234} sportType="run" onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });
});
