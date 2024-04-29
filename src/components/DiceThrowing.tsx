import dDice from "../assets/dice-3d.jpg";
import {Attendee} from "../interfaces";
import {doc} from "firebase/firestore";
import {db} from "../plugins/firebase.ts";
import {useState} from "react";
import useSafelyUpdateDoc from "../hooks/useSafelyUpdateDoc.tsx";
import {diceImages} from "./DiceImages.ts";
interface DiceThrowingProps {
  currentAttendee: Attendee | null,
  roomId: string | undefined
}
const DiceThrowing = ({currentAttendee, roomId}: DiceThrowingProps) => {
  const [rotateImage, setRotateImage] = useState<boolean>(false);
  const [showDices, setShowDices] = useState<boolean>(true);
  const safelyUpdateDoc = useSafelyUpdateDoc();

  const throwDice = async (): Promise<void> => {
    const randomNumbers: number[] = [];
    setRotateImage(true);
    setShowDices(true);

    setTimeout(() : void => {
      setShowDices(false);
      setRotateImage(false);
    }, 3000)
    for (let i: number = 0; i < (!currentAttendee!.dices ? 3 : currentAttendee!.dices.length); i++) {
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
  return (
    <>
      {currentAttendee?.diceThrowing && !currentAttendee.dead && (
        // <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        //   <div className="bg-white w-full h-screen-[h-5] flex flex-col items-center justify-center p-10 rounded-lg shadow-lg">
          <div className="text-center">
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
                    <img src={diceImages[dice - 1]} alt="dDice" className={`w-8 mr-2 ${rotateImage && "rotating"}`}/>
                  )}
                </div>
              ))}
            </div>
          </div>
        // </div>
      )}
    </>
  )
}
export default DiceThrowing;