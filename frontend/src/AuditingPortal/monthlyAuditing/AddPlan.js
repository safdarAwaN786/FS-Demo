
import style from './AddPlan.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { setSmallLoading } from '../../redux/slices/loading';

function AddPlanAuditing() {

    const [planData, setPlanData] = useState(null);
    const [alert, setalert] = useState(false);
    const [yearlyPlans, setYearlyPlans] = useState(null);
    const [teamAuditors, setTeamAuditors] = useState(null);
    const [LeadAuditors, setLeadAuditors] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPlanProcess, setSelectedPlanProcess] = useState(null);
    const [dataToSend, setDataToSend] = useState({});
    const [daysNums, setDaysNums] = useState(null);

    const array1To28 = Array.from({ length: 28 }, (_, index) => index + 1);
    const array1To29 = Array.from({ length: 29 }, (_, index) => index + 1);
    const array1To30 = Array.from({ length: 30 }, (_, index) => index + 1);
    const array1To31 = Array.from({ length: 31 }, (_, index) => index + 1);


    const dispatch = useDispatch()

    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    useEffect(()=>{
        if(departmentsToShow != null && yearlyPlans != null){
            dispatch(setSmallLoading(false));
        }
    }, [departmentsToShow, yearlyPlans])

    useEffect(() => {
        if (dataToSend?.Month === 'Febraury') {
            setDaysNums(array1To28);
        } else if (dataToSend?.Month === 'April' || dataToSend?.Month === 'June' || dataToSend?.Month === 'September' || dataToSend?.Month === 'November') {
            setDaysNums(array1To30)
        } else if (dataToSend?.Month == null) {
            setDaysNums(null)
        } else {
            setDaysNums(array1To31)
        }
        
    }, [dataToSend])

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyAuditPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setYearlyPlans(response.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })

        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAuditor`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response.data);
            const auditors = response.data.data;
            setLeadAuditors(auditors.filter((obj) => obj.Role === 'Lead Auditor'))
            setTeamAuditors(auditors.filter((obj) => obj.Role === 'Team Auditor'))
        });
    }, [])

    useEffect(() => {
        if (yearlyPlans?.length === 0) {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No Any Yearly Plan Available!'
            })
        }
    }, [yearlyPlans])


    const makeRequest = () => {
        if (planData) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addMonthlyAuditingPlan`, {...planData, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                console.log("request made !");
                setPlanData(null);
                setDataToSend(null)
                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                })

            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Try filling data again',
                confirmButtonText: 'OK.'
            })
        }
    }

    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5  mx-lg-5`}>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Add Monthly Plan
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        console.log(dataToSend);
                        setPlanData(dataToSend);
                        alertManager();
                    }}>
                        <div className={style.formDivider}>
                            <div className={style.sec1}>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Year : </p>
                                    </div>
                                    <div>
                                        <select className='form-select  form-select-lg' onChange={(e) => {
                                            const choosenPlan = yearlyPlans.find((plan) => plan._id === e.target.value); // Find the selected plan object 
                                            setSelectedPlan(choosenPlan);
                                            setDataToSend({ ...dataToSend, YearlyAuditingPlan: e.target.value, Year: choosenPlan.Year })
                                        }} placeholder='Choose year' style={{ width: "100%" }} name='Month' required>
                                            <option value="" selected disabled>Choose Year</option>
                                            {yearlyPlans?.map((plan) => {
                                                return (
                                                    <option value={plan._id}>{plan.Year}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Date : </p>
                                    </div>
                                    <div>
                                        <select onChange={(e) => {
                                            setDataToSend({ ...dataToSend, Date: e.target.value })
                                        }} name='Date' style={{ width: "100%" }} required >
                                            <option value="" selected></option>
                                            {daysNums?.map((dayNum) => {
                                                return (
                                                    <option value={dayNum}>{dayNum}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Department : </p>
                                    </div>
                                    <div>
                                        <select onChange={(e) => {
                                            setDataToSend({ ...dataToSend, Department: e.target.value })
                                        }} name='Department' style={{ width: "100%" }} required >
                                            <option value="" selected disabled>Choose Department</option>
                                            {departmentsToShow?.map((depObj) => {
                                                return (
                                                    <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Process : </p>
                                    </div>
                                    <div>
                                        <select onChange={(e) => {
                                            const choosenProcessObj = selectedPlan.Selected.find((obj) => obj.Process._id === e.target.value);
                                            setDataToSend({ ...dataToSend, ProcessOwner: e.target.value });
                                            setSelectedPlanProcess(choosenProcessObj)
                                        }} name='Training' style={{ width: "100%" }} required>
                                            <option value="" selected disabled>Choose Process</option>
                                            {selectedPlan?.Selected.map((obj) => {
                                                return (
                                                    <option value={obj.Process._id}>{obj.Process.ProcessName}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className={style.sec2}>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Month : </p>
                                    </div>
                                    <div>
                                        <select value={dataToSend?.Month === null ? 'Choose Month' : dataToSend?.Month} onChange={(e) => {
                                            setDataToSend({ ...dataToSend, Month: e.target.value })
                                        }} style={{ width: "100%" }} name='Month' required>
                                            <option value="" selected>Choose Month</option>
                                            {selectedPlan?.Selected[0].monthNames.map((month) => {
                                                return (
                                                    <option value={month}>{month}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Process Owner : </p>
                                    </div>
                                    <div>
                                        <input autoComplete='off' value={selectedPlanProcess?.Process.ProcessOwner.Name} className='text-black' name='Duration' type="text" readOnly
                                            required />
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Lead Auditor : </p>
                                    </div>
                                    <div>
                                        <select onChange={(e) => {
                                            setDataToSend({ ...dataToSend, LeadAuditor: e.target.value })
                                        }} name='Trainer' style={{ width: "100%" }} >
                                            <option value="" selected disabled></option>
                                            {LeadAuditors?.map((auditor) => {
                                                return (
                                                    <option key={auditor._id} value={auditor._id}>{auditor.Name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                                <div className={style.inputParent}>
                                    <div className={style.para}>
                                        <p>Team Auditor : </p>
                                    </div>
                                    <div>
                                        <select onChange={(e) => {
                                            setDataToSend({ ...dataToSend, TeamAuditor: e.target.value })
                                        }} name='Trainer' style={{ width: "100%" }} >
                                            <option value="" selected disabled></option>
                                            {teamAuditors?.map((auditor) => {
                                                return (
                                                    <option key={auditor._id} value={auditor._id}>{auditor.Name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={style.btn}>
                            <button type='submit' >Submit</button>
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
                                <button onClick={alertManager} className={style.btn2}>Cencel</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddPlanAuditing
