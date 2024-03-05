import style from './AddProcessDetails.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { FaMinus } from 'react-icons/fa'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function UpdateProcessDetails() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [processes, setProcesses] = useState([]);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);
    const idToWatch = useSelector(state => state.idToProcess);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
            if (processes) {
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
    }, [])

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-process/${idToWatch}`).then((res) => {
            setDataToSend(res.data.data);
            setProcesses(res.data.data?.ProcessDetails);
            if (departmentsToShow) {
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
    }, [])

    const addProcess = () => {
        const updatedProcesses = [...processes];
        updatedProcesses.push({ subProcesses: [], ProcessNum: updatedProcesses.length + 1 });
        setProcesses(updatedProcesses);

    };
    const clearLastProcess = () => {
        if (processes.length > 0) {
            const updatedProcesses = [...processes];
            updatedProcesses.pop(); // Remove the last element
            setProcesses(updatedProcesses);
        }
    };

    const updateProcesses = (event, index) => {
        const updatedProcesses = [...processes];

        // Update the existing object at the specified index
        updatedProcesses[index][event.target.name] = event.target.value;

        setProcesses(updatedProcesses);
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, ProcessDetails: processes });
    }, [processes])

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])



    const alertManager = () => {
        setalert(!alert)
    }




    const makeRequest = () => {
        if (dataToSend.ProcessDetails.length !== 0) {
            dispatch(setSmallLoading(true))
            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/update-process/${idToWatch}`, { ...dataToSend, updatedBy: user.Name }).then(() => {
                setDataToSend(null);

                dispatch(setSmallLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Construct Flow Diagram' }))
                    }
                })

            }).catch(err => {
                dispatch(setSmallLoading(false));
                console.log(err);
                if (err.response.status === 401) {
                    Swal.fire({
                        icon: 'error',
                        title: 'OOps..',
                        text: err.response.data.message
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'OOps..',
                        text: 'Something went wrong, Try Again!'
                    })
                }
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Add at least one Process',
                confirmButtonText: 'OK.'
            })
        }
    }






    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Construct Flow Diagram' }))
                                }
                            }} />

                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Update Flow Diagram
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    {/* <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Document Type</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <select className='form-select  form-select-lg' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} value={dataToSend?.DocumentType} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Type</option>
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>

                                            </select>

                                        </div>
                                    </div> */}
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p><p style={{
                                                fontFamily: "Poppins"
                                            }} className='fw-bold'>Process Name</p></p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <input autoComplete='off' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} style={{
                                                fontFamily: 'Poppins'
                                            }} rows={4} value={dataToSend?.ProcessName} name='ProcessName' className='text-dark w-100 border-0 p-2' placeholder='Process Name' required />
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    {/* <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Department</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <select className='form-select  form-select-lg' value={dataToSend?.Department} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} name='Department' style={{ width: "100%" }} required>
                                                <option value="" selected disabled>Choose Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}

                                            </select>


                                        </div>
                                    </div> */}

                                </div>
                            </div>



                            {processes?.map((process, index) => {
                                return (
                                    <div className='bg-white py-4   m-lg-5 m-2 p-3 '>
                                        <div className='d-flex justify-content-center'>
                                            <div className='mx-lg-4 mx-md-3 mx-2'>
                                                <p className='text-center fw-bold'>({process.ProcessNum})</p>
                                                <input autoComplete='off' value={process.Name} onChange={(event) => {
                                                    updateProcesses(event, index)
                                                }} name='Name' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Process Name' required />
                                                <textarea value={process.Description} onChange={(event) => {
                                                    updateProcesses(event, index)
                                                }} name='Description' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Process Description' />
                                            </div>
                                        </div>
                                        {process.subProcesses?.map((subProcess, i) => {
                                            return (
                                                <div className='d-flex justify-content-center'>
                                                    <div className='mx-lg-4 mx-md-3 mx-2'>
                                                        <p className='text-center fw-bold'>({subProcess.ProcessNum})</p>
                                                        <input autoComplete='off' value={subProcess.Name} onChange={(event) => {
                                                            const updatedProcesses = [...processes];
                                                            // Update the existing object at the specified index
                                                            updatedProcesses[index].subProcesses[i][event.target.name] = event.target.value;

                                                            setProcesses(updatedProcesses);
                                                        }} name='Name' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Process Name' required />
                                                        <textarea value={subProcess.Description} onChange={(event) => {
                                                            const updatedProcesses = [...processes];
                                                            // Update the existing object at the specified index
                                                            updatedProcesses[index].subProcesses[i][event.target.name] = event.target.value;

                                                            setProcesses(updatedProcesses);
                                                        }} name='Description' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Process Description' />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <div className='d-flex justify-content-center p-5'>
                                            <a onClick={() => {
                                                const updatedProcesses = [...processes];
                                                updatedProcesses[index].subProcesses.push({ ProcessNum: `${index + 1}.${updatedProcesses[index].subProcesses.length + 1}` });
                                                setProcesses(updatedProcesses);
                                            }} className='btn btn-outline-danger py-1 fs-5 w-50'>Add SubProcess</a>
                                            {process.subProcesses?.length > 0 && (
                                                <a style={{
                                                    borderRadius: '100px',
                                                    width: '40px',
                                                    height: '40px',
                                                }} onClick={() => {
                                                    if (process.subProcesses.length > 0) {
                                                        const updatedProcesses = [...processes];
                                                        updatedProcesses[index].subProcesses.pop();
                                                        setProcesses(updatedProcesses);
                                                    }
                                                }} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            <div className='d-flex justify-content-center p-5'>
                                <a onClick={addProcess} className='btn btn-outline-danger py-2 fs-4 w-50'>Add Process</a>
                                {processes?.length > 0 && (
                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',
                                    }} onClick={clearLastProcess} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                )}
                            </div>
                        </div>


                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-between`}>
                            <div className={style.inputParent}>
                                <div className={style.para}>
                                    <p></p>
                                </div>
                                <div className='border w-50 border-dark-subtle'>
                                    <select className='w-100 form-select  form-select-lg' name='Department'  >
                                        <option value="" selected >Added Processes</option>

                                        {processes?.map((process) => {

                                            return (

                                                <option disabled>{process.Name}</option>
                                            )
                                        })}


                                    </select>


                                </div>
                            </div>
                            <button type='submit' >Submit</button>
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

export default UpdateProcessDetails




