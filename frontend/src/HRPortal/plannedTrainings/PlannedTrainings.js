import style from './Trainings.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';


function PlannedTrainings() {
    const [plannedTrainings, setPlannedTrainings] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const userToken = Cookies.get('userToken');
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            const allTrainings = response.data.data;
            setAllDataArr(allTrainings.filter((training) => training.Assigned !== true));
            setPlannedTrainings(allTrainings.filter((training) => training.Assigned !== true).slice(startIndex, endIndex));
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



    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);

    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setPlannedTrainings(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);
            const searchedList = allDataArr?.filter((obj) => obj.Training[0].TrainingName.includes(event.target.value))
            console.log(searchedList);
            setPlannedTrainings(searchedList);
        } else {
            setPlannedTrainings(allDataArr?.slice(startIndex, endIndex))
        }
    }






    return (

        <div className={style.subparent}>

            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input onChange={search} type="text" placeholder='Search Training by name' />
                </div>
            </div>
            <div className={style.tableParent}>

                {!plannedTrainings || plannedTrainings?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (


                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Training Name</td>
                            <td>Venue</td>
                            <td>Duration</td>
                            <td>Month</td>
                            <td>Time</td>
                            <td>Department</td>
                            <td>Action</td>
                            <td>Action</td>
                        </tr>
                        {
                            plannedTrainings?.map((plannedTraining, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td className={style.textStyle1}>{plannedTraining.Training?.TrainingName}</td>
                                        <td className={style.textStyle2}>{plannedTraining.Venue}</td>
                                        <td className={style.textStyle3}>{plannedTraining.Duration}</td>
                                        <td className={style.textStyle3}>{plannedTraining.Month}</td>
                                        <td className={style.textStyle3}>{plannedTraining.Time}</td>
                                        <td className={style.textStyle3}>{plannedTraining.DepartmentText}</td>
                                        <td ><button onClick={() => {
                                            dispatch(changeId(plannedTraining._id))
                                            dispatch(updateTabData({ ...tabData, Tab: 'plannedTrainingInfo' }))
                                        }} className={style.viewBtn}>View</button>
                                        </td>
                                        <td ><button onClick={() => {
                                            dispatch(updateTabData({...tabData, Tab : 'assignTraining'}))
                                            dispatch(changeId(plannedTraining._id))
                                        }} className={style.orangebtn}>Assign training</button>
                                        </td>
                                    </tr>
                                )

                            })
                        }
                    </table>
                )}
            </div>
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
        </div>

    )
}

export default PlannedTrainings
