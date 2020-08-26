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
      <div className="features">
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
      <div className="about">
        <h2>About me</h2>
        <div className="bio">
          <h3>Bio</h3>
          <p>I'm a full stack developer and I love cycling. I joined Zwift during the 2020 lockdown and I loved it.</p>
          <p>Find me on Zwift (Carlo Schiesaro <span role="img" aria-label="Italy">🇮🇹</span>) or follow on <a href="https://www.strava.com/athletes/4523127" target="blank">Strava</a></p>
        </div>
        <div className="contact">
          <h3>Support</h3>
          <p>If you'd like to report for a bug or ask for a new feature please use my <a href="https://github.com/breiko83/zwo-editor" target="blank">github repository</a>.</p>
        </div>
      </div>
    </div>
  )
}