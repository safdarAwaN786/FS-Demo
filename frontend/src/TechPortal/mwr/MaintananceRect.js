import style from './MaintananceRect.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function MaintananceRect() {
    const [alert, setAlert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const [requests, setRequests] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getWorkRequestsByMachineId/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setRequests(res.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })

    }, [])


    const formattedTime = (dateString) => {
        console.log(dateString);

        if (dateString) {

            // Convert the date string to a Date object
            const dateObj = new Date(dateString);

            // Get the hours from the Date object
            const hours = dateObj.getHours();

            // Convert hours to AM/PM format
            const amPmHours = hours % 12 === 0 ? 12 : hours % 12;
            const amPm = hours < 12 ? 'AM' : 'PM';

            // Construct the final string
            const formattedTime = `${amPmHours}:${dateObj.getMinutes().toString().padStart(2, '0')} ${amPm}`;

            return formattedTime;
        } else {
            return ("---")
        }
    }

    return (
        <>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Machinery'}));
                        }
                    }} />

                </div>
                <div className={`${style.headers} mt-1 `}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Maintainance Record
                    </div>

                </div>

                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>MWR ID</th>
                            <th>Machine Id</th>
                            <th>Time</th>
                            <th>Date</th>
                            <th>Area</th>
                            <th>Priority</th>
                            <th>Discipline</th>
                            <th>Reason of Pending</th>
                            <th>JobAssign</th>
                            <th>Designation</th>
                            <th>Detail</th>
                        </tr>
                        {
                            requests?.map((request, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{request.MWRId}</td>
                                        <td>{request.Machinery.machineCode}</td>
                                        <td>{formattedTime(request.Time)}</td>
                                        <td>{request.Date.slice(0, 10).split('-')[2]}/{request.Date.slice(0, 10).split('-')[1]}/{request.Date.slice(0, 10).split('-')[0]}</td>
                                        <td>{request.Area}</td>
                                        <td>{request.Priority}</td>
                                        <td ><button onClick={() => {
                                            setPopUpData(`${request.Discipline[0]}, ${request.Discipline[1]}, ${request.Discipline[2]}`);
                                            setAlert(true);
                                        }} className={style.btn}>View</button></td>
                                        <td ><button onClick={() => {
                                            if (request.Status === 'Rejected') {
                                                setPopUpData(request.Reason);
                                                setAlert(true);
                                            } else {
                                                setPopUpData('Job Request is not Rejected');
                                                setAlert(true);
                                            }
                                        }} className={style.btn}>View</button></td>
                                        <td ><button onClick={() => {
                                            if (request.Status === 'Approved' || request.Status === 'Completed') {
                                                setPopUpData(request.JobAssigned);
                                                setAlert(true);
                                            } else {
                                                setPopUpData('Job Request is not Approved');
                                                setAlert(true);
                                            }
                                        }} className={style.btn}>View</button></td>
                                        <td ><button onClick={() => {
                                            if (request.Status === 'Approved' || request.Status === 'Completed') {
                                                setPopUpData(request.Designation);
                                                setAlert(true);
                                            } else {
                                                setPopUpData('Job Request is not Approved');
                                                setAlert(true);
                                            }
                                        }} className={style.btn}>View</button></td>
                                        <td ><button onClick={() => {
                                            if (request.Status === 'Approved' || request.Status === 'Completed') {
                                                setPopUpData(request.DetailOfWork);
                                                setAlert(true);
                                            } else {
                                                setPopUpData('Job Request is not Approved');
                                                setAlert(true);
                                            }
                                        }} className={style.btn}>View</button></td>


                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
                {/* <div className={style.btnparent}>
                    <button className={style.download}>Download</button>
                </div> */}


            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setAlert(false);
                                }} className={style.btn2}>Close</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default MaintananceRect
