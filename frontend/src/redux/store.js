import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tabReducer from './slices/tabSlice';
import idReducer from './slices/idToProcessSlice'
import appDataReducer from './slices/appSlice';
import loadingReducer, { smallLoadingReducer } from './slices/loading'

export const store = configureStore({
    reducer : {
        auth : authReducer,
        tab : tabReducer,
        idToProcess : idReducer,
        appData : appDataReducer,
        loading : loadingReducer,
        smallLoading : smallLoadingReducer
    }
})