import {useNavigate, useParams} from "react-router-dom";
import {onSnapshot, collection, doc, query, where, deleteDoc, updateDoc, DocumentReference} from "firebase/firestore";
import {useCallback, useEffect, useState} from "react";
import {db} from "../plugins/firebase";
import {User} from "../interfaces";
import {useSelector} from "react-redux";
import {RootState} from "../store";
import dice1 from "../assets/dices/1.png";
import dice2 from "../assets/dices/2.png";
import dice3 from "../assets/dices/3.png";
import dice4 from "../assets/dices/4.png";
import dice5 from "../assets/dices/5.png";
import dice6 from "../assets/dices/6.png";
import dDice from "../assets/dice-3d.jpg";

const diceImages = [dice1, dice2, dice3, dice4, dice5, dice6]

export interface Attendee {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  turn: boolean;
  dices: number[],
  diceThrowing: boolean;
  dead: boolean
}

export interface Alert {
  show: boolean,
  heading?: string,
  text?: string
}

export interface Room {
  admin: string,
  id: string,
  currentAssume: {
    currentCountOfDices: number,
    currentNumber: number
  },
  turningPlayerIndex: number,
  diceThrowing: boolean
}

const Room = () => {
  const currentUser: User | null = useSelector((state: RootState) => state.authentication.currentUser);
  // const currentAttendee: Attendee | null = useSelector((state: RootState) => state.attendee.currentAttendee);
  const [rotateImage, setRotateImage] = useState<boolean>(false);
  const [winner, setWinner] = useState<Attendee | null>(null);
  const [showDices, setShowDices] = useState<boolean>(true);
  const [currentCountOfDices, setCurrentCountOfDices] = useState<number>(0);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const {roomId} = useParams<{ roomId: string }>();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const navigate = useNavigate();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [bigAlert, setBigAlert] = useState<Alert | null>(null);
  // const [yourDices, setYourDices] = useState<number[]>();
  const fetchAttendees = useCallback(async () => {
    if (!roomId) {
      console.error('roomId is not defined');
      return;
    }
    try {
      await onSnapshot(doc(db, "rooms", roomId), (querySnapShot) => {
        if (querySnapShot.exists()) {
          const roomData = querySnapShot.data();
          setCurrentRoom({
            admin: roomData.admin,
            id: roomData.id,
            currentAssume: roomData.currentAssume && {
              currentCountOfDices: roomData.currentAssume.currentCountOfDices as number,
              currentNumber: roomData.currentAssume.currentNumber as number
            },
            turningPlayerIndex: roomData.turningPlayerIndex && roomData.turningPlayerIndex,
            diceThrowing: roomData.diceThrowing
          });
        }
      })
      await onSnapshot(collection(db, "rooms", roomId, "attendees"), (querySnapshot) => {
        const asd = querySnapshot.docs.map((doc) => ({
          id: doc.data().id,
          displayName: doc.data().displayName,
          photoURL: doc.data().photoURL,
          email: doc.data().email,
          turn: doc.data().turn,
          dices: doc.data().dices,
          diceThrowing: doc.data().diceThrowing,
          dead: doc.data().dead
        }))
        setAttendees(asd);
      });
      const q = query(collection(db, "rooms", roomId, "attendees"), where("email", "==", currentUser?.email));
      await onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs[0].data();
        setCurrentAttendee({
          id: data.id,
          displayName: data.displayName,
          photoURL: data.photoURL,
          email: data.email,
          turn: data.turn,
          dices: data.dices,
          diceThrowing: data.diceThrowing,
          dead: data.dead
        })
      })
    } catch (error) {
      console.error("Failed to fetch attendees:", error);
    }
  }, [roomId, currentUser]);

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
  const restartGameHandler = async () => {

    await updateDoc(doc(db, "rooms", currentRoom!.id), {
      currentAssume: null,
      turningPlayerIndex: 0
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

  const throwDice = async (): Promise<void> => {
    const randomNumbers: number[] = [];
    setRotateImage(true);
    setShowDices(true);

    setTimeout(() => {
      setShowDices(false);
      setRotateImage(false);
    }, 3000)
    for (let i: number = 0; i < (currentAttendee!.dices === null ? 3 : currentAttendee!.dices.length); i++) {
      randomNumbers.push(Math.floor(Math.random() * 6) + 1);
      await safelyUpdateDoc(doc(db, "rooms", roomId!, "attendees", currentAttendee!.id), {
        dices: randomNumbers,
      })
      setTimeout(async (): Promise<void> => {
        await safelyUpdateDoc(doc(db, "rooms", roomId!, "attendees", currentAttendee!.id), {
          diceThrowing: false
        })
      }, 5000)
    }
  }

  const startGameHandler = async (): Promise<void> => {
    if (!roomId || !currentUser?.uid) {
      console.error("No currentUser or roomId found")
      return;
    }

    for (const attendee of attendees) {
      await safelyUpdateDoc(doc(db, "rooms", roomId, "attendees", attendee.id), {
        diceThrowing: true
      })
    }

    await safelyUpdateDoc(doc(db, "rooms", roomId), {
      turningPlayerIndex: 0
    })
    await safelyUpdateDoc(doc(db, "rooms", roomId, "attendees", attendees[currentRoom!.turningPlayerIndex].id), {
      turn: true
    })
  }

  useEffect(() => {
    fetchAttendees().catch(console.error);
  }, [fetchAttendees]);

  async function safelyUpdateDoc<T>(documentRef: DocumentReference, data: Partial<T>) {
    try {
      await updateDoc(documentRef, data);
      console.log('Document successfully updated');
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  }

  const assumeHandler = async () => {

    if (!currentRoom || currentRoom.turningPlayerIndex >= attendees.length) {
      console.error('Invalid room state or attendees');
      return;
    }

    // Disable turn for the current turning player
    await safelyUpdateDoc(doc(db, "rooms", currentRoom.id, "attendees", attendees[currentRoom.turningPlayerIndex].id), {
      turn: false
    });

    // Update the room with the new assume and turning player index
    const nextTurnIndex = attendees.length === currentRoom.turningPlayerIndex + 1 ? 0 : currentRoom.turningPlayerIndex + 1;
    await safelyUpdateDoc(doc(db, "rooms", currentRoom.id), {
      currentAssume: {currentCountOfDices, currentNumber},
      turningPlayerIndex: nextTurnIndex
    });

    // Enable turn for the next player
    await safelyUpdateDoc(doc(db, "rooms", currentRoom.id, "attendees", attendees[nextTurnIndex].id), {
      turn: true
    });


    setCurrentCountOfDices(0);
    setCurrentNumber(null)
  }


  const tapDiceHandler = (index: number): void => {
    setCurrentCountOfDices(currentCountOfDices + 1);
    setCurrentNumber(index + 1)
  }
  const bullshitHandler = async (): Promise<void> => {

    const actuallCount: number = attendees
      .flatMap((attendee: Attendee) => attendee.dices)
      .filter((dice: number) => dice === currentRoom?.currentAssume?.currentNumber)
      .length;

    // Finding index of the player who clicked the BULLSHIT button and submitted an inquiry
    const inquirySubmitterIndex: number = attendees.findIndex(attendee => attendee.turn);

    if (actuallCount >= currentRoom!.currentAssume.currentCountOfDices) {
      // TRUE ASSUME !!
      console.log("THAT WAS TRUE")
      // Remove a dice from current turned player
      await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendees[inquirySubmitterIndex].id), {
        dices: attendees[inquirySubmitterIndex].dices.slice(0, -1)
      })

    } else {
      // BULLSHIT !!
      console.log("BULLSHIT !!")
      // Finding player who assumed a Bullshit
      const losingDicePlayer: Attendee = inquirySubmitterIndex === 0 ? attendees[attendees.length - 1] : attendees[inquirySubmitterIndex - 1];

      setBigAlert({
        show: true,
        heading: "BULLSHIT",
        text: losingDicePlayer.displayName + " lost a dice"
      });
      setTimeout((): void => {
        setBigAlert({
          show: false,
          ...bigAlert
        });
      }, 3000)

      // Check if the player who lost the dice has any dices left or they should be DEAD
      // Store the length localy so we can be sure that we are using the NOT updated length later in the code in this function.
      // Because we can not be sure that the state is updated or not by the time we eecut e the next await functiuon
      const bullshitterDiceLength: number = losingDicePlayer.dices.length

      // Remove last dice of the bullshitter
      // Mark them as dead if they have no dice left.
      const localAttendees: Attendee[] = attendees.map((attendee: Attendee) => {
        return attendee.id === losingDicePlayer.id ?
          {
            ...attendee,
            dices: losingDicePlayer.dices.slice(0, -1),
            dead: bullshitterDiceLength === 1 && true,
          } :
          {...attendee}
      })

      await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", losingDicePlayer.id), {
        dices: losingDicePlayer.dices.slice(0, -1),
        dead: bullshitterDiceLength === 1 && true
      })


      setWinner(checkIfWeHaveWinner(localAttendees))
      if (winner){
        alert("The Winner is: " + winner.displayName)
        return;
      }

      // Remove Turn from current turned player
      await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendees[inquirySubmitterIndex].id), {
        turn: false
      })
      // Update turn for next player
      await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", (bullshitterDiceLength === 1  ? attendees[inquirySubmitterIndex].id : losingDicePlayer.id)), {
        turn: true
      })

      setTimeout(async () => {
        for (const attendee of attendees) {
          await safelyUpdateDoc(doc(db, "rooms", roomId!, "attendees", attendee.id), {
            diceThrowing: (attendee.dices && attendee.dices.length !== 0)  && true
          })
        }
      }, 4000)

      await safelyUpdateDoc(doc(db, "rooms", roomId!), {
        currentAssume: null
      })
    }
  }

  const checkIfWeHaveWinner = (latestAttendees: Attendee[]): (Attendee | null) => {
    const attendeesWithDices: Attendee[] = latestAttendees.filter((attendee: Attendee) => attendee.dices.length > 0);
    return attendeesWithDices.length === 1 ? attendeesWithDices[0] : null;
  }

  return (
    <>
      {currentRoom && (
        <div>
          <div className="flex justify-between p-10">
            <div>Room</div>
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
          <div className="p-10">
            <div>
              Current Assume:
              {currentRoom.currentAssume && (
                <>
                  {currentRoom.currentAssume.currentCountOfDices} x {currentRoom.currentAssume.currentNumber}
                </>
              )}
            </div>
            {/*<div>*/}
            {/*  Your Dices:*/}
            {/*  {currentAttendee && currentAttendee.dices && currentAttendee.dices.length > 0 && currentAttendee.dices.map((dice, index) => (*/}
            {/*    <span className="border border-amber-800 px-2 py-1 rounded mr-1" key={index}>{dice}</span>*/}
            {/*  ))}*/}
            {/*</div>*/}
          </div>
          {winner ? (
            <div>GAME IS DONE</div>
          ) : (
            <div className="flex">
              {attendees.map((attendee: Attendee) => (
                <div className={attendee.turn ? "p-5" : "p-5"} key={attendee.id}>
                  <div
                    className={`rounded-xl p-5 ${attendee.turn ? "border-4 border-amber-500" : "border-4 border-gray-200"}`}>
                    <div>{attendee.displayName}</div>
                    <div>
                      {attendee.dices && attendee.dices.length === 0 ? (
                        <div className="w-24 h-24 flex justify-center items-center">
                          <div>DEAD</div>
                        </div>
                      ) : (
                        <img alt="profile-image" className="w-24" src={attendee.photoURL}/>
                      )}
                    </div>
                    <div className="mt-2 flex">
                      {attendee.dices && attendee.dices.map((dice, index) => (
                        <div key={index}>
                          {currentAttendee?.id === attendee.id ? (
                            <span className="border border-amber-800 px-2 py-1 rounded mr-1">{dice}</span>
                          ) : (
                            <img src={dDice} alt="dDice" className="w-8"/>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="fixed bottom-0 h-16 w-full">
            <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
              {currentAttendee?.turn ? (
                <div className="absolute bottom-0 flex justify-center">
                  <div className="bg-slate-100 rounded-tl-2xl rounded-tr-2xl w-1/3 p-12">
                    <div className="flex items-center justify-center mb-10">
                      { (currentCountOfDices !== 0 && currentNumber) && (
                        <>
                          <div className="mr-10">
                            {currentCountOfDices} x {currentNumber}
                          </div>

                          <button onClick={() => assumeHandler()} type="button"
                                  className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            GO !
                          </button>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-8">
                      {diceImages.map((dice, index) => (
                        <img key={index} src={dice} alt="dice" onClick={() => tapDiceHandler(index)}/>
                      ))}
                    </div>
                    { currentRoom.currentAssume && (
                      <div className="flex justify-center mt-4">
                        <button type="button" className="bg-violet-600 text-white px-3 py-1.5 rounded-xl" onClick={() => bullshitHandler()}>
                          BullShit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    It is not your turn yet
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/*<div>*/}
      {/*  { assumeModal && (*/}
      {/*    <div className="absolute bottom-0 flex justify-center">*/}
      {/*      <div className="bg-slate-100 rounded-tl-2xl rounded-tr-2xl w-1/3 p-12 flex flex-col">*/}
      {/*        <div className="flex items-center justify-center mb-10">*/}
      {/*          <div className="mr-10">*/}
      {/*            {currentCountOfDices} x {currentNumber}*/}
      {/*          </div>*/}
      {/*          <button onClick={() => assumeHandler()} type="button" className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">*/}
      {/*            GO !*/}
      {/*          </button>*/}
      {/*        </div>*/}
      {/*        <div className="grid grid-cols-3 gap-8">*/}
      {/*          {diceImages.map((dice, index) => (*/}
      {/*            <img key={index} src={dice} alt="dice" onClick={() => tapDiceHandler(index)} />*/}
      {/*          ))}*/}
      {/*        </div>*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</div>*/}

      {currentAttendee?.diceThrowing && (
        <div className="fixed w inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white w-1/3 flex flex-col items-center justify-center p-10 rounded-lg shadow-lg">
            <div className="">
              <button className="btn-primary" onClick={() => throwDice()}>
                Throw Dice
              </button>
            </div>
            <div className="mt-10 flex">
              {currentAttendee && !currentAttendee.dices && Array.from({length: 3}).map((_, index) => (
                <div key={index}>
                  <img src={dDice} alt="dDice" className={`w-16 ${rotateImage && "rotating"}`}/>
                </div>
              ))}
              {currentAttendee && currentAttendee.dices && currentAttendee.dices.length > 0 && currentAttendee.dices.map((dice, index) => (
                <div key={index}>
                  {showDices ? (
                    <img src={dDice} alt="dDice" className={`w-16 ${rotateImage && "rotating"}`}/>
                  ) : (
                    // <span className="border border-amber-800 px-2 py-1 rounded mr-1" >{dice}</span>
                    <img src={diceImages[dice - 1]} alt="dDice" className={`w-8 ${rotateImage && "rotating"}`}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {bigAlert && bigAlert.show && (
        <div
          className="h-screen fixed bg-opacity-0 top-0 left-0 w-full flex flex-col justify-center items-center z-30 bg-gray-800">

          <div className="showText text-center">
            <div className="text-red-500 font-bold mb-3">{bigAlert.heading}</div>
            <div>{bigAlert.text}</div>
            {/*<div className="text-3 mb-3">BULLSHIT</div>*/}
            {/*<div>YE KOS MADARI DICE AZ DAST DAD</div>*/}
          </div>
        </div>
      )}
    </>
  );
};

export default Room;
