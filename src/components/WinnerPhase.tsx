import {useEffect, useState} from "react";
import {Attendee, RoomInterface} from "../interfaces";
interface WinnerPhaseProps {
  currentRoom: RoomInterface,
  attendees: Attendee[]
}
const WinnerPhase = ({currentRoom, attendees}: WinnerPhaseProps) => {
  const [winner, setWinner] = useState<Attendee | null>(null)
  useEffect(() : void => {
    const foundWinner : Attendee | undefined = attendees.find((attendee: Attendee) => attendee.id === currentRoom?.winner);
    foundWinner && setWinner(foundWinner);
  }, [currentRoom, attendees])
  return (
    <>
      <div className="text-center">
        <div>The winner is</div>
        <div className="text-3xl text-rose-600">
          {winner?.displayName}
        </div>
      </div>
    </>
  )
}

export default WinnerPhase;