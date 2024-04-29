import {useParams} from "react-router-dom";
import {onSnapshot, collection, doc} from "firebase/firestore";
import {Suspense, useCallback, useEffect, useState} from "react";
import {db} from "../plugins/firebase";
import {RoomInterface, Attendee, User} from "../interfaces";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../store";
import RoomHeader from "../components/RoomHeader.tsx";
import AssumeBox from "../components/AssumeBox.tsx";
import AttendeesList from "../components/AttendeesList.tsx";
import {roomActions} from "../store/room.ts";
import {attendeeActions} from "../store/attendee.ts";
import WinnerPhase from "../components/WinnerPhase.tsx";
import { dataAttributes } from "../data/attributes.ts";
import Attributes from "../components/Attributes.tsx";
import DiceGame from "../components/DiceGame.tsx";
import DiceThrow from "../components/DiceThrow.tsx";
import {Canvas} from "@react-three/fiber";
import { createRoot } from 'react-dom/client'
import {Physics, useBox} from "@react-three/cannon";
import DiceCube from "../components/DiceCube.tsx";
import "./Room.scss"
import Floor from "../components/Floor.tsx";
import Wall from "../components/Wall.tsx";
import {OrbitControls} from "@react-three/drei";
const Room = () => {
  const dispatch : AppDispatch = useDispatch<AppDispatch>();
  const currentUser: User | null = useSelector((state: RootState) => state.authentication.currentUser);
  const currentRoom: RoomInterface | null = useSelector((state: RootState) => state.room.currentRoom);
  const attendees: Attendee[] | [] = useSelector((state: RootState) => state.attendee.attendees);
  const currentAttendee: Attendee | null = useSelector((state: RootState) => state.attendee.currentAttendee);
  const {roomId} = useParams<{ roomId: string }>();

  const [throwNow, setThrowNow] = useState<boolean>(false);
  const [dicePosition, setDicePosition] = useState<[x: number, y: number, z: number]>([-5, 4, 0]);

  const fetchAttendees = useCallback(async () : Promise<void> => {
    if (!roomId) {
      console.error('roomId is not defined');
      return;
    }
      /** Subscribe to the current Room */
      onSnapshot(doc(db, "rooms", roomId), (querySnapShot) => {
        if (querySnapShot.exists()) {
          const currentRoom: RoomInterface = querySnapShot.data() as RoomInterface;
          dispatch(roomActions.fetchCurrentRoom({currentRoom}));
        }
      })

      /** Subscribe to All attendees & to the current Attendee within current room */
      onSnapshot(collection(db, "rooms", roomId, "attendees"), (querySnapshot) => {
        if (!querySnapshot.empty) {
          const attendees : Attendee[] = querySnapshot.docs.map(doc => doc.data() as Attendee);
          dispatch(attendeeActions.fetchAttendees({attendees, currentUser}));
        }
      });
  }, [roomId, currentUser, dispatch]);

  useEffect(() : void => {
    fetchAttendees().catch(console.error);
  }, [fetchAttendees]);

  const [diceNumbers, setDiceNumbers] = useState<number[]>([])
  const handleDiceSleep = (topFace: number) : void => {
    setDiceNumbers((currentnNumbers: number[]) => [...currentnNumbers, topFace])
    console.log(topFace)
  }

  return (
    <>
      {currentRoom && currentUser && attendees && roomId && (
        <div className="flex flex-col h-screen">
          <div>
            <RoomHeader currentUser={currentUser} currentRoom={currentRoom} attendees={attendees} roomId={roomId} />
          </div>
          <div>Dashagh :
            {diceNumbers.map((number: number, index: number) => (
              <span key={index}>{number}</span>
            ))}
          </div>
          {/*<ambientLight intensity={0.1} />*/}
          {/*<directionalLight position={[0, 0, 5]} />*/}
          {/*        <Plane />*/}
          <div className="flex-grow items-center justify-center flex">
            { currentRoom.winner ? (
              <WinnerPhase currentRoom={currentRoom} attendees={attendees}/>
            ) : (
              <>
                { (currentAttendee?.diceThrowing && !currentAttendee.dead) ? (
                  <div className="canvas-container">
                    <div className="text-center mt-4">
                      <button className="btn-primary" onClick={() => setDicePosition([-5, 4, 0])}>Throw Dice</button>
                    </div>
                    <Canvas shadows  camera={{ position: [0, 30, 15], fov: 20 }}>
                      <spotLight
                        position={[-2.5, 5, 5]}
                        angle={Math.PI / 4}
                        penumbra={0.5}
                        castShadow={true}
                        intensity={Math.PI * 25}
                      />
                      <spotLight
                        position={[2.5, 5, 5]}
                        angle={Math.PI / 4}
                        penumbra={0.5}
                        castShadow={true}
                        intensity={Math.PI * 25}
                      />
                      <ambientLight intensity={2} />
                      <directionalLight position={[0, 0, 1]} />
                      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                      <Physics gravity={[0, -50, 0]} >
                        {/*{ throwNow && (*/}
                        {/*  <>*/}
                        <DiceCube velocity={[10, 52, 3]} onDiceSleep={handleDiceSleep} position={dicePosition} />
                        <DiceCube velocity={[10, 3, 2]} onDiceSleep={handleDiceSleep} position={[-5, 6, 0]} />
                        <DiceCube velocity={[10, 1, 2]} onDiceSleep={handleDiceSleep} position={[-5, 5, 0]} />
                        {/*</>*/}
                        {/*)}*/}
                        <Wall position={[0, .5, -5]} rotation={[0, Math.PI/2 , 0]} />
                        <Wall  position={[0, .5, 5]} rotation={[0, Math.PI/2 , 0]}/>
                        <Wall  position={[-5, .5, 0]} rotation={[0, 0 , 0]}/>
                        <Wall  position={[5, .5, 0]} rotation={[0, 0 , 0]}/>
                        <Floor />
                      </Physics>
                    </Canvas>
                  </div>
                ) : (
                  <AttendeesList attendees={attendees} currentAttendee={currentAttendee} />
                )}
              </>
            )}
          </div>

          <div className=" py-4 bg-gray-200 flex items-center">
            {!currentRoom.winner && !currentAttendee?.diceThrowing && (
              <AssumeBox
                currentAttendee={currentAttendee}
                currentRoom={currentRoom}
                attendees={attendees}
                roomId={roomId}
              />
            )}
          </div>

        </div>
      )}

    </>
  );
};
export default Room;
