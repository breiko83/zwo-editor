import React, { useMemo, useState } from 'react'
import SteadyBar from './SteadyBar'
import './RepetitionBar.css'
import { RepetitionInterval, SteadyInterval } from '../../types/Interval'
import { WorkoutMode } from '../../modes/WorkoutMode'
import intervalFactory from '../../interval/intervalFactory'
import { range } from 'ramda'

interface RepetitionBarProps {
  interval: RepetitionInterval;
  mode: WorkoutMode;
  onChange: (interval: RepetitionInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const RepetitionBar = ({interval, ...props}: RepetitionBarProps) => {
  const [repeat, setRepeat] = useState(interval.repeat)

  const [onLength, setOnLength] = useState(interval.onLength)
  const [offLength, setOffLength] = useState(interval.offLength)

  const subIntervals = useMemo(() => {
    return range(0, repeat).flatMap(() => [
      intervalFactory.steady({
        length: onLength,
        intensity: interval.onIntensity,
        cadence: interval.onCadence,
        pace: interval.pace,
      }, props.mode),
      intervalFactory.steady({
        length: offLength,
        intensity: interval.offIntensity,
        cadence: interval.offCadence,
        pace: interval.pace,
      }, props.mode),
    ]);
    // eslint-disable-next-line
  }, [repeat]);

  function handleOnChange(values: SteadyInterval) {
    const index = subIntervals.findIndex(sub => sub.id === values.id)

    if (index % 2 === 1) {
      setOffLength(values.length)
    }else{
      setOnLength(values.length)
    }

    for (var i = 0; i < subIntervals.length; i++) {
      if (index % 2 === i % 2) {
        subIntervals[i].length = values.length
        subIntervals[i].intensity = values.intensity
        subIntervals[i].cadence = values.cadence
      }
    }

    props.onChange({
      ...interval,
      onCadence: subIntervals[0].cadence,
      offCadence: subIntervals[1].cadence,
      repeat: repeat,
      onLength: subIntervals[0].length,
      offLength: subIntervals[1].length,
      onIntensity: subIntervals[0].intensity,
      offIntensity: subIntervals[1].intensity,
    })
  }

  function handleAddInterval() {
    setRepeat(repeat + 1)
    props.onChange({
      ...interval,
      repeat: interval.repeat + 1,
    })
  }

  function handleRemoveInterval() {
    if (repeat > 1) {
      setRepeat(repeat - 1)
      props.onChange({
        ...interval,
        repeat: interval.repeat - 1,
      })
    }
  }

  const renderBar = (subInterval: SteadyInterval, withLabel: boolean) => (
    <SteadyBar
      key={subInterval.id}
      interval={subInterval}
      mode={props.mode}
      onChange={handleOnChange}
      onClick={() => props.onClick(interval.id)}
      selected={props.selected}
      showLabel={withLabel}
    />
  )

  return (
    <div>
      <div className='buttons'><button onClick={handleAddInterval}>+</button><button onClick={handleRemoveInterval}>-</button></div>
      <div className='intervals'>
        {subIntervals.map((sub, index) => renderBar(sub, index === 0 || index === subIntervals.length - 1))}
      </div>
    </div>
  )
}

export default RepetitionBar
