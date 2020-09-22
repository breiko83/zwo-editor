import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import './Popup.css'

const Popop = (props: { width: string, height?: string, dismiss: Function, children: any}) => {

  return (
    <div className='popup-background'>
      <div className='popup' style={{width: props.width, height: props.height}}>        
        <button className="close" onClick={()=>props.dismiss()}>
          <FontAwesomeIcon icon={faTimesCircle} size="lg" fixedWidth />
        </button>
        {props.children}
      </div>
    </div>
  )
}

export default Popop