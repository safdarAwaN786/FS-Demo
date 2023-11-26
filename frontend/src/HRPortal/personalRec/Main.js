import style from './Main.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setLoading } from '../../redux/slices/loading'


function Main() {
    const [personReqList, setPersonReqList] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);

    const userToken = Cookies.get('userToken');
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);


    useEffect(() => {
        dispatch(setLoading(true))
        axios.get("/readPersonalRecuisition", { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            dispatch(setLoading(false))
            setAllDataArr(response.data.data);
            setPersonReqList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const statusUpdated = () => {
        axios.get("/readPersonalRecuisition", { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            dispatch(setLoading(false))
            setAllDataArr(response.data.data);
            setPersonReqList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setLoading(false));
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

        setPersonReqList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            console.log(allDataArr);
            const searchedList = allDataArr?.filter(obj => obj.DepartmentText.includes(event.target.value)
            )
            console.log(searchedList);
            setPersonReqList(searchedList);
        } else {
            setPersonReqList(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const [popUpData, setPopUpData] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);



    const [alert, setalert] = useState(false)
    const [alert2, setalert2] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const alertManager2 = () => {
        setalert2(!alert2)
    }




    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search by Department ' />
                    </div>
                    {tabData?.Creation && (

                        <div className='d-flex'>
                            <div onClick={() => {
                                dispatch(updateTabData({ ...tabData, Tab: 'addPersonalRec' }));
                            }} className={style.sec2}>
                                <img src={add} alt="" />
                                <p>Add New</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>

                    {!personReqList || personReqList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (


                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Station</td>
                                <td>job title</td>
                                <td>Supervisor</td>
                                <td>Department</td>
                                <td>Action</td>
                                {tabData?.Approval && (

                                    <td>Action</td>
                                )}
                                <td></td>
                                <td>Status</td>
                                <td>Reason</td>
                            </tr>
                            {
                                personReqList?.map((reqPerson, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td className={style.textStyle2}>{reqPerson.Station}</td>
                                            <td className={style.textStyle3}>{reqPerson.JobTitle}</td>
                                            <td className={style.textStyle3}>{reqPerson.Supervisor}</td>
                                            <td className={style.textStyle3}>{reqPerson.DepartmentText}</td>
                                            <td ><button onClick={() => {
                                                dispatch(changeId(reqPerson._id));
                                                dispatch(updateTabData({ ...tabData, Tab: 'showPersonalRec' }));


                                            }} className={style.viewBtn}>View</button>
                                            </td>
                                            {tabData?.Approval && (

                                                <td>



                                                    <button onClick={() => {
                                                        setDataToSend({
                                                            personId: reqPerson._id,
                                                            status: "Approved"
                                                        });
                                                        alertManager2();
                                                    }} className={style.viewBtn2}>Approve</button>
                                                    <button onClick={() => {
                                                        setDataToSend({
                                                            personId: reqPerson._id,
                                                            status: "Disapproved"
                                                        });
                                                        alertManager();
                                                    }} className={style.orangebtn}>Disapprove</button>



                                                </td>
                                            )}
                                            <td className={style.textStyle3}></td>
                                            <td><div className={` text-center ${reqPerson.Status === 'Pending' && (style.yellowStatus)} ${reqPerson.Status === 'Approved' && (style.greenStatus)} ${reqPerson.Status === 'Disapproved' && (style.redStatus)}`}><p>{reqPerson.Status}</p></div></td>
                                            <td ><button onClick={() => {
                                                if (reqPerson.Status === "Approved") {
                                                    setPopUpData("This Application is Approved.");

                                                } else if (reqPerson.Status === "Disapproved") {
                                                    setPopUpData(reqPerson.Reason);
                                                } else {
                                                    setPopUpData("Application is pending still.")
                                                }
                                                setShowBox(true);
                                            }} className={style.viewBtn}>View</button>
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

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <form onSubmit={() => {
                                dispatch(setLoading(true))
                                axios.patch("/updatePersonStatus", dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                    statusUpdated();
                                    Swal.fire({
                                        title: 'Success',
                                        text: 'Status Updated Successfully',
                                        icon: 'success',
                                        confirmButtonText: 'Go!',
                                    })

                                }).catch(err => {
                                    dispatch(setLoading(false));
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'OOps..',
                                        text: 'Something went wrong, Try Again!'
                                    })
                                })

                                alertManager();
                            }}>

                                <textarea onChange={(event) => {
                                    setDataToSend({ ...dataToSend, Reason: event.target.value })
                                }} name="" id="" cols="30" rows="10" placeholder='Reason here' required></textarea>
                                <div className={style.alertbtns}>
                                    <button type='submit' className={style.btn1}>Submit</button>
                                    <button onClick={alertManager} className={style.btn2}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p>Are you sure to submit ?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(setLoading(true))
                                    axios.patch("/updatePersonStatus", dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                                        statusUpdated()
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Status Updated Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',
                                        })
                                    }).catch(err => {
                                        dispatch(setLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })

                                    alertManager2();
                                }} className={style.btn3}>Submit</button>
                                <button onClick={alertManager2} className={style.btn2}>Cencel</button>
                            </div>
                        </div>
                    </div> : null
            }
            {
                showBox &&
                <div class={style.alertparent}>
                    <div class={style.alert}>
                        <p>{popUpData}</p>
                        <div className={style.alertbtns}>

                            <button onClick={() => {
                                setShowBox(false);
                            }} className={style.btn2}>Ok.</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Main

