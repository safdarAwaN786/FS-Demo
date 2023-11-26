import { createSlice } from "@reduxjs/toolkit";

const loadingSlice = createSlice({
    name : 'loading',
    initialState : true,
    reducers : {
        setLoading : (state, action)=>{
            return action.payload;
        }
    }
})

export default loadingSlice.reducer;
export const {setLoading} = loadingSlice.actions;