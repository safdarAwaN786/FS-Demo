import style from './Input.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'

function Input() {

    const [dataToSend, setDataToSend] = useState(null)
    const months = ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [year, setYear] = useState(null);
    const [month, setMonth] = useState(null);
    const [trainings, setTrainings] = useState(null);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const user = useSelector(state => state.auth.user);
    const [yearlyPlanData, setYearlyPlanData] = useState( {
        Year: '',
        Month: [
            {
                MonthName: '',
                Trainings: [
                    // {
                    //     Training: "",
                    //     WeekNumbers: []
                    // }
                ]
            }
        ]
    })
    
    const [showBox, setShowBox] = useState(false)
    const [popUpData, setPopUpData] = useState(null);
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    var trainingsArr;
    const handleCheckbox = (event, TrainingId) => {
        const weekNumber = event.target.value;
        const updatedTrainings = [...yearlyPlanData.Month[0].Trainings];
        const existingTraining = updatedTrainings.find(obj => obj.Training === TrainingId);
        console.log(existingTraining);
        
        if (existingTraining) {
            console.log('found');
            
            // obj found..
            const weekExist = existingTraining.WeekNumbers.includes(weekNumber);
            if (weekExist) {
                
                existingTraining.WeekNumbers = existingTraining.WeekNumbers.filter(weekNum => weekNum !== weekNumber)
                if(existingTraining.WeekNumbers?.length ==0){
                    updatedTrainings.filter(obj => obj.Training !== TrainingId)
                }
                
            } else {
                existingTraining.WeekNumbers.push(weekNumber);
            }
        } else {
            console.log('not found');
            
            updatedTrainings.push({
                Training: TrainingId,
                WeekNumbers: [weekNumber]
            })
        }
        // trainingsArr = trainingsArray;
        // for (let index = 0; index < updatedTrainings.length; index++) {
        //     if (updatedTrainings[index].WeekNumbers.length === 0) {
        //         console.log("length zero");
        //         const emptyTrainingIndex = trainingsArr.indexOf(trainingsArr[index]);
        //         console.log(emptyTrainingIndex);
            
        //         duplicateYearlyPlanData.Month[0].Trainings.splice(emptyTrainingIndex, 1);
        //     }
        // }
        setYearlyPlanData({...yearlyPlanData, Month : [{...yearlyPlanData.Month[0], Trainings : updatedTrainings}]})
        
    }
    const [allDataArr, setAllDataArr] = useState(null);
    useEffect(()=>{
        if(trainings?.lenght === 0){
            dispatch(setSmallLoading(false))
            Swal.fire({
                icon : 'warning',
                title : 'OOps..',
                text : 'No, Traininngs Added'
            })
        }
    }, [trainings])
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readTraining`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setTrainings(response.data.data.slice(startIndex, endIndex));
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

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setTrainings(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const makeRequest = () => {
        if (dataToSend.Year !== '' && dataToSend.Month[0].MonthName !== '' && dataToSend.Month[0].Trainings.lenght !== 0) {
            dispatch(setSmallLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/addYearlyPlan`, {...dataToSend, createdBy : user.Name}, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                dispatch(setSmallLoading(false))
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Create Yearly Training Plan' }))
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
                text: 'Try filling data again',
                confirmButtonText: 'OK.'
            })
        }
    }
 
    

    return (
        <>
                <form onSubmit={(event) => {
                    event.preventDefault();
                    console.log(yearlyPlanData)
                    if (yearlyPlanData.Month[0].Trainings.length !== 0) {
                        alertManager();
                        setDataToSend(yearlyPlanData);
                    } else {
                        setShowBox(true);
                        setPopUpData("No week selected. Kindly select some weeks.!")
                    }
                }}>

                    <div className='d-flex flex-row px-lg-5  px-2 my-2'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Create Yearly Training Plan' }))
                            }
                        }} />

                    </div>

                    <div className={`${style.searchbar} mt-1 `}>
                        <div className={style.sec1}>

                            <select className='form-select  form-select-lg' onChange={(event) => {
                                setYearlyPlanData({...yearlyPlanData, Year : event.target.value})
                               
                            }} style={{ width: "200px" }} name='Year' required>
                                <option value="" disabled selected>Select Year</option>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                                <option value="2028">2028</option>
                                <option value="2029">2029</option>
                                <option value="2030">2030</option>
                            </select>

                            <select className='form-select  form-select-lg' onChange={(event) => {
                                setYearlyPlanData({...yearlyPlanData, Month : [{...yearlyPlanData.Month[0], MonthName : event.target.value}]})
                                // setMonth(event.target.value);
                            }} style={{ width: "200px" }} name='MonthName' required>
                                <option value="" disabled selected>Select Month</option>
                                {months.map((month) => {
                                    return (
                                        <option value={month}>{month}</option>
                                    )
                                })}
                            </select>

                        </div>
                    </div>
                    <div className={style.tableParent2}>
                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Training Name</td>
                                <td>Week 1</td>
                                <td>Week 2</td>
                                <td>Week 3</td>
                                <td>Week 4</td>
                            </tr>
                            {
                                trainings?.map((training, i) => {
                                    ;
                                    
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td>
                                                <p>{training.TrainingName}</p>
                                            </td>
                                            <td>
                                                <input checked={yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id) !== undefined && yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id).WeekNumbers.includes('1')} autoComplete='off' onChange={(event) => {
                                                    handleCheckbox(event, training._id)
                                                }} value={1} type="checkbox" />
                                            </td>
                                            <td>
                                                <input checked={yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id) !== undefined && yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id).WeekNumbers.includes('2')} autoComplete='off' onChange={(event) => {
                                                    handleCheckbox(event, training._id)
                                                }} value={2} type="checkbox" />
                                            </td>
                                            <td>
                                                <input checked={yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id) !== undefined && yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id).WeekNumbers.includes('3')} autoComplete='off' onChange={(event) => {
                                                    handleCheckbox(event, training._id)
                                                }} value={3} type="checkbox" />
                                            </td>
                                            <td>
                                                <input checked={yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id) !== undefined && yearlyPlanData.Month[0].Trainings?.find(obj => obj.Training === training._id).WeekNumbers.includes('4')} autoComplete='off' onChange={(event) => {
                                                    handleCheckbox(event, training._id)
                                                }} value={4} type="checkbox" />
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </table>
                    </div>
                    <div className={style.btn}>
                        <button type='submit' >Submit</button>
                    </div>
                </form>
                <div className={style.Btns}>
                    {startIndex > 0 && (
                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (
                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
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
            {
                showBox ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                        </div>
                            <div className={style.alertbtns}>
                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false)
                                    setPopUpData(null);
                                }} className={style.btn1}>Ok.</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default Input
