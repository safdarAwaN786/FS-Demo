
import style from './AddPlan.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { setSmallLoading } from '../../redux/slices/loading';

function AddPlan() {

    const [planData, setPlanData] = useState(null);
    const [alert, setalert] = useState(false);
    const [yearlyPlans, setYearlyPlans] = useState(null);
    const [monthsToShow, setMonthsToShow] = useState(null);
    const [trainings, setTrainings] = useState(null);
    const [trainers, setTrainers] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [departmentsToShow, setDepartmentsToShow] = useState(null);
    const [dataToSend, setDataToSend] = useState({});
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            setDepartmentsToShow(res.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const [daysNums, setDaysNums] = useState(null);
    const array1To28 = Array.from({ length: 28 }, (_, index) => index + 1);
    const array1To29 = Array.from({ length: 29 }, (_, index) => index + 1);
    const array1To30 = Array.from({ length: 30 }, (_, index) => index + 1);
    const array1To31 = Array.from({ length: 31 }, (_, index) => index + 1);
    useEffect(() => {
        if (trainings?.length === 0) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No Any Training Added!'
            })
        } else if (yearlyPlans?.length === 0) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No Any Yearly Plan Added!'
            })
        } else if (trainers?.length === 0) {
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon: 'warning',
                title: 'OOps..',
                text: 'No Any Trainer Added!'
            })
        } else if (trainings && trainers && yearlyPlans) {
            dispatch(setSmallLoading(false))
        }
    }, [trainings, trainers, yearlyPlans])


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
        console.log(dataToSend);
    }, [dataToSend])

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readTraining`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setTrainings(response.data.data);
            if (departmentsToShow && yearlyPlans && trainers) {
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        });
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setYearlyPlans(response.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readTrainer`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setTrainers(response.data.data);
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])


    const makeRequest = () => {
        if (planData) {
            dispatch(setSmallLoading(true));
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addMonthlyPlan`, { ...planData, createdBy: user.Name }, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                dispatch(setSmallLoading(false));
                setSelectedPlan(null);
                setPlanData(null);
                setDataToSend(null);
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
            <div className={style.headers}>
                <div className={style.spans}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className={style.heading}>
                    Add Monthly Plan
                </div>
            </div>
            <form encType='multipart/form-data' onSubmit={(event) => {
                event.preventDefault();
                setPlanData(dataToSend);
                alertManager();
                event.target.reset();
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
                                    console.log(choosenPlan);
                                    setSelectedPlan(choosenPlan);
                                    setDataToSend({ ...dataToSend, YearlyTrainingPlan: e.target.value, Year: choosenPlan.Year })
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
                                <p>Month : </p>
                            </div>
                            <div>
                                <select className='form-select  form-select-lg' value={dataToSend?.Month === null ? 'Choose Month' : dataToSend?.Month} onChange={(e) => {
                                    setDataToSend({ ...dataToSend, Month: e.target.value })
                                }} style={{ width: "100%" }} name='Month' required>
                                    <option value="" selected>Choose Month</option>
                                    {monthsToShow?.map((month) => {
                                        return (
                                            <option value={month.MonthName}>{month.MonthName}</option>

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
                                <select className='form-select  form-select-lg' onChange={(e) => {
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
                                <select className='form-select  form-select-lg' onChange={(e) => {
                                    setDataToSend({ ...dataToSend, DepartmentText: e.target.value })
                                }} name='DepartmentText' style={{ width: "100%" }} required >
                                    <option value="" selected disabled>Choose Department</option>
                                    {departmentsToShow?.map((depObj) => {
                                        return (
                                            <option value={depObj.DepartmentName}>{depObj.DepartmentName}</option>
                                        )
                                    })}
                                </select>
                            </div>
                        </div>



                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Trainer</p>
                            </div>
                            <div>
                                <select className='form-select  form-select-lg' onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='Trainer' style={{ width: "100%" }} required >
                                    <option value="" selected disabled>Choose Trainer</option>
                                    {trainers?.map((trainer) => {

                                        return (

                                            <option key={trainer._id} value={trainer._id}>{trainer.Name}</option>
                                        )
                                    })}
                                </select>

                            </div>
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Training : </p>
                            </div>
                            <div>
                                <select className='form-select  form-select-lg' onChange={(e) => {
                                    setMonthsToShow(selectedPlan.Month.filter((monthObj) => {
                                        return (
                                            monthObj.Trainings.find((training) => training.Training._id === e.target.value)
                                        )
                                    }))
                                    setDataToSend({ ...dataToSend, Training: e.target.value, Month: null });
                                }}
                                    name='Training'
                                    style={{ width: "100%" }}
                                    required>
                                    <option value="" selected disabled>Select Training</option>
                                    {selectedPlan?.Month.map((obj) => {
                                        return obj.Trainings.map((training) => {
                                            return (
                                                <option key={training.Training._id} value={training.Training._id}>{training.Training.TrainingName}</option>
                                            )
                                        });
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Venue</p>
                            </div>
                            <div>
                                <input autoComplete='off' className='text-dark' onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='Venue' value={dataToSend?.Venue} type="text" placeholder='(e.g) Training Hall' required />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Duration</p>
                            </div>
                            <div>
                                <input autoComplete='off' className='text-dark' onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='Duration' type="text" placeholder='(e.g) 2 Days' required />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Time : </p>
                            </div>
                            <div>
                                <input autoComplete='off' className='text-dark' onChange={(e) => {
                                    setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                }} name='Time' type="time" placeholder='(e.g) 2 Days' required />

                            </div>
                        </div>

                        <div className={`${style.checkinputParent} ${style.bg}`}>
                            <div className={style.para}>
                                <p>Internal/External</p>
                            </div>
                            <div className={style.dropdown}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input autoComplete='off' onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                    }} name='InternalExternal' style={{ width: '26px', height: '36px' }} value="Internal" type="radio" required />
                                    <p className={style.paraind}>Internal</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input autoComplete='off' onChange={(e) => {
                                        setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                    }} name='InternalExternal' style={{ width: '26px', height: '36px' }} value="Internal" type="radio" required />
                                    <p className={style.paraind}>External</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                <div className={style.btn}>
                    <button type='submit' >Submit</button>
                </div>
            </form>

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

export default AddPlan
