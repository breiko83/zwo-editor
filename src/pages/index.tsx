import React from 'react'
import { Link, graphql, useStaticQuery } from 'gatsby';
import Img from "gatsby-image"
import { Router } from "@reach/router"
import './index.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faLaptop, faCloud, faPiggyBank } from '@fortawesome/free-solid-svg-icons'
import { Helmet } from "react-helmet";

export default function Home() {

  const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "icon.png" }) {
        childImageSharp {
          # Specify a fixed image and fragment.
          # The default width is 400 pixels
          fixed(width: 100) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)

  return (
    <div className="home">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zwift Workout Editor</title>
        <link rel="canonical" href="https://zwiftworkout.netlify.app/" />        
        <meta name="description" content="Edit and share your Zwift workouts directly from your browser" />        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="@CarloSchiesaro" />
        <meta property="og:url" content="https://zwiftworkout.netlify.app/" />        
        <meta property="og:title" content="Zwift Workout Editor" />
        <meta property="og:description" content="Edit and share your Zwift workouts directly from your browser" />
        <meta property="og:image" content="https://zwiftworkout.netlify.app/android-chrome-256x256.png" />
        
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="hero">
        <Img
          fixed={data.file.childImageSharp.fixed}
          alt="Logo"
        />
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
            <h3><FontAwesomeIcon icon={faPiggyBank} fixedWidth /> Open Source</h3>
            <p>This software is free to use.</p>
          </div>
        </div>
      </div>
      <div className="blue">
        <div className="share">
          <h2>Do you like this?</h2>
          <p>Please help me out by sharing this page on Social Media</p>
          <a className="twitter-share-button"
            href="https://twitter.com/intent/tweet?text=Check%20out%20https://zwiftworkout.netlify.app/">
          Share on Twitter</a>
          <a className="facebook-share-button"
            href="https://www.facebook.com/sharer/sharer.php?u=https://zwiftworkout.netlify.app/">
          Share on Facebook</a>
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
    </div>
  )
}