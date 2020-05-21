import React, {useState} from 'react'
import './Bar.css'
import { Resizable } from 're-resizable'

const Bar = ({ text, time, power }) => {

  const [width, setWidth] = useState(time)
  const [height, setHeight] = useState(power)
  const [label, setLabel] = useState(`${width} ${height}`)
  const [style, setStyle] = useState(zwiftStyle(power))

  const handleResizeStop = ({e, direction, ref, d}) => {    
    setWidth(width+d.width)
    setHeight(height+d.height)   
  }

  const handleResize = ({e, direction, ref, d}) => {    
    setLabel((`${width+d.width} ${height+d.height}`)) 
    setStyle(zwiftStyle(height+d.height)) 
  }

  function zwiftStyle(zone) {    
    
    if (zone >= 0 && zone < 100) {
      // Z1 gray
      return {backgroundColor: '#807F80'}
    } else if (zone >= 100 && zone < 200) {
      // Z2 blue
      return {backgroundColor: '#0E90D4'}
    } else if (zone >= 200 && zone < 300) {
      // Z3 green
      return {backgroundColor: '#00C46A'}
    } else if (zone >= 300 && zone < 400) {
      // Z4 yellow
      return {backgroundColor: '#FFCB00'}
    } else if (zone >= 400 && zone < 500) {
      // Z5 orange
      return {backgroundColor: '#FF6430'}
    } else {
      // Z6 red
      return {backgroundColor: '#E90000'}
    }
  }

  return (
      <Resizable 
        className='bar'
        size={{
          width: width,
          height: height,
        }}
        minWidth={10}
        minHeight={50}
        maxHeight={600} 
        onResizeStop={(e, direction, ref, d) => handleResizeStop({e, direction, ref, d})}   
        onResize={(e, direction, ref, d) => handleResize({e, direction, ref, d})}    
        style={style}       
      >
        <div>
          {label}
        </div>
        
    </Resizable>
  );
}

export default Bar