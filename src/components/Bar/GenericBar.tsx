import React from 'react';
import { Interval } from '../../types/Interval';
import FreeBar from './FreeBar';
import SteadyBar from './SteadyBar';
import RampBar from './RampBar';
import RepetitionBar from './RepetitionBar';
import { WorkoutMode } from '../../modes/WorkoutMode';

interface GenericBarProps {
  interval: Interval;
  mode: WorkoutMode;
  selected: boolean;
  onChange: (interval: Interval) => void;
  onClick: (id: string) => void;
}

const GenericBar = ({ interval, mode, selected, onChange, onClick }: GenericBarProps) => {
  switch (interval.type) {
    case 'steady':
      return (
        <SteadyBar
          interval={interval}
          mode={mode}
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
          mode={mode}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
    case 'free':
      return (
        <FreeBar
          interval={interval}
          mode={mode}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
    case 'repetition':
      return (
        <RepetitionBar
          interval={interval}
          mode={mode}
          onChange={onChange}
          onClick={onClick}
          selected={selected}
        />
      );
  }
};

export default GenericBar;
