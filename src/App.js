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

firebase.auth().getRedirectResult().then(function(result) {
  if (result.credential) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    // var token = result.credential.accessToken;
    // console.log(token)
    // ...
  }
  // The signed-in user info.
  // var user = result.user;
}).catch(function(error) {
  console.log(error)
  // Handle Errors here.
  // var errorCode = error.code;
  // var errorMessage = error.message;
  // // The email of the user's account used.
  // var email = error.email;
  // // The firebase.auth.AuthCredential type that was used.
  // var credential = error.credential;
  // ...
});

class Messages extends Component {
  constructor (props) {
    super(props)
    this.state = {messages: []}
    let db = firebase.firestore();
    db.collection("messages").get().then((querySnapshot) => {
      let messages = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      this.setState({messages: messages})
    });
  }

  push () {
    // add data
    let db = firebase.firestore();
    db.collection("messages").add({
        content: 'hello firestore'
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
          <button onClick={this.push}>push</button>
        </div>
        <ul>
          {
            this.state.messages.map((message) => {
              console.log(message);
              return <li>{message.content}</li>
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
