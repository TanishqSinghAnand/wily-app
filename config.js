import * as firebase from 'firebase'
require('@firebase/firestore')


  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyB4UjcN8lz2ekOAK_SlDQLlb74PmmfhQf4",
    authDomain: "wireleibraryapp-b4e3b.firebaseapp.com",
    databaseURL: "https://wireleibraryapp-b4e3b.firebaseio.com",
    projectId: "wireleibraryapp-b4e3b",
    storageBucket: "wireleibraryapp-b4e3b.appspot.com",
    messagingSenderId: "158943139166",
    appId: "1:158943139166:web:2c9f522e0b2b67f0572bcf"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  export default firebase.firestore()