import React from 'react';
import { SportType } from '../../types/SportType';
import { Interval } from '../../types/Interval';
import FreeBar from './FreeBar';
import SteadyBar from './SteadyBar';
import RampBar from './RampBar';
import RepetitionBar from './RepetitionBar';

interface GenericBarProps {
  interval: Interval;
  sportType: SportType;
  ftp: number;
  weight: number;
  selected: boolean;
  onChange: (interval: Interval) => void;
  onClick: (id: string) => void;
}

const GenericBar = ({ interval, sportType, ftp, weight, selected, onChange, onClick }: GenericBarProps) => {
  switch (interval.type) {
    case 'steady':
      return (
        <SteadyBar
          interval={interval}
          ftp={ftp}
          weight={weight}
          sportType={sportType}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
          showLabel={true}
        />
      );
    case 'ramp':
      return (
        <RampBar
          interval={interval}
          ftp={ftp}
          weight={weight}
          sportType={sportType}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
    case 'free':
      return (
        <FreeBar
          interval={interval}
          ftp={ftp}
          weight={weight}
          sportType={sportType}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
    case 'repetition':
      return (
        <RepetitionBar
          interval={interval}
          ftp={ftp}
          weight={weight}
          sportType={sportType}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
  }
};

export default GenericBar;
