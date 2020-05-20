import React, {useState} from 'react'
import './bar.css'
import { Resizable } from 're-resizable'

const Bar = ({ text, time, power }) => {

  const [width, setWidth] = useState(time)
  const [height, setHeight] = useState(power)
  const [label, setLabel] = useState(`${width} ${height}`)

  const handleResizeStop = ({e, direction, ref, d}) => {    
    setWidth(width+d.width)
    setHeight(height+d.height)       
     
  }

  const handleResize = ({e, direction, ref, d}) => {    
    setLabel((`${width+d.width} ${height+d.height}`)) 
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
        maxHeight={500} 
        onResizeStop={(e, direction, ref, d) => handleResizeStop({e, direction, ref, d})}   
        onResize={(e, direction, ref, d) => handleResize({e, direction, ref, d})}   
      >
        {label}
    </Resizable>
  );
}

export default Bar