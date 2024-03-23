import { auth, provider } from '../plugins/firebase.ts';
import { signInWithPopup } from 'firebase/auth';

function SignInButton() {
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log(user);
        // Handle the authenticated user here (e.g., redirect to a dashboard)
      })
      .catch((error) => {
        console.error(error);
        // Handle errors here
      });
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

export default SignInButton;