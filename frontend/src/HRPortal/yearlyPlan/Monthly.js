import style from './Monthly.module.css'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BsArrowLeftCircle } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { changeMonthName } from '../../redux/slices/appSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function Monthly() {   

    const [planToShow, setPlanToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyPlan`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const yearlyPlansList = response.data.data;
            setPlanToShow(yearlyPlansList.find((plan) => plan._id === idToWatch))
            dispatch(setSmallLoading(false));
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])



    return (
<>
            <div className='d-flex flex-row px-lg-5  px-2 my-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({...tabData, Tab : 'Create Yearly Training Plan'}))
                    }
                }} />
            </div>
            <div className={`${style.searchbar} mt-1 `}>
                <div className={style.sec1}>
                </div>
            </div>
            <div className={style.tableParent2}>
                <table className={style.table}>
                    <tr className={style.headers}>
                        <td>Month</td>
                        <td>Action</td>
                    </tr>
                    {
                        planToShow?.Month.map((month, i) => {
                            return (
                                <tr className={style.tablebody} key={i}>
                                    <td>
                                        <p>{month.MonthName}</p>
                                    </td>
                                    <td ><button onClick={() => {
                                        dispatch(changeId(planToShow._id));
                                        dispatch(changeMonthName(month.MonthName));
                                        dispatch(updateTabData({...tabData, Tab : 'showPlanWeeks'}))

                                    }} className={style.view}>
                                        View
                                    </button></td>
                                </tr>
                            )

                        })
                    }
                </table>
            </div>


        </>

    )
}

export default Monthly
