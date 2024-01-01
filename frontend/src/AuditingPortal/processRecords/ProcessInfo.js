import style from './ProcessInfo.module.css'
import clock from '../../assets/images/viewtrainings/Clock.svg'
import star from '../../assets/images/viewtrainings/Star.svg'
import mos from '../../assets/images/viewtrainings/mos.svg'
import copy from '../../assets/images/employeeProfile/CopyP.svg'
import calender from '../../assets/images/employeeProfile/Calendar.svg'
import office from '../../assets/images/employeeProfile/Office.svg'
import cnic from '../../assets/images/employeeProfile/UserCard.svg'
import { useEffect, useState } from 'react'
import { BsArrowLeftCircle } from 'react-icons/bs'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function ProcessInfo() {
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const [planData, setPlanData] = useState(null);
    const [popUpData, setPopUpData] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const planId = idToWatch;

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyAuditPlanById/${planId}`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            console.log(response.data.data);
            setPlanData(response.data.data);
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

    
    return (
        <>
            <div className={style.subparent}>
                <div className='d-flex flex-row px-4'>
                    <BsArrowLeftCircle role='button' className='fs-4 mt-1 text-danger' onClick={(e)=>{{
                        dispatch(updateTabData({...tabData, Tab : 'Process Records'}))
                    }}} />
                    <p className={`${style.headingtxt} mx-0 ms-3`}>{planData?.ProcessOwner?.ProcessName}</p>
                </div>
                <div className={`${style.cardParent} mb-4 pb-5`}>
                    <div className={style.card1headers}>
                        <div>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div>
                            <p>Info</p>
                        </div>
                    </div>
                    <div className={style.cardbody}>
                        <div className={style.sec1} >
                            <div>
                                <img src={calender} alt="" />
                                <div>
                                    <p className={style.card1para}>Plan Year</p>
                                    <p className={style.card1para2}>{planData?.Year}</p>
                                </div>
                            </div>
                            <div>
                                <img src={calender} alt="" />
                                <div>
                                    <p className={style.card1para}>Actual Date</p>
                                    {planData?.AuditResultStatus == 'Conducted' ?
                                        (
                                            <p className={style.card1para2}>{planData?.ActualDate}</p>
                                        ) : (
                                            <p className={`${style.card1para2} text-primary`}>Pending</p>
                                        )}
                                </div>
                            </div>
                            <div>
                                <img src={star} alt="" />
                                <div>
                                    <p className={style.card1para}>Month</p>
                                    <p className={style.card1para2}>{planData?.Month}</p>
                                </div>
                            </div>
                            <div>
                                <img src={clock} alt="" />
                                <div>
                                    <p className={style.card1para}>Date</p>
                                    <p className={style.card1para2}>{planData?.Date}</p>
                                </div>
                            </div>
                            <div>
                                <img src={copy} alt="" />
                                <div>
                                    <p className={style.card1para}>Risk assesment</p>
                                    <p className={style.card1para2}>{planData?.ProcessOwner.ProcessRiskAssessment}</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Team Auditor</p>
                                    <p className={style.card1para2}>{planData?.TeamAuditor?.Name}</p>
                                </div>
                            </div>
                        </div>
                        <div className={style.sec2} >
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Special Instructions</p>
                                    <p onClick={() => {
                                        setPopUpData(planData?.ProcessOwner.SpecialInstructions);
                                        alertManager();
                                    }} className={style.redbtntxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Shift Breaks</p>
                                    <p onClick={() => {
                                        setPopUpData(planData?.ProcessOwner.ShiftBreaks);
                                        alertManager();
                                    }} className={style.redbtntxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Activities</p>
                                    <p onClick={() => {
                                        setPopUpData(planData?.ProcessOwner.Activities);
                                        alertManager();
                                    }} className={style.redbtntxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={cnic} alt="" />
                                <div>
                                    <p className={style.card1para}>Critical Areas</p>
                                    <p onClick={() => {
                                        setPopUpData(planData?.ProcessOwner.CriticalAreas);
                                        alertManager();
                                    }} className={style.redbtntxt}>View</p>
                                </div>
                            </div>
                            <div>
                                <img src={office} alt="" />
                                <div>
                                    <p className={style.card1para}>Process Owner</p>
                                    <p className={style.card1para2}>{planData?.ProcessOwner?.ProcessOwner?.Name}</p>
                                </div>
                            </div>
                            <div>
                                <img src={office} alt="" />
                                <div>
                                    <p className={style.card1para}>Lead Auditor</p>
                                    <p className={style.card1para2}>{planData?.LeadAuditor?.Name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
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

export default ProcessInfo
