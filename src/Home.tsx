import React from 'react'
import { Link } from 'react-router-dom';
import './Home.css'
import Icon from './assets/icon.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faLaptop, faCloud, faPiggyBank } from '@fortawesome/free-solid-svg-icons'

export default function Home() {

  return (
    <div className="home">
      <div className="hero">
        <img src={Icon} alt="logo" width="100" />
        <h1>Zwift Workout Editor</h1>
        <Link to="/editor" className="btn btn-primary btn-xl">Open Editor</Link>
      </div>
      <div className="about">
        <h2>Top features</h2>
        <p>Why should I use it?</p>
        <div className="perks">
          <div>
            <h3><FontAwesomeIcon icon={faBolt} fixedWidth /> Fast</h3>
            <p>Super fast Online editor for your Zwift workout files.</p>
          </div>
          <div>
            <h3><FontAwesomeIcon icon={faLaptop} fixedWidth /> CPU Friendly</h3>
            <p>Edit your workout files outside Zwift - don't overload you computer</p>
          </div>
          <div>
            <h3><FontAwesomeIcon icon={faCloud} fixedWidth /> Share</h3>
            <p>Easily share your workout files with your friends</p>
          </div>
          <div>
            <h3><FontAwesomeIcon icon={faPiggyBank} fixedWidth /> Free</h3>
            <p>Free. Forever.</p>
          </div>
        </div>
      </div>
    </div>
  )
}