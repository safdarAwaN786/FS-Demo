import style from './Devices.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { FiFilter } from 'react-icons/fi';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux'
import { updateTabData } from '../../redux/slices/tabSlice'
import { changeCallibrationType, changeDateType } from '../../redux/slices/appSlice'
import { changeId } from '../../redux/slices/idToProcessSlice'
import { setSmallLoading } from '../../redux/slices/loading'
import Swal from 'sweetalert2'

function Devices() {
    const [devices, setDevices] = useState(null);
    const [selected, setSelected] = useState('Internal')
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const [callibrations, setCallibrations] = useState(null);
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllEquipment`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setAllDataArr(res.data.data);
            setDevices(res.data.data.slice(startIndex, endIndex));
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllCalibration`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setCallibrations(res.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            console.log(err);
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, []);

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }
    useEffect(() => {
        setDevices(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])

    const searchFunction = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.equipmentName.includes(event.target.value) || obj.equipmentCode.includes(event.target.value)
            )
            setDevices(searchedList);
        } else {
            setDevices(allDataArr?.slice(startIndex, endIndex))
        }
    }

    const [popUpData, setPopUpData] = useState(null)
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }

    return (
        <>

            <div className={`${style.searchbar} `}>
                <div className={style.sec1}>
                    <img src={search} alt="" />
                    <input autoComplete='off' onChange={searchFunction} type="text" placeholder='Search Measuring Device by name or code' />
                </div>
                <div className='d-flex flex-row'>

                    <DropdownButton className={` mx-3 px-3`} title={<span className={`btn bg-light text-primary`}><FiFilter /> Filter</span>}>
                        <Dropdown.Item className={selected === 'Internal' && "bg-primary text-light"} onClick={() => {
                            setSelected('Internal')
                        }}><p  >Internal</p></Dropdown.Item>
                        <Dropdown.Item className={selected === 'External' && "bg-primary text-light"} onClick={() => {
                            setSelected('External')
                        }} ><p >External</p></Dropdown.Item>

                    </DropdownButton>
                    {tabData?.Creation && (


                        <div onClick={() => {
                            dispatch(updateTabData({ ...tabData, Tab: 'addDevice' }));
                        }} className={style.sec2}>
                            <img src={add} alt="" />
                            <p>Add Device</p>
                        </div>
                    )}
                </div>
            </div>
            <div className={style.tableParent}>
                {!devices || devices?.length === 0 ? (
                    <div className='w-100 d-flex align-items-center justify-content-center'>
                        <p className='text-center'>No any Records Available here.</p>
                    </div>
                ) : (

                    <div className={style.tables}>
                        <table class="table my-custom-table">
                            <thead className='table-light'>
                                <tr className={style.font}>
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


                                </tr>
                                <tr className={style.font}>
                                    {/* <th className={`${style.textLight}`} scope="col">Machinery Id</th> */}
                                    <th className={`${style.textLight}`} scope="col">Machinery Name</th>
                                    <th className={`${style.textLight}`} scope="col">Machinery Location</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Callibration</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Callibration</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Callibration</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Callibration</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>
                                    <th className={`${style.textLight}`} scope="col">Status</th>
                                    <th className={`${style.textLight}`} scope="col">Callibration</th>
                                    <th className={`${style.textLight}`} scope="col">Records</th>
                                    <th className='px-4' scope="col"> </th>

                                </tr>
                            </thead>
                            <tbody>
                                {devices?.map((device, i) => {

                                    return (
                                        <>
                                            <tr class={style.bodyrow} key={i}>
                                                {/* <td scope="row"><p style={{
                                                    backgroundColor: '#dddddd',
                                                    width: '50px',
                                                    borderRadius: '10px',
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins',
                                                }}>{device.equipmentCode}</p></td> */}
                                                <td><p>{device.equipmentName}</p></td>
                                                <td><p>{device.equipmentLocation}</p></td>
                                                <td></td>
                                                {device.callibration[selected]?.Daily ? (
                                                    <>
                                                        <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                        <td><button className={`${style.mybtn} btn ${(callibrations?.find(obj => obj.Equipment._id == device._id && obj.dateType === 'Daily' && obj.callibrationType === selected && obj.nextCallibrationDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} `} onClick={() => {
                                                            dispatch(changeDateType('Daily'))
                                                            dispatch(changeId(device._id))

                                                            setPopUpData(device.callibration[selected].Daily);
                                                            alertManager();
                                                        }}>Start</button></td>
                                                        <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {

                                                            dispatch(changeId(device._id))
                                                            dispatch(changeDateType('Daily'))

                                                            dispatch(changeCallibrationType(selected))

                                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCallibration' }))

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
                                                {device.callibration[selected]?.Weekly ? (
                                                    <>


                                                        <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                        <td><button className={`${style.mybtn} btn ${(callibrations?.find(obj => obj.Equipment._id == device._id && obj.dateType === 'Weekly' && obj.callibrationType === selected && obj.nextCallibrationDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} `} onClick={() => {

                                                            dispatch(changeDateType('Weekly'))
                                                            dispatch(changeId(device._id))
                                                            setPopUpData(device.callibration[selected].Weekly);
                                                            alertManager();
                                                        }}>Start</button></td>
                                                        <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                            dispatch(changeId(device._id))

                                                            dispatch(changeDateType('Weekly'))
                                                            dispatch(changeCallibrationType(selected))

                                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCallibration' }))

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

                                                {device.callibration[selected]?.Monthly ? (
                                                    <>


                                                        <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                        <td><button className={`${style.mybtn} btn ${(callibrations?.find(obj => obj.Equipment._id == device._id && obj.dateType === 'Monthly' && obj.callibrationType === selected && obj.nextCallibrationDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} `} onClick={() => {

                                                            dispatch(changeDateType('Monthly'));
                                                            dispatch(changeId(device._id))
                                                            setPopUpData(device.callibration[selected].Monthly);
                                                            alertManager();
                                                        }}>Start</button></td>
                                                        <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                            dispatch(changeId(device._id))

                                                            dispatch(changeDateType('Monthly'));
                                                            dispatch(changeCallibrationType(selected))

                                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCallibration' }))

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
                                                {device.callibration[selected]?.Quarterly ? (
                                                    <>


                                                        <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                        <td><button className={`${style.mybtn} btn ${(callibrations?.find(obj => obj.Equipment._id == device._id && obj.dateType === 'Quarterly' && obj.callibrationType === selected && obj.nextCallibrationDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} `} onClick={() => {

                                                            dispatch(changeDateType('Quarterly'))
                                                            dispatch(changeId(device._id))
                                                            setPopUpData(device.callibration[selected].Quarterly);
                                                            alertManager();
                                                        }}>Start</button></td>
                                                        <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                            dispatch(changeId(device._id))

                                                            dispatch(changeDateType('Quarterly'))
                                                            dispatch(changeCallibrationType(selected))

                                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCallibration' }))

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

                                                {device.callibration[selected]?.Yearly ? (
                                                    <>


                                                        <td><div className={` text-center ${style.greenStatus} `}><p >Selected</p></div></td>
                                                        <td><button className={`${style.mybtn} btn ${(callibrations?.find(obj => obj.Equipment._id == device._id && obj.dateType === 'Yearly' && obj.callibrationType === selected && obj.nextCallibrationDate.slice(0, 10) == formattedDate)) ? ' btn-danger ' : 'btn-outline-primary'} `} onClick={() => {

                                                            dispatch(changeDateType('Yearly'))
                                                            dispatch(changeId(device._id))
                                                            setPopUpData(device.callibration[selected].Yearly);
                                                            alertManager();
                                                        }}>Start</button></td>
                                                        <td><button className={`${style.mybtn} btn btn-outline-primary`} onClick={() => {
                                                            dispatch(changeId(device._id))
                                                            dispatch(changeDateType('Yearly'))
                                                            dispatch(changeCallibrationType(selected))

                                                            dispatch(updateTabData({ ...tabData, Tab: 'viewCallibration' }));


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




                                            </tr>

                                        </>
                                    )
                                })}

                            </tbody>
                        </table>

                    </div>
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
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                        <div className='overflow-y-handler'>
                            <p class={style.msg}>{popUpData}</p>
                        </div>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    dispatch(changeCallibrationType(selected))

                                    dispatch(updateTabData({ ...tabData, Tab: 'startCallibration' }))
                                }} className={style.btn1}>Initiate</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default Devices
