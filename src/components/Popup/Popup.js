import React from 'react'
import './Popup.css'

const Popop = ({ children, title }) => {

  return (
    <div className='popup-background'>
      <div className='popup'>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default Popop