import style from './Checked.module.css'
import Search from '../../assets/images/employees/Search.svg'
import tick from '../../assets/images/tick.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function Checked() {
    const [monthToShow, setMonthToShow] = useState(null);
    const [monthTrainings, setMonthTrainings] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const monthName = useSelector(state => state.appData.monthName);
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            {
                const yearlyPlansList = response.data.data;
                const foundObj = yearlyPlansList.find((plan) => plan._id === idToWatch).Month.find((month) => month.MonthName === monthName);
                setMonthToShow(foundObj);
                setMonthTrainings(foundObj.Trainings);
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])



    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = monthToShow?.Trainings.filter((obj) => obj.Training?.TrainingName.includes(event.target.value)
            )
            setMonthTrainings(searchedList);
        } else {
            setMonthTrainings(monthToShow?.Trainings)
        }
    }




    return (

  <>
            <div className='d-flex flex-row px-lg-5  px-2 my-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({...tabData, Tab : 'showPlanMonths'}));
                    }
                }} />

            </div>

            <div className={`${style.searchbar} mt-1 `}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Training by name ' />
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
                        monthTrainings?.slice(startIndex, endIndex)?.map((trainingData, i) => {
                            return (
                                <tr className={style.tablebody} key={i}>
                                    <td>
                                        <p>{trainingData.Training.TrainingName}</p>
                                    </td>
                                    <td>
                                        {trainingData.WeekNumbers.includes(1) && (

                                            <img src={tick} />
                                        )}
                                    </td>
                                    <td>
                                        {trainingData.WeekNumbers.includes(2) && (

                                            <img src={tick} />
                                        )}
                                    </td>
                                    <td>
                                        {trainingData.WeekNumbers.includes(3) && (

                                            <img src={tick} />
                                        )}
                                    </td>
                                    <td>
                                        {trainingData.WeekNumbers.includes(4) && (

                                            <img src={tick} />
                                        )}
                                    </td>



                                </tr>
                            )

                        })
                    }
                </table>
            </div>
            

        </>

    )
}

export default Checked
