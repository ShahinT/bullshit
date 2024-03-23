import {createSlice} from "@reduxjs/toolkit";
interface RoomStateTypes {
  rooms: []
}
const initialState: RoomStateTypes = {
  rooms: []
}
const roomSlice = createSlice({
  name:'room',
  initialState,
  reducers: {},
});

export default roomSlice.reducer;