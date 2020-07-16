import firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyAnjDvxTUCDNtOTfl_LoJKs0ejCaKQ5MFM",
  authDomain: "zwiftworkout.firebaseapp.com",
  databaseURL: "https://zwiftworkout.firebaseio.com",
  projectId: "zwiftworkout",
  storageBucket: "zwiftworkout.appspot.com",
  messagingSenderId: "1029540478836",
  appId: "1:1029540478836:web:c951e0c72508468a9ef621",
  measurementId: "G-1B0S5TVM5F"
}

firebase.initializeApp(firebaseConfig)
export default firebase
export const auth = firebase.auth()
