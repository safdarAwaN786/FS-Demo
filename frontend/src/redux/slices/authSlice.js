import { createSlice } from "@reduxjs/toolkit";


const authentication = {
    loggedIn: false,
    user: null
}

export const authSlice = createSlice({
    name: 'authentication',
    initialState: authentication,
    reducers: {
        logInUser: (state, action) => {
            state.loggedIn = true;
            state.user = action.payload
        },
        logOutUser: (state) => {
            state.loggedIn = false;
            state.user = null
        }
    }
})

export const { logInUser, logOutUser } = authSlice.actions;
export default authSlice.reducer;