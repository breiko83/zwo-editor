import React, {useState} from 'react'
import './Footer.css'
import Privacy from '../Privacy/Privacy'
import Terms from '../Terms/Terms'
import Popup from '../Popup/Popup'

export default function Footer() {

  const [showTerms, setShowTerm] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  return (
    <div className="footer">
      <ul>
        <li>Zwift Workout v1.6 &copy; 2020 Sharpify Ltd All Rights Reserved</li>
        <li><a href="#terms" onClick={() => setShowTerm(true)}>Terms of Service</a></li>
        <li><a href="#privacy" onClick={() => setShowPrivacy(true)}>Privacy Policy</a></li>
        <li><a href="https://github.com/breiko83/zwo-editor/issues" target="blank">Report an issue</a></li>        
      </ul>
       
      {showTerms &&
        <Popup width="90%" height="80%" dismiss={() => setShowTerm(false)}>      
          <Terms />
        </Popup>
      }
      {showPrivacy &&
        <Popup width="50%" height="50%" dismiss={() => setShowPrivacy(false)}>
          <Privacy />
        </Popup>
      }
    </div>
  )
}