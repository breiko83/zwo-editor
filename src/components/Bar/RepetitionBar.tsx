import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import SteadyBar from './SteadyBar'
import './RepetitionBar.css'
import { RepetitionInterval, SteadyInterval } from '../../types/Interval'

interface RepetitionBarProps {
  interval: RepetitionInterval;
  ftp: number;
  weight: number;
  sportType: string;
  onChange: (interval: RepetitionInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const RepetitionBar = ({interval, ...props}: RepetitionBarProps) => {
  const [subIntervals, setSubIntervals] = useState<Array<SteadyInterval>>([])
  const [repeat, setRepeat] = useState(interval.repeat)

  const [onDuration, setOnDuration] = useState(interval.onDuration)
  const [offDuration, setOffDuration] = useState(interval.offDuration)

  useEffect(() => {
    const subIntervals: SteadyInterval[] = []

    for (var i = 0; i < repeat; i++) {
      subIntervals.push(
        {
          duration: onDuration,
          intensity: interval.onIntensity,
          cadence: interval.cadence,
          type: 'steady',
          pace: interval.pace,
          id: uuidv4()
        })

      subIntervals.push(
        {
          duration: offDuration,
          intensity: interval.offIntensity,
          cadence: interval.restingCadence,
          type: 'steady',
          pace: interval.pace,
          id: uuidv4()
        })
    }
    setSubIntervals(subIntervals)

    // eslint-disable-next-line
  }, [repeat])

  function handleOnChange(values: SteadyInterval) {
    const index = subIntervals.findIndex(sub => sub.id === values.id)
    
    if (index % 2 === 1) {
      setOffDuration(values.duration)
    }else{
      setOnDuration(values.duration)
    }

    for (var i = 0; i < subIntervals.length; i++) {
      if (index % 2 === i % 2) {       
        subIntervals[i].duration = values.duration
        subIntervals[i].intensity = values.intensity
        subIntervals[i].cadence = values.cadence        
      }      
    }

    props.onChange({
      ...interval,
      cadence: subIntervals[0].cadence,
      restingCadence: subIntervals[1].cadence,
      repeat: repeat,
      onDuration: subIntervals[0].duration,
      offDuration: subIntervals[1].duration,
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
      ftp={props.ftp}
      weight={props.weight}
      sportType={props.sportType}
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
