import { createSlice } from "@reduxjs/toolkit";

const initialTabData = null;

export const tabSlice = createSlice({
    name : 'tabData',
    initialState : initialTabData,
    reducers : {
        updateTabData : (state, action)=>{
            return action.payload;
        }
    }
});

export default tabSlice.reducer;
export const {updateTabData} = tabSlice.actions;