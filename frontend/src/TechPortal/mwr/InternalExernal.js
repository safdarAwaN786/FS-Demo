import style from './InternalExernal.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function InternalExernal() {
    const [callibrationsToShow, setCallibrationsToShow] = useState();
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const dateType = useSelector(state => state.appData.dateType);
    const callibrationType = useSelector(state => state.appData.callibrationType);
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readCalibrationByEquipmentId/${idToWatch}`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            if (res.data.data) {
                const dataArr = res.data.data;
                setCallibrationsToShow(dataArr.filter((data) => data.dateType === dateType && data.callibrationType === callibrationType));
            }
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

    useEffect(()=>{
        if(callibrationsToShow?.length === 0){
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'warning',
                title : 'OOps..',
                text : 'No, Callibrations Available!'
            })
        }
    }, [callibrationsToShow])

    return (
        <>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'viewCallibration'}));
                        }
                    }} />

                </div>


                <div className={`${style.tableParent} mt-1 `}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th roleSpan={2}>Id</th>
                            <th colSpan={3}>
                                <div className={style.intext}>Internal</div>
                                <div>
                                    <p>Image</p>
                                    <p>Certificate</p>
                                    <p>Master callibration certificate</p>
                                </div>
                            </th>
                            <th colSpan={3}>
                                <div className={style.intext}>External</div>
                                <div>
                                    <p>Company name</p>
                                    <p>Master callibrator  reference</p>
                                    <p>Certificate</p>
                                </div>
                            </th>

                        </tr>
                        {
                            callibrationsToShow?.map((callibration, i) => {
                                return (
                                    <tr className={style.body} key={i}>
                                        <td>{callibration.callibrationCode}</td>
                                        <td> <a href={callibration?.internal?.ImageURL} target='_blank' className={`${style.btn} btn btn-outline-danger`}>View</a></td>
                                        <td><a href={callibration?.internal?.CertificateURL} target='_blank' className={`${style.btn} btn btn-outline-danger`}>View</a></td>
                                        <td ><a href={callibration?.internal?.masterCertificateURL} target='_blank' className={`${style.btn} btn btn-outline-danger`}>View</a></td>
                                        <td>{callibration.external.companyName}</td>
                                        <td >{callibration.external.masterReference}</td>
                                        <td><a href={callibration.external.exCertificateURL} target='_blank' className={`${style.btn} btn btn-outline-danger`}>View</a></td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
                <div className={style.btnparent}>
                    {/* <button className={style.download}>Download</button> */}
                    <button className={style.next} onClick={() => {
                        dispatch(updateTabData({...tabData, Tab : 'viewCallibration'}))
                    }}>Back</button>
                </div>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                        </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={alertManager} className={style.btn2}>OK.</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default InternalExernal
