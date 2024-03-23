import {useNavigate} from "react-router-dom";
import {ChangeEvent, useState} from "react";
import {
  collection,
  updateDoc,
  addDoc,
  setDoc,
  doc,
  DocumentReference,
} from "firebase/firestore";
import {db} from "../plugins/firebase.ts";
import SignOutButton from "../components/SignOutButton.tsx";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import {User} from "../interfaces";
const Home = () => {
  const currentUser: User | null = useSelector((state: RootState) => state.authentication.currentUser);
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState<string>('');

  const roomIdInputHandler = (event: ChangeEvent<HTMLInputElement>) : void => {
    setRoomIdInput(event.target.value)
  }
  const createRoomHandler = async () : Promise<void> => {
    if(currentUser){
      console.log(currentUser)
      const roomRef: DocumentReference = await addDoc(collection(db, "rooms"), {admin: currentUser.uid});
      await updateDoc(roomRef, {id: roomRef.id});
      await joinRoom(roomRef);
    }

    // const attendeeRef = doc(db, "rooms", roomRef.id, "attendees", currentUser.uid);
    // await setDoc(doc(db, "rooms", roomRef.id, "attendees", currentUser.uid),
    //   {
    //     uid: currentUser.uid,
    //     displayName: currentUser.displayName,
    //     photoURL: currentUser.photoURL,
    //     email: currentUser.email,
    //   }
    // );
    // await updateDoc(attendeeRef, {id: currentUser.uid});
    // if(attendeeRef){
    //   navigate('/room/' + roomRef.id);
    // }
  }
  const joinRoom = async (roomRef: DocumentReference) : Promise<void> => {
    if (!currentUser) {
      console.error('No current user found.');
      return; // Exit early if there is no user.
    }

    try {
      const attendeeRef: DocumentReference = doc(db, "rooms", roomRef.id, "attendees", currentUser.uid);
      await setDoc(attendeeRef,
        {
          id: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email,
        }
      );
      // await updateDoc(attendeeRef, {id: currentUser.uid});

      navigate('/room/' + roomRef.id);

    } catch (error) {
      console.error('Failed to join room:', error);
    }
  }
  const joinRoomHandler = () => {
    const roomRef: DocumentReference = doc(db, "rooms", roomIdInput);
    joinRoom(roomRef).catch(error => console.error('Failed to join room:', error));
  }
  return (
    <>
      <div className="p-20">
        {/*<div className="mb-5">*/}
        {/*  <div>*/}
        {/*    <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">*/}
        {/*      Ditt namn*/}
        {/*    </label>*/}
        {/*    <input type="text" id="first_name"*/}
        {/*           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"*/}
        {/*           placeholder="John" required*/}
        {/*           value={nameInput} onChange={(event: ChangeEvent<HTMLInputElement>) => nameInputHandler(event)}*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*</div>*/}
        <button onClick={() => createRoomHandler()} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
          Create new room
        </button>
        <div className="mt-10">
          <label htmlFor="room_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Room ID
          </label>
          <input type="text" id="room_id"
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="efLZoNb25xgGQFQRW7gq" required
                 value={roomIdInput} onChange={(event: ChangeEvent<HTMLInputElement>) => roomIdInputHandler(event)}
          />
          <button onClick={() => joinRoomHandler()} className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
            Join room
          </button>
        </div>

        <div>
          <SignOutButton/>
        </div>
      </div>
    </>
  )
}

export default Home;