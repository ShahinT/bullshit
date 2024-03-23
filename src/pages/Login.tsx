import {useNavigate} from "react-router-dom";
import {ChangeEvent, useState} from "react";
import SignInButton from "../components/SignInButton.tsx";

const Login = () => {

  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState<string>('');
  const nameInputHandler = (event: ChangeEvent<HTMLInputElement>) : void => {
    setNameInput(event.target.value)
  }
  return (
    <>
      <div className="p-20">
        <div>
          <SignInButton/>
        </div>
        {/*<div>*/}
        {/*  <input value={nameInput} onChange={(event: ChangeEvent<HTMLInputElement>) => nameInputHandler(event)}/>*/}
        {/*</div>*/}
        {/*<button onClick={() => navigate('/login')} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Create new room</button>*/}
      </div>
    </>
  )
}

export default Login;