
import style from './Notifications.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function Notifications() {
    const [notificationsList, setNotificationsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [showParticipants, setShowParticipants] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [participantsArr, setParticipantsArr] = useState(null);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-notifications`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setNotificationsList(response.data.data.slice(startIndex, endIndex));
            dispatch(setLoading(false))
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setNotificationsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.MRMNo.includes(event.target.value)
            )
            console.log(searchedList);
            setNotificationsList(searchedList);
        } else {
            setNotificationsList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    function convertTo12HourFormat(time24) {
        // Split the time string into hours and minutes
        const [hours, minutes] = time24.split(':').map(Number);

        // Determine whether it's AM or PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        const hours12 = hours % 12 || 12;

        // Create the 12-hour formatted time string
        const time12 = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;

        return time12;
    }




    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Notification by MRM no' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'sendNotification' }));
                        }}>
                            <img src={add} alt="" />
                            <p>Send New</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!notificationsList || notificationsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>MRM #</td>
                                <td>Venue</td>
                                <td>Date</td>
                                <td>Time</td>
                                <td>Agenda</td>
                                <td>Participants</td>

                            </tr>
                            {
                                notificationsList?.map((notification, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{notification.MRMNo}</p></td>
                                            <td className={style.simpleContent}>{notification.Venue}</td>
                                            <td>{notification.Date?.slice(0, 10).split('-')[2]}/{notification.Date?.slice(0, 10).split('-')[1]}/{notification.Date?.slice(0, 10).split('-')[0]}</td>
                                            <td>{convertTo12HourFormat(notification.Time)}</td>

                                            <td >

                                                <p onClick={() => {
                                                    setShowBox(true);
                                                    setDataToShow(notification.Agendas)
                                                }} className={style.click}>View</p>
                                            </td>
                                            <td >

                                                <p onClick={() => {
                                                    setShowParticipants(true);
                                                    setParticipantsArr(notification.Participants)

                                                }} className={style.click}>View</p>
                                            </td>


                                        </tr>

                                    )

                                })
                            }
                        </table>
                    )}
                </div>
                <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div>
            </div>




            {
                showBox && (

                    <div class={style.alertparent}>
                        <div style={{
                            overflowY : 'scroll'
                        }} class={`${style.alert} h-75 `}>
                            {dataToShow?.map((agendaObj, index) => {
                                return (
                                    <>
                                        <p className={`text-center ${style.msg} mb-0 mt-4`}><b>Agenda {index + 1}</b></p>

                                        <p class={style.msg}><b>Name : </b>{agendaObj.Name}</p>
                                        <p class={style.msg}><b>Description : </b>{agendaObj.Description}</p>

                                    </>
                                )
                            })}


                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }
            {
                showParticipants && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            {participantsArr?.map((obj) => {
                                return (
                                    <p class={style.msg}>{obj.Name}</p>
                                )
                            })}

                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setShowParticipants(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default Notifications
