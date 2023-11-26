import { createSlice } from "@reduxjs/toolkit";


export const idSlice = createSlice({
    name : 'idToProcess',
    initialState : null,
    reducers : {
        changeId : (state, action)=>{
            return action.payload
        }
    }
});

export default idSlice.reducer;
export const {changeId} = idSlice.actions;