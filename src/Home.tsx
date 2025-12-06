import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';
import './Home.css'
import Icon from './assets/icon.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faLaptop, faCloud, faPiggyBank, faRunning, faBiking } from '@fortawesome/free-solid-svg-icons'
import ReactGA from 'react-ga';
import { Helmet } from "react-helmet-async";
import Footer from './components/Footer/Footer'

export default function Home() {

  useEffect(() => {
    ReactGA.initialize('UA-55073449-9');
    ReactGA.pageview(window.location.pathname + window.location.search);
  })

  return (
    <div className="home">
      <Helmet>
        <meta name="description" content="Edit and share your Zwift workouts directly from your browser" />
        <meta property="og:title" content="Zwift Workout Editor" />
        <meta property="og:description" content="Edit and share your Zwift workouts directly from your browser" />
        <link rel="canonical" href="https://www.zwiftworkout.com/" />  
        <meta property="og:url" content="https://www.zwiftworkout.com/" />      
      </Helmet>
      <div className="hero">
        <img src={Icon} alt="logo" width="100" />
        <h1>Zwift Workout Editor</h1>
        <Link to="/editor/new" className="btn btn-primary btn-xl">Open Editor</Link>
      </div>
      <div className="features">
        <h2>Top features</h2>
        <p>Why should I use it?</p>
        <div className="perks">
          <div>
            <h3><FontAwesomeIcon icon={faBiking} fixedWidth /><FontAwesomeIcon icon={faRunning} fixedWidth /> Bike & Run</h3>
            <p>Works both for Running and Cycling workouts</p>
          </div>
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
            <h3><FontAwesomeIcon icon={faPiggyBank} fixedWidth /> Open Source</h3>
            <p>This software is free to use.</p>
          </div>
        </div>
      </div>
      <div className="blue">
        <div className="share" id="share">
          <h2>Do you like this?</h2>
          <p>Please support the project with a small donation</p>
          <script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="carloschieh" data-color="#FFDD00" data-emoji=""  data-font="Poppins" data-text="Buy me a coffee" data-outline-color="#000000" data-font-color="#000000" data-coffee-color="#ffffff" ></script>
        </div>
      </div>
      <div className="black">
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
      <Footer />
    </div>
  )
}