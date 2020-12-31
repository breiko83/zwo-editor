import React, { useEffect, useState } from 'react'
import Bar from '../Bar/Bar'
import './Repetition.css'
import { RepetitionInterval, SteadyInterval } from '../Interval'

interface RepetitionProps {
  interval: RepetitionInterval;
  repeat: number;
  ftp: number;
  weight: number;
  speed: number;
  sportType: string;
  durationType: string;
  onChange: (interval: RepetitionInterval) => void;
  onClick: (id: string) => void;
  selected: boolean;
}

const Repetition = ({interval, ...props}: RepetitionProps) => {
  const { v4: uuidv4 } = require('uuid');

  const [intervals, setIntervals] = useState<Array<SteadyInterval>>([])
  const [nIntervals, setNIntervals] = useState(props.repeat)

  const [onDuration, setOnDuration] = useState(interval.onDuration)
  const [offDuration, setOffDuration] = useState(interval.offDuration)

  const [onLength, setOnLength] = useState(interval.onLength)
  const [offLength, setOffLength] = useState(interval.offLength)

  useEffect(() => {
    const intervals: SteadyInterval[] = []

    for (var i = 0; i < nIntervals; i++) {
      intervals.push(
        {
          time: onDuration,
          length: onLength,
          power: interval.onPower,
          cadence: interval.cadence,
          type: 'steady',
          pace: interval.pace,
          id: uuidv4()
        })

      intervals.push(
        {
          time: offDuration,
          length: offLength,
          power: interval.offPower,
          cadence: interval.restingCadence,
          type: 'steady',
          pace: interval.pace,
          id: uuidv4()
        })
    }
    setIntervals(intervals)

    // eslint-disable-next-line
  }, [nIntervals])

  function handleOnChange(values: SteadyInterval) {
    const index = intervals.findIndex(interval => interval.id === values.id)
    
    if (index % 2 === 1) {
      setOffDuration(values.time)
      setOffLength(values.length)
    }else{
      setOnDuration(values.time)
      setOnLength(values.length)
    }

    for (var i = 0; i < intervals.length; i++) {
      if (index % 2 === i % 2) {       
        intervals[i].time = values.time
        intervals[i].power = values.power
        intervals[i].length = values.length
        intervals[i].cadence = values.cadence        
      }      
    }
    var time = 0
    intervals.map((interval) => time += interval.time)

    var length = 0
    intervals.map((interval) => length += (interval.length))

    props.onChange({
      time: time,
      length: length,
      id: interval.id,
      type: 'repetition',
      cadence: intervals[0].cadence,
      restingCadence: intervals[1].cadence,
      pace: interval.pace,
      repeat: nIntervals,
      onDuration: intervals[0].time,
      offDuration: intervals[1].time,
      onPower: intervals[0].power,
      offPower: intervals[1].power,
      onLength: intervals[0].length,
      offLength: intervals[1].length
    })

  }

  function handleAddInterval() {
    setNIntervals(nIntervals + 1)
    var time = 0
    intervals.map((interval) => time += interval.time)

    props.onChange({
      time: ((interval.onDuration) + (interval.offDuration)) * (nIntervals + 1),
      length: ((interval.onLength) + (interval.offLength)) * (nIntervals + 1),
      id: interval.id,
      type: 'repetition',
      cadence: interval.cadence,
      restingCadence: interval.restingCadence,
      pace: interval.pace,
      repeat: props.repeat + 1,
      onDuration: interval.onDuration,
      offDuration: interval.offDuration,
      onPower: interval.onPower,
      offPower: interval.offPower,
      onLength: interval.onLength,
      offLength: interval.offLength
    })
  }

  function handleRemoveInterval() {
    if (nIntervals > 1) {
      setNIntervals(nIntervals - 1)
      var time = 0
      intervals.map((interval) => time += interval.time)

      props.onChange({
        time: ((interval.onDuration) + (interval.offDuration)) * (nIntervals - 1),
        length: ((interval.onLength) + (interval.offLength)) * (nIntervals - 1),
        id: interval.id,
        type: 'repetition',
        cadence: interval.cadence,
        restingCadence: interval.restingCadence,
        pace: interval.pace,
        repeat: props.repeat - 1,
        onDuration: interval.onDuration,
        offDuration: interval.offDuration,
        onPower: interval.onPower,
        offPower: interval.offPower,
        onLength: interval.onLength,
        offLength: interval.offLength
      })
    }
  }

  const renderBar = (interval: SteadyInterval, withLabel: boolean) => (
    <Bar
      key={interval.id}
      interval={interval}
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
        {intervals.map((interval, index) => renderBar(interval, index === 0 || index === intervals.length - 1))}
      </div>      
    </div>
  )
}

export default Repetition