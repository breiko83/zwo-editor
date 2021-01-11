import React from 'react';
import SteadyBar from '../SteadyBar';
import { Zones } from '../../../types/Zones'
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

const MockReact = React;

jest.mock('../../Label/Label', () => (props: any) =>
  MockReact.createElement("Label", props));

jest.mock('re-resizable', () => ({
  Resizable: (props: any) => MockReact.createElement("Resizable", props),
}));

describe('<SteadyBar>', () => {
  it('renders', () => {
    const mode = createMode({sportType: "bike", ftp: 250, weight: 75, runningTimes: [], lengthType: "time"});
    const interval = intervalFactory.steady({
      length: new Duration(50),
      intensity: Zones.Z3.min,
    }, mode);
  
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

  it('renders without Label when selected, but showLabel=false', () => {
    const mode = createMode({sportType: "bike", ftp: 250, weight: 75, runningTimes: [], lengthType: "time"});
    const interval = intervalFactory.steady({
      length: new Duration(50),
      intensity: Zones.Z3.min,
    }, mode);
  
    const component = renderer.create(
      <SteadyBar
        interval={interval}
        mode={mode}
        selected={true}
        showLabel={false}
        onChange={() => { }}
        onClick={() => { }}
      />
    );
  
    expect(component).toMatchSnapshot();
  });

  it('renders with Label when selected and showLabel=true', () => {
    const mode = createMode({sportType: "bike", ftp: 250, weight: 75, runningTimes: [], lengthType: "time"});
    const interval = intervalFactory.steady({
      length: new Duration(50),
      intensity: Zones.Z3.min,
    }, mode);
  
    const component = renderer.create(
      <SteadyBar
        interval={interval}
        mode={mode}
        selected={true}
        showLabel={true}
        onChange={() => { }}
        onClick={() => { }}
      />
    );
  
    expect(component).toMatchSnapshot();
  });
});
