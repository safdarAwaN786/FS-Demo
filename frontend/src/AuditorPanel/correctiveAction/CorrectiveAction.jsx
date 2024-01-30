
import style from './CorrectiveAction.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function CorrectiveActions() {

    const [reportsList, setReportsList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [send, setSend] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [reject, setReject] = useState(false);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readReports`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setReportsList(response.data.data.slice(startIndex, endIndex));
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
        setReportsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {

            const searchedList = allDataArr.filter((obj) =>

                obj.ConductAudit?.ChecklistId?.ChecklistId.includes(event.target.value)
            )
            console.log(searchedList);
            setReportsList(searchedList);
        } else {
            setReportsList(allDataArr?.slice(startIndex, endIndex))
        }
    }

   
    return (
        <>


                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input autoComplete='off' onChange={search} type="text" placeholder='Search document by name' />
                    </div>

                </div>
                <div className={style.tableParent}>
                    {!reportsList || reportsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td className='me-5'>Document ID</td>
                                <td className='ms-5'>Department</td>
                                <td>Actual Date</td>
                                <td>Checklist Status</td>
                                <td>Non Conformance Report</td>
                            </tr>
                            {
                                reportsList?.map((report, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td className='me-5'><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{report.ConductAudit.Checklist.ChecklistId}</p></td>
                                            <td className={`${style.simpleContent} ms-5`}>{report.ConductAudit.Checklist.Department.DepartmentName}</td>
                                            
                                            {report.ReportDate ? (
                                                <td>{report.ReportDate?.slice(0, 10).split('-')[2]}/{report.ReportDate?.slice(0, 10).split('-')[1]}/{report.ReportDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td><div className={`text-center ${style.yellowStatus}  `}><p>Pending</p></div></td>
                                            )}


                                            <td><div className={`text-center ${style.greenStatus}  `}><p>{report.ConductAudit.Checklist.Status}</p></div></td>
                                            <td>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({...tabData, Tab : 'actionOnCorrective'}));
                                                    dispatch(changeId(report._id))
                                                }} className='btn btn-outline-success p-1 m-0'>Take Action</p>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({...tabData, Tab : 'viewCorrectiveActionsList'}))
                                                    dispatch(changeId(report._id))
                                                }} className={style.redclick}>View</p>
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
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
                                }}  onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }
            {
                send && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert} p-3 pt-5`}>
                            <form onSubmit={(e) => {

                            }}>
                                <div className='mx-4 my-4 d-inline'>

                                    <input autoComplete='off' type='checkbox' className='mx-3 my-2 p-2' /><span>Department 1</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input autoComplete='off' type='checkbox' className='mx-3 my-2 p-2' /><span>Department 2</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input autoComplete='off' type='checkbox' className='mx-3 my-2 p-2' /><span>Department 3</span>
                                </div>
                                <div className='mx-4 my-4 d-inline'>

                                    <input autoComplete='off' type='checkbox' className='mx-3 my-2 p-2' /><span>Department 4</span>
                                </div>


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Send</button>
                                    <button onClick={() => {
                                        setSend(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {
                reject && (
                    <div class={style.alertparent}>
                        <div class={`${style.alert2} `}>
                            <form onSubmit={(e) => {

                            }}>
                                <textarea name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />


                                <div className={`$ mt-3 d-flex justify-content-end `}>
                                    <button type='submit' className='btn btn-danger px-3 py-2 m-3'>Send</button>
                                    <button onClick={() => {
                                        setReject(false);
                                    }} className="btn btn-outline-danger  px-3 py-2 m-3">Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default CorrectiveActions
