import style from './Checked.module.css'
import Search from '../../assets/images/employees/Search.svg'
import tick from '../../assets/images/tick.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BsArrowLeftCircle } from 'react-icons/bs'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'


function Checked() {
    const [monthToShow, setMonthToShow] = useState(null);
    const [monthTrainings, setMonthTrainings] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const monthName = useSelector(state => state.appData.monthName);
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyPlan`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            {
                const yearlyPlansList = response.data.data;
                const foundObj = yearlyPlansList.find((plan) => plan._id === idToWatch).Month.find((month) => month.MonthName === monthName);
                setMonthToShow(foundObj);
                setMonthTrainings(foundObj.Trainings);
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
    console.log(monthToShow);

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);

    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = monthToShow?.Trainings.filter((obj) => obj.Training?.TrainingName.includes(event.target.value)
            )
            console.log(searchedList);
            setMonthTrainings(searchedList);
        } else {
            setMonthTrainings(monthToShow?.Trainings)
        }
    }




    return (

        <div className={style.subparent}>
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
                    <input onChange={search} type="text" placeholder='Search Training by name ' />
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
            {/* <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {monthToShow?.Trainings?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div> */}

        </div>

    )
}

export default Checked
