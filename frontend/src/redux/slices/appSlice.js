import { createSlice } from "@reduxjs/toolkit";

const initialAppdata =  {
    personFormData : null,
    monthName : null,
    dateType : null,
    callibrationType :  null,
}


const appDataSlice = createSlice({
    name : 'appData',
    initialState : initialAppdata,
    reducers : {
        updatePersonFormData : (state, action)=>{
            state.personFormData =  action.payload;
        },
        changeMonthName : (state, action)=>{
            state.monthName = action.payload;
        },
        changeDateType : (state, action)=>{
            state.dateType = action.payload;
        },
        changeCallibrationType : (state, action)=>{
            state.callibrationType =  action.payload
        }
    }
})

export default appDataSlice.reducer;

export const {updatePersonFormData, changeMonthName, changeDateType, changeCallibrationType} = appDataSlice.actions;