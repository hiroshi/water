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

class Members extends Component {
  constructor (props) {
    super(props);
    this.state = {users: []};
    for (let uid in props.room.users) {
      let db = firebase.firestore();
      db.collection('users').doc(uid).get()
        .then((docSnap) => {
          let users = this.state.users;
          users.push(Object.assign({id: uid}, docSnap.data()));
          this.setState({users: users});
        })
        .catch((error) => {
          console.error("Error getting document: ", error);
        })
    }
  }

  render () {
    return (
      <div>
        <h4>Members</h4>
        <ul>
          {
            this.state.users.map((user) => {
              return <li key={user.id}>{user.name}</li>
            })
          }
        </ul>
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
    let users = {};
    users[this.props.user.id] = true;
    db.collection("rooms").add({
      timestamp: Date(),
      name: name,
      users: users
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

  renderRoom = (room) => {
    return (
      <div>
        <Members room={this.state.currentRoom} />
        <Messages room={this.state.currentRoom} />
      </div>
    );
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
        { this.state.currentRoom && this.renderRoom(this.state.currentRoom) }
      </div>
    );
  }
}

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {}
    firebase.auth().onAuthStateChanged(function(authUser) {
      if (authUser) {
        let db = firebase.firestore();
        let data = {
          name: authUser.displayName,
          email: authUser.email
        };
        db.collection('users').doc(authUser.uid).set(data, {merge: true});
        this.setState({ user: Object.assign({id: authUser.uid}, data)});
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
        <Rooms user={this.state.user}/>
      </div>
    );
  }
}

export default App;
