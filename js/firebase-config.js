/* Firebase Configuration — Replace with your project credentials */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
