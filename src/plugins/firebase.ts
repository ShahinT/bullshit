// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4y_18uLHqLms5JJCy2fV7zIAPn3d5gYY",
  authDomain: "react-wedding-7e506.firebaseapp.com",
  projectId: "react-wedding-7e506",
  storageBucket: "react-wedding-7e506.appspot.com",
  messagingSenderId: "333968609876",
  appId: "1:333968609876:web:0c8839868b24b52d7393c1",
  measurementId: "G-NBWBWN2FZW"
};
// const firebaseConfig = {
//   apiKey: "AIzaSyAUolRctlWtE3B5bF2yl395auX-pAs7oAE",
//   authDomain: "bullshit-be7da.firebaseapp.com",
//   projectId: "bullshit-be7da",
//   storageBucket: "bullshit-be7da.appspot.com",
//   messagingSenderId: "180270795507",
//   appId: "1:180270795507:web:0cdff93ee27318b6fb0586",
//   measurementId: "G-5RXF4SR2ZZ"
// };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// const analytics = getAnalytics(app);
export default app
export {auth, provider}