import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import SteadyBar from './SteadyBar'
import './RepetitionBar.css'
import { RepetitionInterval, SteadyInterval } from '../Interval'

interface RepetitionBarProps {
  interval: RepetitionInterval;
  ftp: number;
  weight: number;
  speed: number;
  sportType: string;
  durationType: string;
  onChange: (interval: RepetitionInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const RepetitionBar = ({interval, ...props}: RepetitionBarProps) => {
  const [subIntervals, setSubIntervals] = useState<Array<SteadyInterval>>([])
  const [repeat, setRepeat] = useState(interval.repeat)

  const [onDuration, setOnDuration] = useState(interval.onDuration)
  const [offDuration, setOffDuration] = useState(interval.offDuration)

  const [onDistance, setOnDistance] = useState(interval.onDistance)
  const [offDistance, setOffDistance] = useState(interval.offDistance)

  useEffect(() => {
    const subIntervals: SteadyInterval[] = []

    for (var i = 0; i < repeat; i++) {
      subIntervals.push(
        {
          duration: onDuration,
          distance: onDistance,
          power: interval.onPower,
          cadence: interval.cadence,
          type: 'steady',
          pace: interval.pace,
          id: uuidv4()
        })

      subIntervals.push(
        {
          duration: offDuration,
          distance: offDistance,
          power: interval.offPower,
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
      setOffDistance(values.distance)
    }else{
      setOnDuration(values.duration)
      setOnDistance(values.distance)
    }

    for (var i = 0; i < subIntervals.length; i++) {
      if (index % 2 === i % 2) {       
        subIntervals[i].duration = values.duration
        subIntervals[i].power = values.power
        subIntervals[i].distance = values.distance
        subIntervals[i].cadence = values.cadence        
      }      
    }
    var time = 0
    subIntervals.map((sub) => time += sub.duration)

    var distance = 0
    subIntervals.map((sub) => distance += (sub.distance))

    props.onChange({
      ...interval,
      duration: time,
      distance: distance,
      cadence: subIntervals[0].cadence,
      restingCadence: subIntervals[1].cadence,
      repeat: repeat,
      onDuration: subIntervals[0].duration,
      offDuration: subIntervals[1].duration,
      onPower: subIntervals[0].power,
      offPower: subIntervals[1].power,
      onDistance: subIntervals[0].distance,
      offDistance: subIntervals[1].distance
    })

  }

  function handleAddInterval() {
    setRepeat(repeat + 1)
    var time = 0
    subIntervals.map((sub) => time += sub.duration)

    props.onChange({
      ...interval,
      duration: ((interval.onDuration) + (interval.offDuration)) * (repeat + 1),
      distance: ((interval.onDistance) + (interval.offDistance)) * (repeat + 1),
      repeat: interval.repeat + 1,
    })
  }

  function handleRemoveInterval() {
    if (repeat > 1) {
      setRepeat(repeat - 1)
      var time = 0
      subIntervals.map((sub) => time += sub.duration)

      props.onChange({
        ...interval,
        duration: ((interval.onDuration) + (interval.offDuration)) * (repeat - 1),
        distance: ((interval.onDistance) + (interval.offDistance)) * (repeat - 1),
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
      durationType={props.durationType}
      speed={props.speed}
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
