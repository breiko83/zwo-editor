import React, { useEffect, useState } from 'react'
import Bar from '../Bar/Bar'
import './Interval.css'

interface Bar {
  id: string,
  time: number,
  type: string,
  power?: number,
  startPower?: number,
  endPower?: number,
  cadence: number,
  onPower?: number,
  offPower?: number,
  onDuration?: number,
  offDuration?: number,
  repeat?: number
}

const Interval = (props: { id: string, repeat: number, onDuration: number, offDuration: number, onPower: number, offPower: number, ftp: number, weight: number, handleIntervalChange: Function, handleIntervalClick: Function, selected: boolean }) => {

  const { v4: uuidv4 } = require('uuid');

  const [bars, setBars] = useState<Array<Bar>>([])
  const [nIntervals, setNIntervals] = useState(props.repeat)

  const [onDuration, setOnDuration] = useState(props.onDuration)
  const [offDuration, setOffDuration] = useState(props.offDuration)

  useEffect(() => {

    console.log('render intervals inside');
    

    const bars = []

    for (var i = 0; i < nIntervals; i++) {
      bars.push(
        {
          time: onDuration,
          power: props.onPower,
          cadence: 0,
          type: 'bar',
          id: uuidv4()
        })

      bars.push(
        {
          time: offDuration,
          power: props.offPower,
          cadence: 0,
          type: 'bar',
          id: uuidv4()
        })
    }
    setBars(bars)
    // eslint-disable-next-line
  }, [nIntervals])

  function handleOnChange(id: string, values: Bar) {
    const index = bars.findIndex(bar => bar.id === id)
    

    if (index % 2 === 1) {
      setOffDuration(values.time)
    }else{
      setOnDuration(values.time)
    }

    for (var i = 0; i < bars.length; i++) {
      if (index % 2 === i % 2) {       
        bars[i].time = values.time
        bars[i].power = values.power
      }      
    }
    
    var length = 0
    bars.map((bar) => length += bar.time)

    props.handleIntervalChange(props.id, {
      time: length,
      id: props.id,
      type: 'interval',
      cadence: 0,
      repeat: nIntervals,
      onDuration: bars[0].time,
      offDuration: bars[1].time,
      onPower: bars[0].power,
      offPower: bars[1].power
    })

  }

  function handleAddInterval() {
    setNIntervals(nIntervals + 1)
    var length = 0
    bars.map((bar) => length += bar.time)
    props.handleIntervalChange(props.id, {
      time: length,
      id: props.id,
      type: 'interval',
      cadence: 0,
      repeat: props.repeat + 1,
      onDuration: props.onDuration,
      offDuration: props.offDuration,
      onPower: props.onPower,
      offPower: props.offPower
    })
  }

  function handleRemoveInterval() {
    if (nIntervals > 1) {
      setNIntervals(nIntervals - 1)
      var length = 0
      bars.map((bar) => length += bar.time)
      props.handleIntervalChange(props.id, {
        time: length,
        id: props.id,
        type: 'interval',
        cadence: 0,
        repeat: props.repeat - 1,
        onDuration: props.onDuration,
        offDuration: props.offDuration,
        onPower: props.onPower,
        offPower: props.offPower
      })
    }
  }

  const renderBar = (bar: Bar, withLabel: boolean) => (
    <Bar
      key={bar.id}
      id={bar.id}
      time={bar.time}
      power={bar.power || 100}
      cadence={bar.cadence}
      ftp={props.ftp}
      weight={props.weight}
      onChange={(id: string, value: any) => handleOnChange(id, value)} // Change any to Interface Bar?
      onClick={() => props.handleIntervalClick(props.id)}
      selected={props.selected}
      showLabel={withLabel}
    />
  )


  return (
    <div>
      <div className='buttons'><button onClick={handleAddInterval}>+</button><button onClick={handleRemoveInterval}>-</button></div>
      <div className='intervals'>
        {bars.map((bar, index) => renderBar(bar, index === 0 || index === bars.length - 1))}
      </div>      
    </div>
  )
}

export default Interval