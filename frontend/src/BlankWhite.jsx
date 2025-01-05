import axios from 'axios';
import style from './MainPage.module.css'
import React, { useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie'
import { logInUser } from './redux/slices/authSlice';
import {  ScaleLoader } from 'react-spinners'

export default function BlankScreen() {


    const loggedIn = useSelector(state => state.auth.loggedIn)
    const dispatch = useDispatch();

    const navigate = useNavigate()
    useEffect(() => {
        const userToken = Cookies.get('userToken');
        if (loggedIn) {
            navigate('/quality-and-maintenance')
        } 
        if (userToken) {
           axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, { headers: { Authorization: `Bearer ${userToken}` } }).then(response => {
                dispatch(logInUser(response.data.data));
            }).catch(error => {
                navigate('/login')
            });
        } else {
            navigate('/login')
        }
    }, []);

    useEffect(() => {
        const userToken = Cookies.get('userToken');
        if (loggedIn) {
            navigate('/quality-and-maintenance')
        } 
        if (userToken) {
            axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-user`, { headers: { Authorization: `Bearer ${userToken}` } }).then(response => {
                dispatch(logInUser(response.data.data));
            }).catch(error => {
                navigate('/login')
            });
        } else {
            navigate('/login')
        }
    }, [loggedIn]);


    return (
        <>
       
            <div className={style.loaderContainer}>
                <div className={style.loaderInner}>
                    <ScaleLoader
                        color="#eb5757"
                        cssOverride={{}}
                        height={35}
                        loading
                        margin={2}
                        radius={5}
                        width={8}
                    />
                </div>
            </div>
       
        </>
    )
}
