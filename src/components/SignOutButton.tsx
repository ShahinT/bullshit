import { auth } from '../plugins/firebase.ts';
import {signOut} from 'firebase/auth';

function SignInButton() {
  const logout = () => {
    signOut(auth).then(() => {
      console.log("You have been signed out");
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  return (
    <button onClick={logout}>Sign Out</button>
  );
}

export default SignInButton;