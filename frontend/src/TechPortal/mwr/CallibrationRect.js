import style from './CallibrationRect.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function CallibrationRect() {
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [callibrationsToShow, setCallibrationsToShow] = useState(null);
    const [equipmentToShow, setEquipmentToShow] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const callibrationType = useSelector(state => state.appData.callibrationType);
    const idToWatch = useSelector(state => state.idToProcess);
    const dateType = useSelector(state => state.appData.dateType);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readCalibrationByEquipmentId/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            if (res.data.data) {
                const dataArr = res.data.data;
                setCallibrationsToShow(dataArr.filter((data) => data.dateType === dateType && data.callibrationType === callibrationType))
            }
            if(equipmentToShow){
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

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readEquipment/${idToWatch}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setEquipmentToShow(res.data.data);
            if(callibrationsToShow){
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
        console.log(callibrationsToShow);
    }, [callibrationsToShow])

    useEffect(()=>{
        if(callibrationsToShow?.length === 0){
            dispatch(setLoading(false))
            Swal.fire({
                icon : 'warning',
                title : 'OOps..',
                text : 'No Callibrations Avilable!'
            })
        }
    }, [callibrationsToShow])


    return (
        <>

            <div className={style.subparent}>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({...tabData, Tab : 'Measuring Devices'}))
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
                        Callibration Record
                    </div>

                </div>
                <div className={style.form}>
                    <div className={style.sec1}>
                        <div>
                            <p>Device Id</p>
                            <input value={equipmentToShow?.equipmentCode} type="text" />
                        </div>
                        <div>
                            <p>Device name</p>
                            <input value={equipmentToShow?.equipmentName} type="text" />
                        </div>
                        <div>
                            <p>Date type</p>
                            <input value={dateType} type="text" />
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div>
                            <p>Device location</p>
                            <input type="text" value={equipmentToShow?.equipmentLocation} />
                        </div>
                        <div>
                            <p>Device Range</p>
                            <input value={equipmentToShow?.Range} type="text" />
                        </div>
                        <div>
                            <p>Callibration type</p>
                            <input value={callibrationType} type="text" />
                        </div>
                    </div>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Callibration ID</th>
                            <th>Last Time</th>
                            <th colSpan={3}>
                                <div>Marked Readings</div>
                                <div>
                                    <p>1st</p>
                                    <p>2nd</p>
                                    <p>3rd</p>
                                </div>
                            </th>
                            <th>Next Time</th>
                            <th>Condition/Remarks</th>
                            <th>CR Initials</th>
                        </tr>
                        {
                            callibrationsToShow?.map((callibration, i) => {
                                return (
                                    <tr key={i}>
                                        <td>{callibration.callibrationCode}</td>
                                        <td>{callibration?.lastCallibrationDate.slice(0, 10).split('-')[2]}/{callibration.lastCallibrationDate.slice(0, 10).split('-')[1]}/{callibration?.lastCallibrationDate.slice(0, 10).split('-')[0]}</td>
                                        <td>{callibration.measuredReading.firstReading}</td>
                                        <td>{callibration.measuredReading.secondReading}</td>
                                        <td >{callibration.measuredReading.thirdReading}</td>
                                        <td>{callibration?.nextCallibrationDate.slice(0, 10).split('-')[2]}/{callibration.nextCallibrationDate.slice(0, 10).split('-')[1]}/{callibration?.nextCallibrationDate.slice(0, 10).split('-')[0]}</td>
                                        <td ><button onClick={() => {
                                            setPopUpData(callibration.comment);
                                            alertManager();
                                        }} className={style.btn}>View</button></td>
                                        <td>{callibration.CR}</td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
                <div className={style.btnparent}>
                    <button className={style.download} >Download</button>
                    <button className={style.next} onClick={() => {
                        dispatch(updateTabData({...tabData, Tab : 'internalExternal'}))
                    }}>Next</button>
                </div>
            </div>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>
                                <button onClick={alertManager} className={style.btn2}>OK.</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default CallibrationRect
