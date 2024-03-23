import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {Attendee} from "../pages/Room.tsx";

interface AuthenticationState {
  currentAttendee: Attendee | null;
}

const initialState: AuthenticationState  = {
  currentAttendee: null,
}

export const setCurrentAttendee = createAsyncThunk("attendee/setCurrentAttendee", async () => {
})

const attendeeSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setCurrentAttendee.fulfilled, (state: AuthenticationState) => {
        return {
          ...state,
          currentUser: null
        }
      })
  }
})

export const authenticationActions = attendeeSlice.actions;
export default attendeeSlice.reducer;