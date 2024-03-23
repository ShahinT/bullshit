import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {User} from "../interfaces";
import {getAuth, signOut} from "firebase/auth";

interface AuthenticationState {
  currentUser: User | null;
  users: User[] | [];

}

const initialState: AuthenticationState  = {
  currentUser: null,
  users: []
}

export const logout = createAsyncThunk("authentication/logout", async () => {
  const auth = getAuth();
  await signOut(auth);
})

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setCurrentUser(state, action){
      state.currentUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state: AuthenticationState) => {
        return {
          ...state,
          currentUser: null
        }
      })
  }
})

export const authenticationActions = authenticationSlice.actions;
export default authenticationSlice.reducer;