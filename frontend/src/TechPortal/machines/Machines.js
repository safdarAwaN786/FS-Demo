import style from './Machines.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { changeDateType } from '../../redux/slices/appSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'


function Machines() {
    const [machinaries, setMachineries] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const [maintenances, setMaintenances] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();


    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/getAllMaintenanceRecords`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setMaintenances(res.data.data);
            if (machinaries) {
                dispatch(setSmallLoading(false))
            }
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllMachinery`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setAllDataArr(res.data.data);
            setMachineries(res.data.data.slice(startIndex, endIndex));

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

    const [popUpData, setPopUpData] = useState(null)

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setMachineries(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const searchFunction = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.machineName.includes(event.target.value) || obj.machineCode.includes(event.target.value)
            )
            console.log(searchedList);
            setMachineries(searchedList);
        } else {
            setMachineries(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }



    return (
        <>
            <div className={style.searchbar}>
                <div className={style.sec1}>
                    <img src={search} alt="" />
                    <input autoComplete='off' onChange={searchFunction} type="text" placeholder='Search Machinery by name or code' />
                </div>
                {tabData?.Creation && (

                    <div onClick={() => {
                        dispatch(updateTabData({ ...tabData, Tab: 'addMachine' }))
                    }} className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Add Machinery</p>
                    </div>
                )}
            </div>
            <div className={style.tableParent}>
                {!machinaries || machinaries?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (
                    <div className={style.tables}>

                        <table class="table my-custom-table">
                            <thead >
                                <tr className={`${style.font} `}>
                                    {/* <th scope="col"></th> */}
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col "><p className={`fs-6 ${style.textLight}`}>Daily</p></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col "><p className={`fs-6 ${style.textLight}`}>Weekly</p></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col "><p className={`fs-6 ${style.textLight}`}>Monthly</p></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"><p className={`fs-6 ${style.textLight}`}>Quarterly</p></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col "><p className={`fs-6 ${style.textLight}`}>Yearly</p></th>
                                    <th scope="col"></th>
                                    <th scope="col"></th>
                                    <th scope="col "><p className={`fs-6 ${style.textLight}`}>Corrective</p></th>

                                </tr>
                                <tr className={style.font}>
                                    {/* <th className={`${style.textLight}`} scope="col">Machinery Id</th> */}
                                    <th className={`${style.textLight}`} scope="col">Machinery Name</th>
                                    <th className={`${style.textLight}`} scope="col">Machinery Location</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Maintenance</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Maintenance</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Maintenance</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Maintenance</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Maintenance</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={style.textLight} scope='col'></th>
                                </tr>
                            </thead>
                            <tbody>
                                {machinaries?.map((machine, i) => {
                                    const object = maintenances?.find(obj => obj.Machinery._id === machine._id && obj.dateType === 'Daily' && obj.nextMaintainanceDate == formattedDate)

                                    return (
                                        <tr class={style.bodyrow} key={i}>
                                            {/* <td scope="row"><p style={{
                                                    backgroundColor: '#dddddd',
                                                    width: '50px',
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins',
                                                }}>{machine.machineCode}</p></td> */}
                                            <td><p>{machine.machineName}</p></td>
                                            <td><p>{machine.machinaryLocation}</p></td>
                                            <td></td>
                                            {machine.maintenanceFrequency.Daily ? (
                                                <>
                                                    <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} ${(maintenances?.find(obj => obj.Machinery._id == machine._id && obj.dateType === 'Daily' && obj.nextMaintainanceDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} btn `} onClick={() => {
                                                        dispatch(changeDateType('Daily'))

                                                        dispatch(changeId(machine._id))

                                                        setPopUpData(machine.maintenanceFrequency.Daily);
                                                        alertManager();
                                                    }}>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                        dispatch(changeId(machine._id))
                                                        dispatch(changeDateType('Daily'))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'viewMaintenance' }))


                                                    }}>View</button></td>
                                                </>
                                            ) : (
                                                <>


                                                    <td><div className={` text-center ${style.redStatus} `}><p >Not Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>View</button></td>
                                                </>
                                            )}
                                            <td></td>
                                            {machine.maintenanceFrequency.Weekly ? (
                                                <>


                                                    <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn ${(maintenances?.find(obj => obj.Machinery._id == machine._id && obj.dateType === 'Weekly' && obj.nextMaintainanceDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'}`} onClick={() => {
                                                        dispatch(changeDateType('Weekly'))
                                                        dispatch(changeId(machine._id))
                                                        setPopUpData(machine.maintenanceFrequency.Weekly);
                                                        alertManager();
                                                    }}>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                        dispatch(changeId(machine._id))
                                                        dispatch(changeDateType('Weekly'))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'viewMaintenance' }))
                                                    }}>View</button></td>
                                                </>
                                            ) : (
                                                <>


                                                    <td><div className={` text-center ${style.redStatus} `}><p >Not Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>View</button></td>
                                                </>
                                            )}
                                            <td></td>
                                            {machine.maintenanceFrequency.Monthly ? (
                                                <>


                                                    <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn ${(maintenances?.find(obj => obj.Machinery._id == machine._id && obj.dateType === 'Monthly' && obj.nextMaintainanceDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'}`} onClick={() => {
                                                        dispatch(changeDateType('Monthly'))
                                                        dispatch(changeId(machine._id))
                                                        setPopUpData(machine.maintenanceFrequency.Monthly);
                                                        alertManager();
                                                    }}>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                        dispatch(changeId(machine._id))
                                                        dispatch(changeDateType('Monthly'))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'viewMaintenance' }))
                                                    }}>View</button></td>
                                                </>
                                            ) : (
                                                <>


                                                    <td><div className={` text-center ${style.redStatus} `}><p >Not Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>View</button></td>
                                                </>
                                            )}
                                            <td></td>
                                            {machine.maintenanceFrequency.Quarterly ? (
                                                <>


                                                    <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn ${(maintenances?.find(obj => obj.Machinery._id == machine._id && obj.dateType === 'Quarterly' && obj.nextMaintainanceDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'}`} onClick={() => {
                                                        dispatch(changeDateType('Quarterly'))
                                                        dispatch(changeId(machine._id))
                                                        setPopUpData(machine.maintenanceFrequency.Quarterly);
                                                        alertManager();
                                                    }}>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                        dispatch(changeId(machine._id))
                                                        dispatch(changeDateType('Quarterly'))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'viewMaintenance' }))
                                                    }}>View</button></td>
                                                </>
                                            ) : (
                                                <>


                                                    <td><div className={` text-center ${style.redStatus} `}><p >Not Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>View</button></td>
                                                </>
                                            )}
                                            <td></td>
                                            {machine.maintenanceFrequency.Yearly ? (
                                                <>


                                                    <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn ${(maintenances?.find(obj => obj.Machinery._id == machine._id && obj.dateType === 'Yearly' && obj.nextMaintainanceDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'}`} onClick={() => {
                                                        dispatch(changeDateType('Yearly'))
                                                        dispatch(changeId(machine._id))
                                                        setPopUpData(machine.maintenanceFrequency.Yearly);
                                                        alertManager();
                                                    }}>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                        dispatch(changeId(machine._id))
                                                        dispatch(changeDateType('Yearly'))
                                                        dispatch(updateTabData({ ...tabData, Tab: 'viewMaintenance' }))
                                                    }}>View</button></td>
                                                </>
                                            ) : (
                                                <>


                                                    <td><div className={` text-center ${style.redStatus} `}><p >Not Selected</p></div></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>Start</button></td>
                                                    <td><button className={`${style.mybtn} btn btn-outline-primary`} disabled>View</button></td>
                                                </>
                                            )}
                                            <td></td>
                                            <td><button onClick={() => {
                                                dispatch(changeId(machine._id))
                                                dispatch(updateTabData({ ...tabData, Tab: 'viewCorrectiveMaintenance' }))

                                            }} className={`${style.mybtn} btn btn-outline-primary`} >View</button></td>


                                        </tr>
                                    )
                                })}

                            </tbody>
                        </table>

                    </div>
                )}
            </div>
            <div className={style.next}>
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
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <div className='overflow-y-handler'>
                                <p class={style.msg}>{popUpData}</p>
                            </div>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(updateTabData({ ...tabData, Tab: 'startMaintenance' }))

                                }} className={style.btn1}>Initiate</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default Machines
