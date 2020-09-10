import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Editor from '../components/Editor/Editor';
import Viewer from '../components/Viewer/Viewer'
import { Helmet } from "react-helmet";

export default function App() {
  return (
    <Router>
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
      <Switch>
        <Route path="/editor">
          <Editor />
        </Route>
        <Route path="/viewer/:id" component={Viewer} />
      </Switch>
    </Router>
  )
}
