import {Alert, Attendee, RoomInterface} from "../interfaces";
import {useState} from "react";
import {diceImages} from "./DiceImages.ts";
import {doc} from "firebase/firestore";
import {db} from "../plugins/firebase.ts";
import useSafelyUpdateDoc from "../hooks/useSafelyUpdateDoc.tsx";
import BigAlert from "./BigAlert.tsx";

interface AssumerBoxProps {
  currentAttendee: Attendee | null,
  currentRoom: RoomInterface,
  attendees: Attendee[],
  roomId: string,
}
const AssumeBox = ({currentAttendee, currentRoom, attendees} : AssumerBoxProps) => {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [currentCountOfDices, setCurrentCountOfDices] = useState<number>(0);
  const [bigAlert, setBigAlert] = useState<Alert | null>(null);
  // const [errorMessage, setErrorMessage] = useState<string>('')

  const safelyUpdateDoc = useSafelyUpdateDoc();
  const tapDiceHandler = (index: number): void => {

    setCurrentCountOfDices(currentCountOfDices + 1);
    setCurrentNumber(index + 1)
  }

  const isAssumeValid = () : boolean => {
    return (currentRoom.currentAssume && ((currentNumber! <= currentRoom.currentAssume.currentNumber) && (currentCountOfDices > currentRoom.currentAssume.currentCountOfDices))) ||
      (currentRoom.currentAssume && ((currentNumber! > currentRoom.currentAssume.currentNumber) && (currentCountOfDices >= currentRoom.currentAssume.currentCountOfDices))) ||
      (!currentRoom.currentAssume)
  }

  const assumeHandler = async () : Promise<void> => {


    let foundNextIndex : boolean = false;
    let nextIndex : number = -1;

    let index : number = currentRoom.turningPlayerIndex+1;
    while (!foundNextIndex){
      if ((index) === attendees.length) {
        index = 0;
      }
      if (!attendees[index].dead) {
        foundNextIndex = true;
        nextIndex = index;
      } else {
        index++;
      }
    }

    // If you pick a Number equal OR less than the currentNumber  => THEN => the CountOfNumber should be higher than the currentCountOfDices
    if(!isAssumeValid()){
      console.log('Ghaalte')
      return;
    }

    let allUpdatesSucceeed : boolean = true;

    // Disable turn for the current turning player
    const playerTurnToFalse : boolean = await safelyUpdateDoc(doc(db, "rooms", currentRoom.id, "attendees", attendees[currentRoom.turningPlayerIndex].id), {
      turn: false
    });
    if(!playerTurnToFalse){
      console.log("Fialed to update turn to false for Attendee")
      allUpdatesSucceeed = false;
    }

    const assumeAndIndexUpdated : boolean = await safelyUpdateDoc(doc(db, "rooms", currentRoom.id), {
      currentAssume: {currentCountOfDices, currentNumber},
      turningPlayerIndex: nextIndex
    });
    if(!assumeAndIndexUpdated){
      console.log("Fialed to update currentAssume & turningPlayerIndex for Room")
      allUpdatesSucceeed = false;
    }

    // Enable turn for the next player
    const playerTurnToTrue : boolean = await safelyUpdateDoc(doc(db, "rooms", currentRoom.id, "attendees", attendees[nextIndex].id), {
      turn: true
    });
    if(!playerTurnToTrue){
      console.log("Fialed to update turn to true for Attendee")
      allUpdatesSucceeed = false;
    }

    // If all the updates went smoothly then log the correct text
    if (allUpdatesSucceeed) {
      console.log("Update succeeded");
      setCurrentCountOfDices(0);
      setCurrentNumber(null)
    } else {
      console.log("One of or more updates have failed. Check logs.");
    }
  }

  // const bullshitHandler = async (): Promise<void> => {
  //   const countOfTheCurrentNumber : number = attendees
  //     .flatMap((attendee: Attendee) => attendee.dices)
  //     .filter((dice: number) => dice === currentRoom?.currentAssume?.currentNumber)
  //     .length;
  //   console.log("actuallCount")
  //   console.log(countOfTheCurrentNumber)
  // }
  const playerWhoWillLoseDice = (inquirySubmitterIndex : number): Attendee => {
    return inquirySubmitterIndex === 0 ? attendees[attendees.length - 1] : attendees[inquirySubmitterIndex - 1];
  }
  const bullshitHandler = async (): Promise<void> => {
    const countAlive : number = attendees.reduce((count, attendee) => attendee.dead ? count : count + 1, 0);
    const onlyTwoAlivePlayers : boolean = countAlive === 2;
    /** countOfTheCurrentNumber is the total count of the current assumed number **/
    const countOfTheCurrentNumber: number = attendees
      .flatMap((attendee: Attendee) => !attendee.dead ? attendee.dices : [])
      .filter((dice: number) => dice === currentRoom?.currentAssume?.currentNumber)
      .length;
    //
    /** Finding index of the player who clicked the BULLSHIT button and submitted an inquiry **/
    const inquirySubmitterIndex: number = currentRoom.turningPlayerIndex;
    //
    /** TRUE Statement : IF countOfTheCurrentNumber was equal to the currentCountOfDices stored in assume -> room then it has been true statement **/
    if (countOfTheCurrentNumber >= currentRoom!.currentAssume.currentCountOfDices) {
      console.log('TRUE STATEMENT')
      /** RETURN if there is a winner **/
      if((attendees[inquirySubmitterIndex].dices.length === 1) && onlyTwoAlivePlayers) {
        console.log('MIAD INTO')
        const theWinner = attendees.find((attendee, index) => !attendee.dead && index !== inquirySubmitterIndex);
        console.log(theWinner)
        if(theWinner){
          await safelyUpdateDoc(doc(db,"rooms", currentRoom!.id), {
            winner: theWinner.id
          })
          return;
        }

      }
      //
      // InquerySubmitter loses ONE DICE but keeps the TURN
      await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendees[inquirySubmitterIndex].id), {
        dices: attendees[inquirySubmitterIndex].dices.slice(0, -1)
      })
      //
      // Shows a message that it was True statement
      setBigAlert({
        show: true,
        heading: "TRUE STATEMENT",
        text: attendees[inquirySubmitterIndex].displayName + " lost a dice"
      });
      setTimeout((): void => {
        setBigAlert({
          ...bigAlert,
          show: false,
        });
      }, 2000)
    } else {
      console.log('BULLSHIT')
      /** Otherwise BULLSHIT **/
      // Finding player who assumed a Bullshit
      const thePlayerWhoWillLoseDice: Attendee = playerWhoWillLoseDice(inquirySubmitterIndex);
       /** RETURN if there is a winner **/
      if((thePlayerWhoWillLoseDice.dices.length === 1) && onlyTwoAlivePlayers) {
        await safelyUpdateDoc(doc(db,"rooms", currentRoom!.id), {
          winner: attendees[inquirySubmitterIndex].id
        })
        return;
      }
    //
      /** OTHERWISE : Remove one dice from the bullshitter **/
      setBigAlert({
        show: true,
        heading: "BULLSHIT",
        text: thePlayerWhoWillLoseDice.displayName + " lost a dice"
      });
      setTimeout((): void => {
        setBigAlert({
          ...bigAlert,
          show: false,
        });
      }, 2000)
    //
      // const updatedLocalAttendees: Attendee[] = attendees.map((attendee: Attendee) => {
      //   return attendee.id === thePlayerWhoWillLoseDice.id ?
      //     {
      //       ...attendee,
      //       dices: thePlayerWhoWillLoseDice.dices.slice(0, -1),
      //       dead: thePlayerWhoWillLoseDice.dices.length === 1 && true,
      //     } :
      //     {...attendee}
      // })
    //
      /** Remove dice from Bullshitter and give them the turn ONLY if they have more than ONE dice **/
      if(thePlayerWhoWillLoseDice.dices.length > 1){
        // Give bullshitter turn and remove one dice
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", thePlayerWhoWillLoseDice.id), {
          turn: true,
          dices: thePlayerWhoWillLoseDice.dices.slice(0, -1)
        })
        // Remove Turn from current turned player
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendees[inquirySubmitterIndex].id), {
          turn: false
        })
        // Get the index of Bullshitter to update room turningPlayerIndex
        const indexOfBullshitter : number = attendees.findIndex((att: Attendee) => att.id === thePlayerWhoWillLoseDice.id);
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id), {
          turningPlayerIndex: indexOfBullshitter
        })
      } else if (thePlayerWhoWillLoseDice.dices.length === 1) {
        /** Otherwise it is Bullshitters LAST dice and he will be DEAD and ALSO turn goes to the InquirySubmitter **/
        // Kill the bullshitter since it was their last dice
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", thePlayerWhoWillLoseDice.id), {
          dead: true,
          turn: false
        })
        // Since Bullshitter is DEAD now the InquerySubmitter should Assume
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendees[inquirySubmitterIndex].id), {
          turn: true
        })
      }
    }
    //
    setTimeout(async () => {
      // Remove CURRENT ASSUME | Everyone should start throwong dice now
      for (const attendee of attendees) {
        await safelyUpdateDoc(doc(db, "rooms", currentRoom!.id, "attendees", attendee.id), {
          diceThrowing: true
        })
      }
    }, 4000)

    await safelyUpdateDoc(doc(db,"rooms", currentRoom!.id), {
      currentAssume: null
    })
  }

  return (
    <>
      {currentAttendee?.turn ? (
          <div className="mx-auto">
            <div className="gap-1 text-center flex mb-3">
              { currentRoom.currentAssume && (
              <div className="">
                <button type="button" className="bg-violet-800 text-white px-3 py-1.5 rounded" onClick={() => bullshitHandler()}>
                  Bull Shit
                </button>
              </div>
              )}
              {/*{ (currentCountOfDices !== 0 && currentNumber) && (*/}
                <button disabled={currentCountOfDices === 0} onClick={() => assumeHandler()} type="button" className={`px-3 py-1.5 rounded ${(currentCountOfDices !== 0) ? 'bg-violet-800 text-white' : 'bg-gray-300 text-gray-500'}`}>
                  Assume {currentCountOfDices} x {currentNumber}
                </button>
              {/*)}*/}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {diceImages.map((dice, index) => (
                <img className="w-14 h-14" key={index} src={dice} alt="dice" onClick={() => tapDiceHandler(index)}/>
              ))}
            </div>



          </div>
      ) : (
        <>
          <div className=" mx-auto">
            It is not your turn yet
          </div>
        </>
      )}
      {bigAlert && bigAlert.show && (
        <BigAlert bigAlert={bigAlert} />
      )}
    </>
  )
};
export default AssumeBox;