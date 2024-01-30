import style from './Processes.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function Processes() {

    const [processesList, setProcessesList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [showOwner, setShowOwner] = useState(false);
    const [ownerInfo, setOwnerInfo] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const [sendEmail, setSendEmail] = useState(false);
    const [emailTo, setEmailTo] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readProcess`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            setAllDataArr(response.data.data)
            console.log(response.data);
            setProcessesList(response.data.data.slice(startIndex, endIndex));
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
        setProcessesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.ProcessCode.includes(event.target.value) || obj?.ProcessName?.includes(event.target.value)
            )
            console.log(searchedList);
            setProcessesList(searchedList);
        } else {
            setProcessesList(allDataArr?.slice(startIndex, endIndex))
        }
    }



    return (
        <>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={Search} alt="" />
                    <input autoComplete='off' onChange={search} type="text" placeholder='Search Process by name' />
                </div>
                {tabData?.Creation && (

                    <div className={style.sec2} onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'addProcess' }));
                    }}>
                        <img src={add} alt="" />
                        <p>Add New</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!processesList || processesList?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Process ID</td>
                            <td>Process Name</td>
                            <td>Department</td>
                            <td>Risk Assesment</td>
                            <td>Activities</td>
                            <td>Special Instructions</td>
                            <td>Shift Breaks</td>
                            <td>Critical Areas</td>
                            <td>Process Owner</td>
                            <td>Action</td>
                        </tr>
                        {
                            processesList?.map((process, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td ><p style={{
                                            backgroundColor: "#f0f5f0",
                                            padding: "2px 5px",
                                            borderRadius: "10px",
                                            fontFamily: "Inter",
                                            fontSize: "12px",
                                            fontStyle: "normal",
                                            fontWeight: "400",
                                            lineHeight: "20px",
                                        }}>{process.ProcessCode}</p></td>
                                        <td className={style.simpleContent}>{process.ProcessName}</td>
                                        <td>{process.Department.DepartmentName}</td>
                                        <td><div className={`text-center ${process.ProcessRiskAssessment === 'Low' && style.greenStatus} ${process.ProcessRiskAssessment === 'High' && style.redStatus} ${process.ProcessRiskAssessment === 'Medium' && style.yellowStatus}  `}><p>{process.ProcessRiskAssessment}</p></div></td>
                                        <td>
                                            <p onClick={() => {
                                                setShowBox(true);
                                                setDataToShow(process.Activities)
                                            }} className={style.click}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setShowBox(true);
                                                setDataToShow(process.SpecialInstructions)
                                            }} className={style.click}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setShowBox(true);
                                                setDataToShow(process.ShiftBreaks)
                                            }} className={style.click}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setShowBox(true);
                                                setDataToShow(process.CriticalAreas)
                                            }} className={style.click}>View</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                setShowOwner(true);
                                                setOwnerInfo(process.ProcessOwner);
                                                // setTab('processOwners');
                                                // setIdToWatch(training._id);
                                            }} className={style.orangeclick}>Click Here</p>
                                        </td>
                                        <td>
                                            <p onClick={() => {
                                                dispatch(updateTabData({ ...tabData, Tab: 'assignTabsToOwner' }));
                                                dispatch(changeId(process.ProcessOwner._id));
                                            }} className={'btn btn-outline-danger px-2 py-1  m-1'}>Assign Tabs</p>
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
                showOwner ?
                    <div class={`${style.alertparent} `}>
                        <div className={`${style.addOwnerForm} mb-4 `}>
                            <div className={style.headers2}>
                                <div className={style.spans}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className={style.para}>
                                    Process Owner Details
                                </div>
                            </div>
                            <div className='p-lg-5 p-3 d-flex justify-content-center flex-column'>
                                <div className={`mx-auto my-2 ${style.ownerInput}`}>
                                    <p>Name</p>
                                    <input autoComplete='off' className={`p-2 w-100`} value={ownerInfo?.Name} readOnly />
                                </div>
                                <div className={`mx-auto my-2 ${style.ownerInput}`}>
                                    <p>Designation</p>
                                    <input autoComplete='off' value={ownerInfo.Designation} className={`p-2 w-100`} readOnly />
                                </div>
                                <div className={`mx-auto my-2 ${style.ownerInput}`}>
                                    <p>Phone</p>
                                    <input autoComplete='off' className={`p-2 w-100`} value={ownerInfo.PhoneNumber} readOnly />
                                </div>
                                <div className={`mx-auto my-2 ${style.ownerInput}`}>
                                    <p>Email Address</p>
                                    <input autoComplete='off' value={ownerInfo.Email} className={`p-2 w-100`} readOnly />
                                </div>
                                {/* <div className={`mx-auto my-2 ${style.ownerInput}`}>
                                    <p>Password</p>
                                    <div className='d-flex flex-row justify-content-start'>
                                        <input autoComplete='off' value={ownerInfo.Password} className={`p-2 w-100`} readOnly />
                                    </div>

                                </div> */}

                            </div>
                            <div className={` d-flex justify-content-center`}>

                                <button onClick={() => {
                                    setShowOwner(false);
                                    setOwnerInfo(null)
                                }} className={style.btn2}>Close</button>

                            </div>

                        </div>
                    </div> : null
            }

            {
                sendEmail && (
                    <div class={style.alertparentemail}>
                        <div class={style.alertemail}>
                            <form onSubmit={(e) => {

                            }}>
                                <span className='d-flex email flex-row'>
                                    <p><b>To : </b></p><p className='ms-4 bg-light px-3' style={{
                                        borderRadius: '30px'
                                    }}>{emailTo}</p>

                                </span>
                                <input autoComplete='off' type='text' placeholder='Subject' />

                                <textarea name="Reason" id="" cols="30" rows="10" placeholder='Comment here' required />
                                <div className={`${style.alertbtns} mt-3 d-flex justify-content-center `}>
                                    <button type='submit' className={style.btn1}>Send</button>
                                    <button onClick={() => {
                                        setSendEmail(false);
                                    }} className={style.btn2}>Close</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button style={{
                                    marginLeft : '120px',
                                    marginTop : '25px'
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

export default Processes
