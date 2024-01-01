import style from './ReportsList.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2';
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setLoading } from '../../redux/slices/loading';

function ReportsList() {
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [reports, setReports] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess)
    const user = useSelector(state => state.auth?.user);
    const formatDate = (date) => {

        const newDate = new Date(date);
        const formatDate = newDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return formatDate;
    }
    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readReportByAuditId/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            setReports(response.data.data)
            dispatch(setLoading(false))
            if (response.data.data == undefined) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Report is not Created for this Audit yet!',
                    confirmButtonText: 'OK.'
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Non-Conformity Report' }))
                    }
                })
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
   


    return (
        <>
            <div className={style.subparent}>
                <div className='mx-lg-5 px-2 mx-md-4 mx-2 mt-5 mb-1 '>
                    <BsArrowLeftCircle onClick={(e) => {
                        dispatch(updateTabData({ ...tabData, Tab: 'Non-Conformity Report' }))
                    }} className='fs-3 text-danger mx-1' role='button' />
                </div>
                <div className={`${style.headers} mt-0`}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Reports List
                    </div>
                </div>
                <div className={style.tableParent}>
                    <table className={style.table}>
                        <tr className={style.tableHeader}>
                            <th>Report Date</th>
                            <th>Report By</th>
                            <th>Report Data</th>
                            <th>Corrective Action</th>
                        </tr>
                        {
                            reports?.map((report, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{formatDate(report?.ReportDate)}</td>
                                        <td>{report?.ReportBy}</td>
                                        <td><button className={style.btn} onClick={() => {
                                            dispatch(updateTabData({ ...tabData, Tab: 'viewReport' }))
                                            dispatch(changeId(report._id));
                                        }}>View Report</button></td>
                                        <td><button className={style.btn} onClick={() => {
                                            dispatch(updateTabData({ ...tabData, Tab: 'viewReportActions' }))
                                            dispatch(changeId(report._id));
                                        }}>View Actions</button></td>
                                    </tr>
                                )
                            })
                        }
                    </table>
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

export default ReportsList