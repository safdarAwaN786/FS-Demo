import style from './AddUsers.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function AssignTabs() {

    const [selectedTabsArr, setSelectedTabsArr] = useState([]);
    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const [tabsArr1, setTabsArr1] = useState([]);
    const [tabsArr2, setTabsArr2] = useState([]);
    const [tabsArr3, setTabsArr3] = useState([]);
    const [tabsArr4, setTabsArr4] = useState([]);
    const [tabsArr5, setTabsArr5] = useState([]);
    const [tabsArr6, setTabsArr6] = useState([]);
    const [tabsArr7, setTabsArr7] = useState([]);
    const alertManager = () => {
        setalert(!alert)
    }
    const idToWatch = useSelector(state => state.idToProcess);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth?.user)

    // Tabs from where no functionality will be choosen..
    const tabsList1 = [
        { Tab: 'Process Records' },
        // Monthly Plan A
        { Tab: 'Audit Plan (Monthly)' },
        // Monthly Plan H
        { Tab: 'Create Monthly Training Plan' },
        // Form Records
        { Tab: 'Record Keeping' },
        { Tab: 'Conduct Audit' },
        // Reports Records
        { Tab: 'Non-Conformity Report' },
        // Corrective Action
        { Tab: 'Corrective Action Plan' },
        // Trainings Records
        { Tab: 'Conduct Trainings' },
        // Planned Trainings
        { Tab: 'Training Record' },
        { Tab: 'Pending Tasks' },
        { Tab: 'Completed Tasks' },
    ]

    // Tabs from where only  Creation functionality willl be choosen..

    const tabsList2 = [
        { Tab: 'Users Details' },
        { Tab: 'Departments' },
        { Tab: 'Companies' },
        // Generate MRM
        { Tab: 'Minutes of Meeting' },
        // Send Notification
        { Tab: 'Management Review Plan' },
        // Participants
        { Tab: 'Management Review Team' },
        // Processes
        { Tab: 'Define Process' },
        // Internal Auditors
        { Tab: 'Internal Auditor Management' },
        // Yearly Plan A
        { Tab: 'Audit Program (Yearly Plan)' },
        // Yearly Plan H
        { Tab: 'Create Yearly Training Plan' },
        // Employees
        { Tab: 'Employee Registration' },
        // Trainings
        { Tab: 'Add Trainings' },
        // Trainers
        { Tab: 'Add Trainers' },
        // Machinery
        { Tab: 'Master List of Machinery' },
        // Measuring Devices
        { Tab: 'Master List of Monitoring and Measuring Devices' },
    ]
    // Tabs where Creation and Approval functionality will be choosen

    const tabsList3 = [
        // Personal Rec
        {Tab : 'Employee Requisition'},
        // MWR Requests 
        {Tab : 'Generate MWR Corrective'},
        // Suppliers
        {Tab : 'Approved Supplier List'},
    ]


    // Tabs from where Creation, Approval, Review functionality willl be choosen..

    const tabsList4 = [
        // Change Requests
        { Tab: 'Document Change Creation' },
        // Upload Document
        { Tab: 'Upload Document Manually' },
    ]


    // Tabs from where   Creation, Approval and Edit functionality willl be choosen..
    const tabsList5 = [
        // Conduct HACCP
        { Tab: 'Conduct Risk Assessment' },
        // Process Details
        { Tab: 'Construct Flow Diagram' },
        // HACCP Teams
        { Tab: 'HACCP Team Management' },
        // Product Details
        { Tab: 'Describe Product' },
        // Checklist
        { Tab: 'Internal Audit Check List' },
        // Decision Tree
        { Tab: 'Identify CCP/OPRP' },
        // Food Safety Plan
        { Tab: 'Generate Food Safety Plan' },
    ]

    // Tabs from where   Creation, Approval, Review and Edit functionality willl be choosen..

    const tabsList6 = [
        // List of Documents
        { Tab: 'Master List of Documents' },
        
    ]
     // Tabs from where   Creation, Approval, Review, Edit and Verification of form answers functionality willl be choosen..
    const tabsList7 = [
        // list of forms
        { Tab: 'Master List of Records/Forms' },
    ]

    useEffect(() => {
        setSelectedTabsArr([...tabsArr1, ...tabsArr2, ...tabsArr3, ...tabsArr4, ...tabsArr5, ...tabsArr6, ...tabsArr7]);
    }, [tabsArr1, tabsArr2, tabsArr3, tabsArr4, tabsArr5, tabsArr6, tabsArr7])


    useEffect(() => {
        setDataToSend({  Tabs: selectedTabsArr })
    }, [selectedTabsArr])

    const makeRequest = () => {
        if (dataToSend.Tabs.length > 0) {
            dispatch(setSmallLoading(true));
            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/assign-tabs/${idToWatch}`, dataToSend).then(() => {
                dispatch(setSmallLoading(false));
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Users Details'}))
                    }
                })
            }).catch(err => {
                dispatch(setSmallLoading(false));
                Swal.fire({
                    icon : 'error',
                    title : 'OOps..',
                    text : 'Something went wrong, Try Again!'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Add At least one Team Member!',
                confirmButtonText: 'OK.'
            })
        }
    }



    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4  mx-lg-5`}>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Assign Tabs To User
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light py-5 px-lg-5 px-3`}>
                            <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                                <div className={style.spans}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className={`${style.heading} ms-3 `}>
                                    Available Tabs
                                </div>
                            </div>
                            <div className={`${style.headers2} bg-white py-4 px-lg-5 px-3`}>
                                {tabsList1.map((tab) => {
                                    return (
                                        <>

                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr1;

                                                    if (e.target.checked) {
                                                        updatedTabsArr1 = [...tabsArr1];
                                                        updatedTabsArr1.push(tab)
                                                    } else {
                                                        updatedTabsArr1 = tabsArr1.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr1(updatedTabsArr1)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                        </>
                                    )
                                })}

                                {tabsList2.map((tab) => {
                                    return (
                                        <>

                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr2;

                                                    if (e.target.checked) {
                                                        updatedTabsArr2 = [...tabsArr2];
                                                        updatedTabsArr2.push(tab)
                                                    } else {
                                                        updatedTabsArr2 = tabsArr2.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr2(updatedTabsArr2)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr2.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <input autoComplete='off' onChange={(e) => {
                                                        const updatedTabsArr2 = [...tabsArr2];
                                                        const foundObj = updatedTabsArr2.find(obj => obj.Tab === tab.Tab);
                                                        if (e.target.checked) {
                                                            foundObj[e.target.name] = true;
                                                        } else {
                                                            foundObj[e.target.name] = false;
                                                        }

                                                        setTabsArr2(updatedTabsArr2);
                                                    }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                    <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>

                                                </div>
                                            )}
                                        </>
                                    )
                                })}


                                {tabsList3.map((tab) => {
                                    return (
                                        <>

                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr3;

                                                    if (e.target.checked) {
                                                        updatedTabsArr3 = [...tabsArr3];
                                                        updatedTabsArr3.push(tab)
                                                    } else {
                                                        updatedTabsArr3 = tabsArr3.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr3(updatedTabsArr3)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr3.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr3 = [...tabsArr3];
                                                            const foundObj = updatedTabsArr3.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr3(updatedTabsArr3);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                        <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr3 = [...tabsArr3];
                                                            const foundObj = updatedTabsArr3.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr3(updatedTabsArr3);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-A`} name='Approval' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-A`}>Approval</label>
                                                    </div>
                                                    

                                                </div>
                                            )}
                                        </>
                                    )
                                })}
                                {tabsList4.map((tab) => {
                                    return (
                                        <>

                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr4;

                                                    if (e.target.checked) {
                                                        updatedTabsArr4 = [...tabsArr4];
                                                        updatedTabsArr4.push(tab)
                                                    } else {
                                                        updatedTabsArr4 = tabsArr4.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr4(updatedTabsArr4)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr4.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr4 = [...tabsArr4];
                                                            const foundObj = updatedTabsArr4.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr4(updatedTabsArr4);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                        <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr4 = [...tabsArr4];
                                                            const foundObj = updatedTabsArr4.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr4(updatedTabsArr4);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-A`} name='Approval' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-A`}>Approval</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr4 = [...tabsArr4];
                                                            const foundObj = updatedTabsArr4.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr4(updatedTabsArr4);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-R`} name='Review' autocomplete="off" />
                                                        <label className="btn btn-outline-primary" for={`${tab.Tab}-R`}>Review</label>
                                                    </div>

                                                </div>
                                            )}
                                        </>
                                    )
                                })}

                                {tabsList5.map((tab) => {
                                    return (
                                        <>

                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr5;

                                                    if (e.target.checked) {
                                                        updatedTabsArr5 = [...tabsArr5];
                                                        updatedTabsArr5.push(tab)
                                                    } else {
                                                        updatedTabsArr5 = tabsArr5.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr5(updatedTabsArr5)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr5.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr5 = [...tabsArr5];
                                                            const foundObj = updatedTabsArr5.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr5(updatedTabsArr5);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                        <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr5 = [...tabsArr5];
                                                            const foundObj = updatedTabsArr5.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr5(updatedTabsArr5);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-A`} name='Approval' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-A`}>Approval</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr5 = [...tabsArr5];
                                                            const foundObj = updatedTabsArr5.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr5(updatedTabsArr5);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-R`} name='Edit' autocomplete="off" />
                                                        <label className="btn btn-outline-warning" for={`${tab.Tab}-R`}>Edit</label>
                                                    </div>

                                                </div>
                                            )}
                                        </>
                                    )
                                })}
                                {tabsList6.map((tab) => {
                                    return (
                                        <>
                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr6;

                                                    if (e.target.checked) {
                                                        updatedTabsArr6 = [...tabsArr6];
                                                        updatedTabsArr6.push(tab)
                                                    } else {
                                                        updatedTabsArr6 = tabsArr6.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr6(updatedTabsArr6)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr6.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr6 = [...tabsArr6];
                                                            const foundObj = updatedTabsArr6.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr6(updatedTabsArr6);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                        <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr6 = [...tabsArr6];
                                                            const foundObj = updatedTabsArr6.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr6(updatedTabsArr6);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-A`} name='Approval' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-A`}>Approval</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr6 = [...tabsArr6];
                                                            const foundObj = updatedTabsArr6.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr6(updatedTabsArr6);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-R`} name='Review' autocomplete="off" />
                                                        <label className="btn btn-outline-primary" for={`${tab.Tab}-R`}>Review</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr6 = [...tabsArr6];
                                                            const foundObj = updatedTabsArr6.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr6(updatedTabsArr6);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-E`} name='Edit' autocomplete="off" />
                                                        <label className="btn btn-outline-warning" for={`${tab.Tab}-E`}>Edit</label>
                                                    </div>

                                                </div>
                                            )}
                                        </>
                                    )
                                })}
                                {tabsList7.map((tab) => {
                                    return (
                                        <>
                                            <div className='d-flex flex-row my-2'>
                                                <input autoComplete='off' onChange={(e) => {
                                                    var updatedTabsArr7;

                                                    if (e.target.checked) {
                                                        updatedTabsArr7 = [...tabsArr7];
                                                        updatedTabsArr7.push(tab)
                                                    } else {
                                                        updatedTabsArr7 = tabsArr7.filter((tabObj) => {
                                                            return (
                                                                tabObj.Tab !== tab.Tab
                                                            )
                                                        })
                                                    }
                                                    setTabsArr7(updatedTabsArr7)
                                                }} type='checkbox' className='mx-2' />
                                                <p style={{
                                                    fontFamily: 'Poppins'
                                                }}>{tab.Tab}</p>
                                            </div>
                                            {tabsArr7.some(obj => obj.Tab === tab.Tab) && (

                                                <div className='d-flex flex-row ps-3 mb-5 mt-2' >
                                                    <div className='mx-2'>
                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr7 = [...tabsArr7];
                                                            const foundObj = updatedTabsArr7.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr7(updatedTabsArr7);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-C`} name='Creation' autocomplete="off" />
                                                        <label className="btn btn-outline-danger" for={`${tab.Tab}-C`}>Creation</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr7 = [...tabsArr7];
                                                            const foundObj = updatedTabsArr7.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr7(updatedTabsArr7);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-A`} name='Approval' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-A`}>Approval</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr7 = [...tabsArr7];
                                                            const foundObj = updatedTabsArr7.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr7(updatedTabsArr7);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-R`} name='Review' autocomplete="off" />
                                                        <label className="btn btn-outline-primary" for={`${tab.Tab}-R`}>Review</label>
                                                    </div>
                                                    <div className='mx-2'>

                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr7 = [...tabsArr7];
                                                            const foundObj = updatedTabsArr7.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr7(updatedTabsArr7);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-E`} name='Edit' autocomplete="off" />
                                                        <label className="btn btn-outline-warning" for={`${tab.Tab}-E`}>Edit</label>
                                                    </div>
                                                    <div className='mx-2'>
                                                        <input autoComplete='off' onChange={(e) => {
                                                            const updatedTabsArr7 = [...tabsArr7];
                                                            const foundObj = updatedTabsArr7.find(obj => obj.Tab === tab.Tab);
                                                            if (e.target.checked) {
                                                                foundObj[e.target.name] = true;
                                                            } else {
                                                                foundObj[e.target.name] = false;
                                                            }

                                                            setTabsArr7(updatedTabsArr7);
                                                        }} type="checkbox" className="btn-check" id={`${tab.Tab}-V`} name='Verification' autocomplete="off" />
                                                        <label className="btn btn-outline-success" for={`${tab.Tab}-V`}>Verification</label>
                                                    </div>

                                                </div>
                                            )}
                                        </>
                                    )
                                })}
                            </div>

                        <div className={`${style.btn} px-lg-4 w-100 px-2 d-flex  justify-content-end`}>
                            <button type='submit' className='me-5' >Submit</button>
                        </div>

                        </div>


                    </form>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }} className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AssignTabs
