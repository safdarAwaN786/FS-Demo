import style from './Mytasks.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function CompletedTasks() {
    const [assignedTrainings, setAssignedtrainings] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user)
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readMonthlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((Response) => {
            const plannedTrainingsList = Response.data.data;
            const assignedTrainingsArr = plannedTrainingsList.filter((training) => training.Assigned === true && training.TrainingResultStatus === 'Conducted' && training.Trainer._id === user._id);
            setAllDataArr(assignedTrainingsArr)
            setAssignedtrainings(assignedTrainingsArr.slice(startIndex, endIndex));
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
    console.log(assignedTrainings);


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr?.filter((obj) => obj.Training[0].TrainingName.includes(event.target.value)
            )
            console.log(searchedList);
            setAssignedtrainings(searchedList);
        } else {
            setAssignedtrainings(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);

    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);


    }

    useEffect(() => {
        setAssignedtrainings(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    return (
<>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search by training name ' />
                </div>
            </div>
            <div className={style.tableParent2}>
                {!assignedTrainings
                    || assignedTrainings?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Training Name</td>
                            <td>Action</td>
                        </tr>
                        {
                            assignedTrainings?.map((assignedTraining, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{assignedTraining.Training.TrainingName}</p>
                                        </td>
                                        <td ><button onClick={() => {

                                            dispatch(changeId(assignedTraining._id));
                                            dispatch(updateTabData({ ...tabData, Tab: 'viewTrainingInfo' }))


                                        }} className={style.view}>
                                            View
                                        </button></td>
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
        </>

    )
}

export default CompletedTasks
