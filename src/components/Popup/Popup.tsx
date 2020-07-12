import React from 'react'
import './Popup.css'

const Popop = (props: { children: any, title: string }) => {

  return (
    <div className='popup-background'>
      <div className='popup'>
        <h2>{props.title}</h2>
        {props.children}
      </div>
    </div>
  )
}

export default Popop