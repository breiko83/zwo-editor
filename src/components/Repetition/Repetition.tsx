import React, { useEffect, useState } from 'react'
import Bar from '../Bar/Bar'
import './Repetition.css'
import { PaceType } from '../Editor/PaceSelector'
import { Interval } from '../Interval'

const Repetition = (props: { id: string, repeat: number, onDuration?: number, offDuration?: number, onLength?: number, offLength?: number, onPower: number, offPower: number, cadence: number, restingCadence: number, ftp: number, weight: number, pace: PaceType, speed?: number, sportType: string, durationType: string, handleIntervalChange: Function, handleIntervalClick: Function, selected: boolean }) => {

  const { v4: uuidv4 } = require('uuid');

  const [intervals, setIntervals] = useState<Array<Interval>>([])
  const [nIntervals, setNIntervals] = useState(props.repeat)

  const [onDuration, setOnDuration] = useState(props.onDuration)
  const [offDuration, setOffDuration] = useState(props.offDuration)

  const [onLength, setOnLength] = useState(props.onLength)
  const [offLength, setOffLength] = useState(props.offLength)

  useEffect(() => {
    const intervals: Interval[] = []

    for (var i = 0; i < nIntervals; i++) {
      intervals.push(
        {
          time: onDuration || 0,
          length: onLength || 0,
          power: props.onPower,
          cadence: props.cadence,
          type: 'bar',
          pace: props.pace,
          id: uuidv4()
        })

      intervals.push(
        {
          time: offDuration || 0,
          length: offLength || 0,
          power: props.offPower,
          cadence: props.restingCadence,
          type: 'bar',
          pace: props.pace,
          id: uuidv4()
        })
    }
    setIntervals(intervals)

    // eslint-disable-next-line
  }, [nIntervals])

  function handleOnChange(id: string, values: Interval) {

    const index = intervals.findIndex(interval => interval.id === id)
    
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
    intervals.map((interval) => length += (interval.length || 0))

    props.handleIntervalChange(props.id, {
      time: time,
      length: length,
      id: props.id,
      type: 'interval',
      cadence: intervals[0].cadence,
      restingCadence: intervals[1].cadence,
      pace: props.pace,
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

    props.handleIntervalChange(props.id, {
      time: ((props.onDuration || 0) + (props.offDuration || 0)) * (nIntervals + 1),
      length: ((props.onLength || 0) + (props.offLength || 0)) * (nIntervals + 1),
      id: props.id,
      type: 'interval',
      cadence: props.cadence,
      restingCadence: props.restingCadence,
      pace: props.pace,
      repeat: props.repeat + 1,
      onDuration: props.onDuration,
      offDuration: props.offDuration,
      onPower: props.onPower,
      offPower: props.offPower,
      onLength: props.onLength,
      offLength: props.offLength
    })
  }

  function handleRemoveInterval() {
    if (nIntervals > 1) {
      setNIntervals(nIntervals - 1)
      var time = 0
      intervals.map((interval) => time += interval.time)

      props.handleIntervalChange(props.id, {
        time: ((props.onDuration || 0) + (props.offDuration || 0)) * (nIntervals - 1),
        length: ((props.onLength || 0) + (props.offLength || 0)) * (nIntervals - 1),
        id: props.id,
        type: 'interval',
        cadence: props.cadence,
        restingCadence: props.restingCadence,
        pace: props.pace,
        repeat: props.repeat - 1,
        onDuration: props.onDuration,
        offDuration: props.offDuration,
        onPower: props.onPower,
        offPower: props.offPower,
        onLength: props.onLength,
        offLength: props.offLength
      })
    }
  }

  const renderBar = (interval: Interval, withLabel: boolean) => (
    <Bar
      key={interval.id}
      id={interval.id}
      time={interval.time}
      length={interval.length}
      power={interval.power || 100}
      cadence={interval.cadence}
      ftp={props.ftp}
      weight={props.weight}
      sportType={props.sportType}
      durationType={props.durationType}
      pace={props.pace}
      speed={props.speed}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Interval?
      onClick={() => props.handleIntervalClick(props.id)}
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