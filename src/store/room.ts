import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RoomInterface} from "../interfaces";
interface RoomStateTypes {
  currentRoom: RoomInterface | null
}
const initialState: RoomStateTypes = {
  currentRoom: null
}
interface FetchRoomPayload {
  currentRoom: RoomInterface
}
const roomSlice = createSlice({
  name:'room',
  initialState,
  reducers: {
    fetchCurrentRoom: (state, action: PayloadAction<FetchRoomPayload> ) : void => {
      state.currentRoom = action.payload.currentRoom;
    }
  },
});
export const roomActions = roomSlice.actions;
export default roomSlice.reducer;