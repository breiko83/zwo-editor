import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Editor from './components/Editor/Editor';
import Home from './Home';
import { Helmet } from "react-helmet";

export default function App() {
  return (
    <Router>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Zwift Workout Editor</title>
        <link rel="canonical" href="https://zwiftworkout.netlify.app/" />
        <meta name="description" content="Edit and share your Zwift workouts directly from your browser" />
      </Helmet>
      <Switch>
        <Route path="/editor">
          <Editor />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}
