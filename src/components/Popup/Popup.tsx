import React from 'react'
import './Popup.css'

const Popop = (props: { children: any}) => {

  return (
    <div className='popup-background'>
      <div className='popup'>        
        {props.children}
      </div>
    </div>
  )
}

export default Popop