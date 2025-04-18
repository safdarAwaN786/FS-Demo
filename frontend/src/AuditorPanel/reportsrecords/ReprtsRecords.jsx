
import style from './ReportsRecords.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ReportsRecords() {

    const [auditsList, setAuditsList] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth?.user);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readConductAudits`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            setAuditsList(response.data.data.slice(startIndex, endIndex));
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
        setAuditsList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj?.ChecklistId?.ChecklistId.includes(event.target.value)
            )
            setAuditsList(searchedList);
        } else {
            setAuditsList(allDataArr?.slice(startIndex, endIndex))
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
                    {!auditsList || auditsList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td className='me-5'>Document ID</td>
                                <td className='ms-5'>Department</td>
                                <td>Actual Date</td>
                                <td className='ps-5'>Status</td>
                                <td>Non Conformance Report</td>
                            </tr>
                            {
                                auditsList?.map((audit, index) => {
                                    return (
                                        <tr className={style.tablebody} key={index}>
                                            <td className='me-5' ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{audit.Checklist.ChecklistId}</p></td>
                                            <td className={`${style.simpleContent} ms-5`}>{audit.Checklist.Department.DepartmentName}</td>
                                            
                                            {audit.AuditDate ? (

                                                <td>{audit.AuditDate?.slice(0, 10).split('-')[2]}/{audit.AuditDate?.slice(0, 10).split('-')[1]}/{audit.AuditDate?.slice(0, 10).split('-')[0]}</td>
                                            ) : (
                                                <td><div className={`text-center ${style.yellowStatus}  `}><p>Pending</p></div></td>
                                            )}
                                            

                                            <td><div className={`text-center ${style.greenStatus}  `}><p>{audit.Checklist.Status}</p></div></td>
                                            <td className='d-flex'>
                                                <p onClick={() => {
                                                    dispatch(changeId(audit._id))
                                                    dispatch(updateTabData({...tabData, Tab : 'recordReport'}))
                                                }} className='btn btn-outline-success p-1 mx-1'>Generate Report</p>
                                                <p onClick={() => {
                                                    dispatch(updateTabData({...tabData, Tab : 'viewReportsList'}));
                                                    dispatch(changeId(audit._id));
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
        </>
    )
}

export default ReportsRecords
