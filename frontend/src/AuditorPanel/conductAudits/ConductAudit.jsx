
import style from './ConductAudits.module.css'
import Search from '../../assets/images/employees/Search.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ConductAudits() {

    const [checklists, setChecklists] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getChecklists`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            const approvedChecklists = response.data.data.filter((obj) => obj.Status === 'Approved')
            setAllDataArr(approvedChecklists)
            setChecklists(approvedChecklists.slice(startIndex, endIndex));
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


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {
        setChecklists(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.ChecklistId.includes(event.target.value)
            )
            setChecklists(searchedList);
        } else {
            setChecklists(allDataArr?.slice(startIndex, endIndex))
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
                {!checklists || checklists?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td className='me-5'>Document ID</td>
                            <td className='ms-5'>Department</td>
                            <td>Conduct Audit</td>
                            <td className='ps-5'>Status</td>
                        </tr>
                        {
                            checklists?.map((checklist, i) => {
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
                                        }}>{checklist.ChecklistId}</p></td>
                                        <td className={`${style.simpleContent} ms-5`}>{checklist.Department.DepartmentName}</td>
                                        <td className='d-flex '>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'auditConduction' }))
                                                dispatch(changeId(checklist._id))
                                            }} className='btn btn-outline-success p-1 mx-1'>Conduct</p>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewAuditsHistory' }))
                                                dispatch(changeId(checklist._id))
                                            }} className={style.redclick}>View</p>
                                        </td>
                                        <td><div className={`text-center ${checklist.Status === 'Approved' && style.greenStatus} ${checklist.Status === 'Disapproved' && style.redStatus} ${checklist.Status === 'Pending' && style.yellowStatus}  `}><p>{checklist.Status}</p></div></td>

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
                            <div className='overflow-y-handler'>
                                <p class={style.msg}>{dataToShow}</p>
                            </div>
                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft: '120px',
                                    marginTop: '25px'
                                }} onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }


        </>
    )
}

export default ConductAudits
