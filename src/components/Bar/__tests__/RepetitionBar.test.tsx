import React from 'react';
import RepetitionBar from '../RepetitionBar';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import intervalFactory from '../../../interval/intervalFactory';
import createMode from '../../../modes/createMode';
import { Duration } from '../../../types/Length';

const MockReact = React;
let mockId = 0;

jest.mock('../SteadyBar', () => (props: any) =>
  MockReact.createElement("SteadyBar", props));

jest.mock('uuid', () => ({
  v4: () => `mock-id-${++mockId}`,
}));

describe('<RepetitionBar>', () => {
  it('renders using SteadyBar components', () => {
    const mode = createMode({sportType: "bike", ftp: 200, weight: 75, runningTimes: [], lengthType: "time"});
    const interval = intervalFactory.repetition({
      repeat: 3,
      onLength: new Duration(50),
      offLength: new Duration(100),
      onIntensity: 1.0,
      offIntensity: 0.5,
    }, mode);
  
    const component = renderer.create(
      <RepetitionBar
        interval={interval}
        mode={mode}
        selected={false}
        onChange={() => { }}
        onClick={() => { }}
      />
    );

    // Perform dummy update to trigger useEffect hook which generates the SteadyBar children
    component.update(<RepetitionBar
      interval={interval}
      mode={mode}
      selected={false}
      onChange={() => { }}
      onClick={() => { }}
    />)
  
    expect(component).toMatchSnapshot();
  });
});
