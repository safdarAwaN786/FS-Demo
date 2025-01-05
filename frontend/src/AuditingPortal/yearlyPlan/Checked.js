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

function AuditingChecked() {

    const idToWatch = useSelector(state => state.idToProcess);

    const planId = idToWatch;
    const [planProcesses, setPlanProcesses] = useState(null);
    const [planToShow, setPlanToShow] = useState(null)
    const months = ["January", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readYearlyAuditPlanById/${planId}`).then((response) => {
            setPlanToShow(response.data.data);
            setPlanProcesses(response.data.data.Selected);
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

    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = planToShow?.Selected.filter((obj) => obj?.Process?.ProcessName?.includes(event.target.value)
            )
            setPlanProcesses(searchedList);
        } else {
            setPlanProcesses(planToShow?.Selected)
        }
    }




    return (
        
        <>


            <div className='d-flex flex-row px-lg-5  px-2 mx-2 my-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({...tabData, Tab : 'Audit Program (Yearly Plan)'}))
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
                        <td>Process Name</td>
                        {months.map((month) => {
                            return (
                                <td>{month}</td>
                            )
                        })}
                    </tr>
                    {
                        planProcesses?.slice(startIndex, endIndex)?.map((processData, i) => {
                            return (
                                <tr className={style.tablebody} key={i}>
                                    <td>
                                        <p>{processData.Process?.ProcessName}</p>
                                    </td>

                                    {months.map((month) => {
                                        return (

                                            <td>
                                                {processData.monthNames.includes(month) && (

                                                    <img src={tick} />
                                                )}
                                            </td>
                                        )
                                    })}



                                </tr>
                            )

                        })
                    }
                </table>
            </div>
           


      </>

    )
}

export default AuditingChecked;
