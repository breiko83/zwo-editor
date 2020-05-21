import React, {useState} from 'react'
import './Bar.css'
import { Colors } from './Constants'
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
      return {backgroundColor: Colors.GRAY}
    } else if (zone >= 100 && zone < 200) {
      // Z2 blue
      return {backgroundColor: Colors.BLUE}
    } else if (zone >= 200 && zone < 300) {
      // Z3 green
      return {backgroundColor: Colors.GREEN}
    } else if (zone >= 300 && zone < 400) {
      // Z4 yellow
      return {backgroundColor: Colors.YELLOW}
    } else if (zone >= 400 && zone < 500) {
      // Z5 orange
      return {backgroundColor: Colors.ORANGE}
    } else {
      // Z6 red
      return {backgroundColor: Colors.RED}
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
        enable={{top: true, right: true}}
        onResizeStop={(e, direction, ref, d) => handleResizeStop({e, direction, ref, d})}   
        onResize={(e, direction, ref, d) => handleResize({e, direction, ref, d})}    
        onClick={()=>{alert('click')}}
        style={style}       
      >
        <div>
          {label}
        </div>
        
    </Resizable>
  );
}

export default Bar