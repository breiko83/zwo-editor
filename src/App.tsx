import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Editor from './components/Editor/Editor';

export default function App() {

  return (
    <Router>
      <Switch>
        <Route path="/editor/:id" component={Editor} />
        <Redirect from="/" to="/editor/new" />
      </Switch>
    </Router>
  )
}
