import style from './SendMRM.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function SendMRM() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [notifications, setNotifications] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [agendasArr, setAgendasArr] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-notifications`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            {
                setNotifications(res.data.data);
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])


    useEffect(() => {
        const fetchData = async () => {
            if (dataToSend?.Notification) {
                const choosenNotification = notifications.find(notif => notif._id === dataToSend.Notification);
                setSelectedNotification(choosenNotification);
                const agendasToSet = await Promise.all(choosenNotification.Agendas.map(async (agendaObj) => {
                    return { ...agendaObj, Agenda: agendaObj._id };
                }));
                setAgendasArr(agendasToSet);
            }
        };
    
        fetchData(); // Call the asynchronous function
    }, [dataToSend?.Notification])

    const updateAgendasArr = (event, index) => {
        const updatedAgendas = [...agendasArr];

        // Update the existing object at the specified index
        updatedAgendas[index][event.target.name] = event.target.value;
        setAgendasArr(updatedAgendas);
    }

    useEffect(() => {
        if (agendasArr) {
            setDataToSend({ ...dataToSend, AgendaDetails: agendasArr });
        }
    }, [agendasArr])

    const makeRequest = () => {

        if (dataToSend) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-mrm`, dataToSend, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                console.log("request made !");
                setDataToSend(null);
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Minutes of Meeting' }));
                    }
                })

            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon : 'error',
                    title : 'OOps..',
                    text : 'Something went wrong, Try Again!'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Fill all Data!',
                confirmButtonText: 'OK.'
            })
        }
    }

    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row px-lg-5 mx-lg-5 px-2 mx-2 my-1'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Minutes of Meeting' }))
                            }
                        }} />

                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Send MRM
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();

                        alertManager();


                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                            <div className={`${style.inputParent} w-50 p-3`}>
                                <div className={style.para}>
                                    {/* <p>Document Type</p> */}
                                </div>
                                <div >
                                    <select onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                    }} name='Notification' className='w-100 form-select  form-select-lg' required>
                                        <option value='' selected disabled>MRM #</option>
                                        {notifications?.map((notif) => {
                                            return (
                                                <option value={notif._id}>{notif.MRMNo}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            {dataToSend?.AgendaDetails?.map((agendaObj, index) => {
                                return (
                                    <div className={`${style.formDivider} border border-opacity-25 my-3 py-2 border-2 border-dark`}>
                                        <div className={style.sec1}>
                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily : "Poppins"
                                                }} className='fw-bold'>Agenda Name</p></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <input autoComplete='off' style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Name} name='Agenda' className='text-dark w-100 border-0 p-2' placeholder='Agenda Points' required readOnly />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div className={style.para}>
                                                    {/* <p>Document Type</p> */}
                                                </div>
                                                <div >
                                                    <input autoComplete='off' value={agendaObj?.TargetDate} onChange={(e) => {
                                                        updateAgendasArr(e, index)
                                                    }} name='TargetDate' className='text-dark' type='date' required />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Responsibilities} onChange={(e) => {
                                                        updateAgendasArr(e, index)
                                                    }} name='Responsibilities' className='text-dark w-100 border-0 p-2' placeholder='Responsibilities' required />
                                                </div>
                                            </div>


                                        </div>
                                        <div className={style.sec2}>

                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily : "Poppins"
                                                }} className='fw-bold'>Agenda Description</p></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Description} name='Agenda' className='text-dark mt-5 w-100 border-0 p-2' placeholder='Agenda Points' required readOnly />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Discussion} onChange={(e) => {
                                                        updateAgendasArr(e, index)
                                                    }} name='Discussion' className='text-dark w-100 border-0 p-2' placeholder='Discussion' required />
                                                </div>
                                            </div>
                                            <div className='bg-white w-75 p-3'>
                                                <div className={style.para}>
                                                    <p className='my-2'>Select Members</p>
                                                </div>
                                                <div className='d-flex flex-column'>
                                                    {selectedNotification.Participants?.map((participant) => {
                                                        return (
                                                            <div className='d-flex flex-row my-1'>
                                                                <input autoComplete='off' onChange={(e) => {
                                                                    let updatedParticipants;
                                                                    if (agendaObj.Participants) {
                                                                        updatedParticipants = [...agendaObj?.Participants]
                                                                    } else {
                                                                        updatedParticipants = [];
                                                                    }
                                                                    if (e.target.checked) {
                                                                        updatedParticipants.push(participant._id);

                                                                    } else {
                                                                        updatedParticipants = updatedParticipants.filter((id) => {
                                                                            return (
                                                                                id !== participant._id
                                                                            )
                                                                        });
                                                                    }
                                                                    const updatedAgendas = [...agendasArr];

                                                                    // Update the existing object at the specified index
                                                                    updatedAgendas[index].Participants = updatedParticipants;
                                                                    setAgendasArr(updatedAgendas);
                                                                }} type='checkbox' />
                                                                <p className='mx-2'>{participant.Name}</p>
                                                            </div>
                                                        )
                                                    })}

                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                )
                            })}






                        </div>


                        <div className={style.btn}>
                            <button type='submit' >Save</button>

                        </div>
                    </form>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }} className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default SendMRM
