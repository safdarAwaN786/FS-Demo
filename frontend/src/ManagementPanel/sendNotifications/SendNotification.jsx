import style from './SendNotification.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { FaMinus } from 'react-icons/fa';
import { setLoading } from '../../redux/slices/loading';


function SendNotification() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [participants, setParticipants] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const alertManager = () => {
        setalert(!alert)
    }

    const userToken = Cookies.get('userToken');
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get('/get-all-participants', { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            {
                setParticipants(res.data.data);
                dispatch(setLoading(false))
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    useEffect(() => {
        setDataToSend({ ...dataToSend, Participants: selectedParticipants })
    }, [selectedParticipants])

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])
    const [Agenda, setAgenda] = useState([]);





    const addAgenda = () => {
        const updatedAgenda = [...Agenda];
        updatedAgenda.push({});
        setAgenda(updatedAgenda);

    };
    const clearLastAgenda = () => {
        if (Agenda.length > 0) {
            const updatedAgenda = [...Agenda];
            updatedAgenda.pop(); // Remove the last element
            setAgenda(updatedAgenda);
        }
    };

    const updateAgenda = (event, index) => {
        const updatedAgenda = [...Agenda];

        // Update the existing object at the specified index
        updatedAgenda[index][event.target.name] = event.target.value;

        setAgenda(updatedAgenda);
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, Agendas: Agenda });
    }, [Agenda])


    const makeRequest = () => {

        if (dataToSend.Participants.length > 0) {
            dispatch(setLoading(true))
            axios.post("/create-notification", dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                console.log("request made !");
                setDataToSend(null);
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Send Notification' }))
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
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
                text: 'Kindly Select at least one Participant !',
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
                                dispatch(updateTabData({ ...tabData, Tab: 'Send Notification' }))
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
                            Send Notification
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();

                        alertManager();


                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>

                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.Venue} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Venue' className='text-dark' type='text' placeholder='Venue' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.Date} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Date' className='text-dark' type='date' placeholder='Date' required />
                                        </div>
                                    </div>
                                    <div className='bg-white w-75 p-3'>
                                        <div className={style.para}>
                                            <p className='my-2'>Select Members</p>
                                        </div>
                                        <div className='d-flex flex-column'>
                                            {participants?.map((participant) => {
                                                return (

                                                    <div className='d-flex flex-row my-1'>
                                                        <input onChange={(e) => {
                                                            var updatedParticipants = [...selectedParticipants];

                                                            if (e.target.checked) {
                                                                updatedParticipants.push(participant._id);

                                                            } else {
                                                                updatedParticipants = selectedParticipants.filter((id) => {
                                                                    return (

                                                                        id !== participant._id
                                                                    )
                                                                });
                                                            }
                                                            setSelectedParticipants(updatedParticipants);
                                                        }} type='checkbox' />
                                                        <p className='mx-2'>{participant.Name}</p>
                                                    </div>
                                                )
                                            })}

                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.MRMNo} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='MRMNo' className='text-dark' type='number' placeholder='MRM#' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.Time} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Time' className='text-dark' type='time' required />
                                        </div>
                                    </div>



                                </div>
                            </div>
                                {Agenda?.map((agenda, index) => {
                                    return (

                                        <div className='bg-white py-4   m-lg-5 m-2 p-3 '>
                                            <div className='d-flex justify-content-center'>

                                                <div className='mx-lg-4 mx-md-3 mx-2'>
                                                    <input value={agenda.Name} onChange={(event) => {
                                                        updateAgenda(event, index)
                                                    }} name='Name' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Agenda Name' required />
                                                    <textarea value={agenda.Description} onChange={(event) => {
                                                        updateAgenda(event, index)
                                                    }} name='Description' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Agenda Description' />

                                                </div>

                                            </div>

                                        </div>
                                    )
                                })}

                                <div className='d-flex justify-content-center p-5'>

                                    <a onClick={addAgenda} className='btn btn-outline-danger py-2 fs-4 w-50'>Add Agenda</a>
                                    {Agenda?.length > 0 && (

                                        <a style={{
                                            borderRadius: '100px',
                                            width: '40px',
                                            height: '40px',

                                        }} onClick={clearLastAgenda} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                    )}
                                </div>





                        </div>


                        <div className={style.btn}>
                            <button type='submit' >Save</button>
                            {/* <a className='btn btn-outline-danger p-3 m-2' >Send Email</a> */}
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

export default SendNotification
