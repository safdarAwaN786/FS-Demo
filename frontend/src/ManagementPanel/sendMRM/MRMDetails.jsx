import style from './SendMRM.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';


function MRMDetails() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`/get-mrmbyId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            {
                setDataToSend(res.data.data);
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
        console.log(dataToSend);
    }, [dataToSend])

    const formatDate = (date) => {
        const newDate = new Date(date);
        if (isNaN(newDate)) {
            return "";
        }
        const formattedDate = newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formattedDate;
    };


    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row px-lg-5 mx-lg-5 px-2 mx-2 my-1'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Generate MRM' }))
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
                            MRM Details
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
                                    <select value={dataToSend?.Notification?.MRMNo} name='Notification' className='w-100' readOnly required>
                                        <option value={dataToSend?.Notification?.MRMNo} selected disabled>{dataToSend?.Notification?.MRMNo}</option>

                                    </select>
                                </div>
                            </div>
                            {dataToSend?.AgendaDetails?.map((agendaObj, index) => {
                                return (
                                    <div className={`${style.formDivider} border border-opacity-25 my-3 py-2 border-2 border-dark`}>
                                        <div className={style.sec1}>
                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily: "Poppins"
                                                }} className='fw-bold'>Agenda Name</p></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <input style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Agenda?.Name} name='Agenda' className='text-dark w-100 border-0 p-2' placeholder='Agenda Points' required readOnly />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div className={style.para}>
                                                    <p style={{
                                                        fontFamily: "Poppins"
                                                    }} className='fw-bold'>Target Date</p>
                                                </div>
                                                <div >
                                                    <input value={formatDate(agendaObj?.TargetDate)} name='TargetDate' className='text-dark' type='text' required readOnly />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily: "Poppins"
                                                }} className='fw-bold'>Responsibilities</p></div>

                                                <div className='bg-light mt-4 my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Responsibilities} name='Responsibilities' className='text-dark w-100 border-0 p-2' placeholder='Responsibilities' required readOnly />
                                                </div>
                                            </div>


                                        </div>
                                        <div className={style.sec2}>

                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily: "Poppins"
                                                }} className='fw-bold'>Agenda Description</p></div>

                                                <div className='bg-light my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Agenda.Description} name='Agenda' className='text-dark mt-5 w-100 border-0 p-2' placeholder='Agenda Points' required readOnly />
                                                </div>
                                            </div>
                                            <div className={style.inputParent}>
                                                <div><p style={{
                                                    fontFamily: "Poppins"
                                                }} className='fw-bold'>Discussion</p></div>

                                                <div className='bg-light mt-4 my-3 p-0'>
                                                    <textarea style={{
                                                        fontFamily: 'Poppins'
                                                    }} rows={4} value={agendaObj?.Discussion} name='Discussion' className='text-dark w-100 border-0 p-2' placeholder='Discussion' required readOnly />
                                                </div>
                                            </div>
                                            <div className='bg-white w-75 p-3'>
                                                <div className={style.para}>
                                                    <p className='my-2'> Members</p>
                                                </div>
                                                <div className='d-flex flex-column'>
                                                    {agendaObj.Participants?.map((participant) => {
                                                        return (
                                                            <div className='d-flex flex-row my-1'>
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default MRMDetails
