import React from 'react';
import Label from '../Label';
import renderer from 'react-test-renderer';
import '@testing-library/jest-dom/extend-expect'
import { PaceType } from '../../../types/PaceType';

describe('<Label>', () => {
  test('for cycling, renders: duration, power, w/kg, %FTP, cadence', () => {
    const component = renderer.create(
      <Label duration={100} power={250} weight={75} ftp={200} sportType="bike" cadence={0} onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for cycling ramp, renders: duration, power-range, %FTP-range, cadence', () => {
    const component = renderer.create(
      <Label duration={100} powerStart={100} powerEnd={200} weight={75} ftp={200} sportType="bike" cadence={0} onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for running, renders: duration, %FTP, pace type, cadence', () => {
    const component = renderer.create(
      <Label duration={100} power={250} ftp={200} weight={75} pace={PaceType.tenKm} sportType="run" cadence={0} onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });

  test('for running ramp, renders: duration, %FTP-range, pace type, cadence', () => {
    const component = renderer.create(
      <Label duration={100} powerStart={100} powerEnd={200} ftp={200} weight={75} pace={PaceType.tenKm} sportType="run" cadence={0} onCadenceChange={() => {}} />
    );
    expect(component).toMatchSnapshot();
  });
});
