/* Firebase Configuration — Replace with your project credentials */
const firebaseConfig = {
  apiKey: "AIzaSyCaVVvsJ51WevjE2C8xO_ON-wot2MiZQyQ",
  authDomain: "ttrpg-helper-577e5.firebaseapp.com",
  projectId: "ttrpg-helper-577e5",
  storageBucket: "ttrpg-helper-577e5.firebasestorage.app",
  messagingSenderId: "361713199208",
  appId: "1:361713199208:web:69a10e52aff75cc1dd33dd"
};

// Initialize Firebase (only if SDK loaded)
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  var fbAuth = firebase.auth();
  // Enable offline persistence
  db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
} else {
  var db = null;
  var fbAuth = null;
}
