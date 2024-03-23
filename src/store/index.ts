import {configureStore} from "@reduxjs/toolkit";
import roomSlice from "./room.ts"
import authenticationSlice from "./authentication.ts";
import attendeeSlice from "./attendee.ts";
const store = configureStore({
  reducer : {
    room: roomSlice,
    authentication: authenticationSlice,
    attendee: attendeeSlice
  }
})
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default  store;