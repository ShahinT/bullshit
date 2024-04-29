import {Attendee} from "../interfaces";
import dDice from "../assets/dice-3d.jpg";
import TheBUllShitterImage from "../assets/dead-bull-2.png"
interface AttendeesListProps {
  attendees: Attendee[],
  currentAttendee: Attendee | null
}
const AttendeesList = ({attendees, currentAttendee}: AttendeesListProps) => {
  return (
    <>
      <div className="flex gap-3">
        {attendees.map((attendee: Attendee) => (
          <div  className={`p-7 rounded-xl flex justify-center items-center w-44 h-60 ${attendee.turn ? "border-4 border-amber-500" : "border-4 border-gray-200"}`}key={attendee.id}>
            <div
              >
              <div className="mb-3">{attendee.displayName}</div>
              <div>
                {attendee.dead ? (
                  <div className=" ">
                    <img alt="profile-image" src={TheBUllShitterImage}/>
                  </div>
                ) : (
                  <img alt="profile-image" className="w-56" src={attendee.photoURL}/>
                )}
                {!attendee.dead ? (
                  <div className="mt-2 h-8 flex">
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
                ) : (<div className="h-8 mt-2 flex items-center justify-center">BULLSHITTER</div>)}
              </div>

            </div>
          </div>
        ))}
      </div>
    </>
  )
}
export default AttendeesList;