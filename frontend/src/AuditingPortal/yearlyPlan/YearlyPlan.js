import style from './YearlyPlan.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function YearlyPlanAuditing() {

    const [yearlyPlans, setYearlyPlans] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [deletePlan, setDeletePlan] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null)
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyAuditPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response.data);
            setAllDataArr(response.data.data);
            setYearlyPlans(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    const refreshData = async () => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyAuditPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            console.log(response.data);
            setAllDataArr(response.data.data);
            setYearlyPlans(response.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
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

        setYearlyPlans(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr?.filter((obj) => {
                return (

                    obj.Year.toString().includes(event.target.value)
                )

            })

            console.log(searchedList);
            setYearlyPlans(searchedList);
        } else {
            setYearlyPlans(allDataArr?.slice(startIndex, endIndex))
        }
    }

    return (


        <>

            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="number" placeholder='Search year in numbers ' />
                </div>
                {tabData?.Creation && (
                    <div onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'addAuditingYearlyPlan' }));
                    }} className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Add New</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent2}>
                {!yearlyPlans || yearlyPlans?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Year</td>
                            <td>Action</td>
                        </tr>
                        {
                            yearlyPlans?.map((yearlyPlan, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{yearlyPlan.Year}</p>
                                        </td>
                                        <td ><button onClick={() => {
                                            dispatch(updateTabData({ ...tabData, Tab: 'auditingYearlyPlanChecked' }))
                                            dispatch(changeId(yearlyPlan._id))
                                        }} className={`${style.view} btn btn-outline-primary`}>
                                            View
                                        </button>
                                            <button onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'editAuditingYearlyPlanChecked' }))
                                                dispatch(changeId(yearlyPlan._id))
                                            }} className={`${style.view} btn btn-outline-primary`}>
                                                Edit
                                            </button>
                                            <button onClick={() => {
                                                setDeletePlan(true);
                                                setPlanToDelete(yearlyPlan._id)
                                            }} className={`${style.view} btn btn-outline-danger`}>
                                                Delete
                                            </button>
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
            {
                deletePlan ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to delete this Yearly Plan?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setDeletePlan(false)
                                    dispatch(setSmallLoading(true))
                                    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/deleteYearlyAuditPlan/${planToDelete}`).then((response) => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Deleted Successfully',
                                            text: 'Yearly Plan Deleted Successfully!',
                                            confirmButtonText: 'OK.'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                refreshData()
                                            }
                                        })

                                    }).catch(err => {
                                        dispatch(setSmallLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })

                                    })
                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => {
                                    setDeletePlan(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>


    )
}

export default YearlyPlanAuditing
