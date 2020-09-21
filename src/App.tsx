import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Editor from './components/Editor/Editor';
import Viewer from './components/Viewer/Viewer'
import Home from './Home';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/editor/:id" component={Editor} />
        <Route path="/viewer/:id" component={Viewer} />
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}
