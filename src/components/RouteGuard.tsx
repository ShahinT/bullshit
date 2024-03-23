import {Navigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {FC, ReactNode, useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, User} from "firebase/auth";
import {authenticationActions} from "../store/authentication.ts";
interface RouteGuardProps {
  isProtected: boolean;
  element: ReactNode
}
const RouteGuard: FC<RouteGuardProps> = ({ isProtected, element }) => {
  const dispatch = useDispatch();
  const auth = getAuth();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      onAuthStateChanged(auth,
        async (authUser: User | null) => {

        dispatch(authenticationActions.setCurrentUser({
          uid: authUser?.uid,
          email: authUser?.email,
          displayName: authUser?.displayName,
          photoURL: authUser?.photoURL
        }));
        setIsAuthenticated(!!authUser as boolean);
      });
    } catch (error) {
      console.error(error);
    }
  },[auth, dispatch])

  if (isAuthenticated === null) {
    return null
  }

  return !isAuthenticated && isProtected ? <Navigate to={'/login'} /> : !isAuthenticated && !isProtected ? <>{element}</> :
    isAuthenticated && isProtected ? <>{element}</> : isAuthenticated && !isProtected ? <Navigate to={'/'} /> : '';
};
export default RouteGuard;