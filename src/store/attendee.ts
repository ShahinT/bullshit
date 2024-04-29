import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Attendee, User} from "../interfaces";

interface AttendeeState {
  currentAttendee: Attendee | null;
  attendees: Attendee[]
}

const initialState: AttendeeState  = {
  currentAttendee: null,
  attendees: [],
}

interface FetchAttendeesPayload {
  attendees: Attendee[],
  currentUser: User | null
}
const attendeeSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    fetchAttendees: (state, action: PayloadAction<FetchAttendeesPayload>) : void => {
      const currentUser : User | null = action.payload.currentUser;
      if(!currentUser) {
        console.error("Current User not found")
        return;
      }
      state.attendees = action.payload.attendees;
      const foundAttendee : Attendee | undefined = state.attendees.find((attendee: Attendee) => attendee.id === currentUser.uid);
      state.currentAttendee = foundAttendee !== undefined ? foundAttendee : null;
    },
  },
})

export const attendeeActions = attendeeSlice.actions;
export default attendeeSlice.reducer;