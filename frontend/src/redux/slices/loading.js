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

const smallLoadingSlice = createSlice({
    name : 'smallLoading',
    initialState : false,
    reducers : {
        setSmallLoading : (state, action)=>{
            return action.payload;
        }
    }
})

export default loadingSlice.reducer;
export const smallLoadingReducer = smallLoadingSlice.reducer;
export const {setSmallLoading} = smallLoadingSlice.actions;
export const {setLoading} = loadingSlice.actions;