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

class Rooms extends Component {
  constructor (props) {
    super(props)
    this.state = {rooms: []}
    let db = firebase.firestore();
    db.collection("rooms").orderBy('timestamp').onSnapshot((querySnapshot) => {
      let rooms = [];
      querySnapshot.forEach((docSnap) => {
        rooms.unshift(Object.assign({id: docSnap.id}, docSnap.data()));
      });
      this.setState({rooms: rooms})
    });
  }

  createRoom = () => {
    let db = firebase.firestore();
    let name = this.input.value;
    db.collection("rooms").add({
      timestamp: Date(),
      name: name
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
      let room = {id: docRef.id, name: name};
      this.setState({currentRoom: room});
    }.bind(this))
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
    this.input.value = ''
  }

  selectRoom = (room) => {
    this.setState({currentRoom: room})
  }

  render () {
    return (
      <div>
        <h3>Rooms</h3>
        <div>
          <input type='text' ref={(x) => {this.input = x}} />
          <button onClick={this.createRoom}>Create Room</button>
        </div>
        <ul>
          {
            this.state.rooms.map((room) => {
              return <li key={room.id}><a href="#" onClick={() => this.selectRoom(room)}>{room.name}</a></li>
            })
          }
        </ul>
        { this.state.currentRoom && <Messages room={this.state.currentRoom} /> }
      </div>
    );
  }
}

class Messages extends Component {
  constructor (props) {
    super(props)
    this.state = {messages: []}
    let db = firebase.firestore();
    db.collection("messages").where('roomId', '==', props.room.id).orderBy('timestamp').onSnapshot((querySnapshot) => {
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
      roomId: this.props.room.id,
      timestamp: Date(),
      content: this.textarea.value
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
    this.textarea.value = ''
  }

  render () {
    return (
      <div>
        <h4>Messages</h4>
        <div>
          <textarea ref={(x) => {this.textarea = x}}></textarea>
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
    if (!this.state.user) {
      return <button onClick={this.login}>login</button>
    }

    return (
      <div>
        <h2>{ this.state.user.email }</h2>
        <Rooms />
      </div>
    );
  }
}

export default App;
