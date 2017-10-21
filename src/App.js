import React, { Component } from 'react';
// import logo from './logo.svg';
import * as firebase from 'firebase';
import 'firebase/firestore';
import './App.css';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

class Messages extends Component {
  constructor (props) {
    super(props)
    this.state = {messages: []}
    let db = firebase.firestore();
    db.collection("messages").orderBy('timestamp').onSnapshot((querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((docSnap) => {
        messages.unshift(Object.assign({id: docSnap.id}, docSnap.data()));
      });
      this.setState({messages: messages})
    });
  }

  push = () => {
    // add data
    let db = firebase.firestore();
    db.collection("messages").add({
      timestamp: Date(),
      content: this.textarea.value
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }

  render () {
    return (
      <div>
        <div>
          <textarea ref={(x)=>{this.textarea = x}}></textarea>
          <button onClick={this.push}>push</button>
        </div>
        <ul>
          {
            this.state.messages.map((message) => {
              return <li key={message.id}>{message.content}</li>
            })
          }
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {}
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        this.setState({ user: user });
      } else {
        console.log('no login')
      }
    }.bind(this));
  }

  login () {
    console.log("login")
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithRedirect(provider);
    firebase.auth().getRedirectResult().then(function(result) {
      console.log(result);
    }).catch(function(error) {
      console.log(error)
    });
  }

  render () {
    return (
      <div>
        {
          this.state.user
            ? this.state.user.email
            : <button onClick={this.login}>login</button>
        }
        { this.state.user && <Messages /> }
      </div>
    );
  }
}

export default App;
