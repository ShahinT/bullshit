import {Attendee, RoomInterface, User} from "../interfaces";
import {deleteDoc, doc, updateDoc} from "firebase/firestore";
import {db} from "../plugins/firebase.ts";
import useSafelyUpdateDoc from "../hooks/useSafelyUpdateDoc.tsx";
import {useNavigate} from "react-router-dom";

export interface RoomHeaderProps {
  currentUser: User,
  currentRoom: RoomInterface,
  attendees: Attendee[],
  roomId: string
}
const RoomHeader = ({currentUser, currentRoom, attendees, roomId} : RoomHeaderProps) => {
  const safelyUpdateDoc = useSafelyUpdateDoc();
  const navigate = useNavigate();
  const restartGameHandler = async () : Promise<void> => {

    await updateDoc(doc(db, "rooms", currentRoom!.id), {
      currentAssume: null,
      turningPlayerIndex: 0,
      winner: null
    })
    for (const attendee of attendees) {
      await updateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendee.id), {
        turn: false,
        dices: null,
        diceThrowing: false,
        dead: false
      })
    }
  }

  const startGameHandler = async (): Promise<void> => {

    let allUpdatesSucceeed : boolean = true;

    // Update diceThrowing to True so each player can throw dices
    for (const attendee of attendees) {
      const attendeeIdUpdated : boolean = await safelyUpdateDoc(doc(db, "rooms", roomId, "attendees", attendee.id), {
        diceThrowing: true
      })
      if(!attendeeIdUpdated){
        console.log("Fialed to update diceThrowing for one or more attendees")
        allUpdatesSucceeed = false;
      }
    }

    // Update turningPlayerIndex so from each client easilty we know whos turn it is
    const roomTurnIndexUpdated : boolean = await safelyUpdateDoc(doc(db, "rooms", roomId), {
      turningPlayerIndex: 0
    })
    if(!roomTurnIndexUpdated){
      console.log("Fialed to update turningPlayerIndex for room")
      allUpdatesSucceeed = false;
    }

    // Update turn for the current player so we easilty can give permission to the player who can see buttons Assume || Bullshit
    const playerTurnUpdated : boolean = await safelyUpdateDoc(doc(db, "rooms", roomId, "attendees", attendees[currentRoom!.turningPlayerIndex].id), {
      turn: true
    })
    if(!playerTurnUpdated){
      console.log("Fialed to update turn for attendee")
      allUpdatesSucceeed = false;
    }

    // If all the updates went smoothly then log the correct text
    if (allUpdatesSucceeed) {
      console.log("Update succeeded");
    } else {
      console.log("One of or more updates have failed. Check logs.");
    }
  }

  const leaveRoomHandler = async (): Promise<void> => {
    if (!roomId || !currentUser?.uid) {
      console.error("No currentUser or roomId found")
      return;
    }
    try {
      await deleteDoc(doc(db, "rooms", roomId, "attendees", currentUser?.uid));
      navigate('/')
    } catch (error) {
      console.error("Failed to leave", error);
    }
  }

  return (
    <div className="flex h-16 justify-between items-center px-4 bg-gray-800 text-white">
      <div>Room</div>
      <div>
        Current Assume
        {currentRoom.currentAssume && (
          <span className="bg-gray-600 px-3 py-1 rounded text-lg ml-4">
            {currentRoom.currentAssume.currentCountOfDices} x {currentRoom.currentAssume.currentNumber}
          </span>
        )}
      </div>
      {currentUser?.uid === currentRoom.admin && (
        <div>
          <button className="m-4" onClick={() => restartGameHandler()}>Restart Game</button>
          <button className="m-4" onClick={() => startGameHandler()}>Start Game</button>

        </div>
      )}
      <div>
        <button onClick={() => leaveRoomHandler()}>Leave room</button>
      </div>
    </div>
  )
}
export default RoomHeader;