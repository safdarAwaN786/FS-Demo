import style from './GenerateMWR.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import arrow from '../../assets/images/addEmployee/arrow.svg'
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function GenerateMWR() {
    const [submitAlert, setSubmitAlert] = useState(false);
    const [area, setarea] = useState(false)
    const [code, setcode] = useState(false)
    const [pri, setpri] = useState(false)
    const [alert, setalert] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const alertManager = () => {
        setalert(!alert)
    }
    const [discipline, setDiscipline] = useState([]);
    const [formValues, setFormValues] = useState({});
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    const updateFormFiles = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.files[0] })
    }

    const [machineries, setMachineries] = useState(null);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readAllMachinery`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setMachineries(res.data.data);
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

    const updateDiscipline = (e) => {
        if (e.target.checked) {
            if (!discipline?.includes(e.target.value)) {

                const updatedDiscipline = [...discipline, e.target.value];
                setDiscipline(updatedDiscipline);

            }
        } else {
            const indexToRemove = discipline.indexOf(e.target.value)
            if (indexToRemove !== -1) {
                const updatedDiscipline = discipline.filter((value, index) => index !== indexToRemove);
                setDiscipline(updatedDiscipline);
            }
        }
    }

    const updateFormValues = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }


    const handleImageClick = () => {
        fileInputRef.current.click(); // Trigger the click event on the file input
    };
    const fileInputRef = useRef(null);



    const convertStateToFormData = (state) => {
        const formData = new FormData();

        // Iterate through the state object
        for (const key in state) {
            if (state.hasOwnProperty(key)) {
                const value = state[key];

                // Append text values directly to FormData
                if (typeof value === 'string') {
                    formData.append(key, value);
                }

                // Append file objects to FormData
                if (value instanceof File) {
                    formData.append(key, value, value.name);
                }


                // Handle arrays by converting them to a string
                if (Array.isArray(value)) {
                    formData.append(key, JSON.stringify(value));
                }
            }
        }

        return formData;
    }

    const makeRequest = () => {
        const formData = convertStateToFormData(formValues);
        dispatch(setSmallLoading(true))
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/createWorkRequest`, formData, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            dispatch(setSmallLoading(false))
            Swal.fire({
                title: 'Success',
                text: 'Submitted Successfully',
                icon: 'success',
                confirmButtonText: 'Go!',
            }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(updateTabData({ ...tabData, Tab: 'Generate MWR Corrective' }))
                }
            })
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }



    return (
        <>

                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle
                        role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Generate MWR Corrective' }))
                            }
                        }} />

                </div>
                <div className={`${style.headers} mt-1 `}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.para}>
                        Generate MWR
                    </div>

                </div>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    console.log(formValues);
                    console.log(discipline)
                    setFormValues({ ...formValues, Discipline: discipline });
                    if (formValues.Area && formValues.Priority && formValues.MachineId && discipline.length !== 0 && formValues.mwrImage) {
                        setPopUpData('Do you want to submit the data ?')
                        setSubmitAlert(true)
                    } else {
                        setPopUpData('Kindly provide all required data above including Image.');
                        setalert(true);
                    }
                }}>
                    <div className={style.form}>
                        <div className={style.sec1}>
                            <div>
                                <p className='mt-2'>Area</p>
                                <div onClick={() => {
                                    setarea(!area)
                                }} className={style.dropdownfield}>
                                    <p>{formValues?.Area}</p>
                                    <img className={area ? style.rotate : null} src={arrow} alt="" />
                                </div>
                            </div>
                            {area ?
                                <div className={style.droper}>
                                    <p onClick={() => {
                                        setFormValues({ ...formValues, Area: 'Area 1' });
                                        setarea(false)
                                    }} className={style.optStyle}>Area 1</p>
                                    <p onClick={() => {
                                        setFormValues({ ...formValues, Area: 'Area 2' });
                                        setarea(false)
                                    }} className={style.optStyle}>Area 2</p>
                                    <p onClick={() => {
                                        setFormValues({ ...formValues, Area: 'Area 3' });
                                        setarea(false)
                                    }} className={style.optStyle}>Area 3</p>

                                </div> : null
                            }
                            <div >
                                <p className='mt-2'>Priority</p>
                                <div onClick={() => {
                                    setpri(!pri)
                                }} className={style.dropdownfield}>
                                    <p>{formValues?.Priority}</p>
                                    <img className={pri ? style.rotate : null} src={arrow} alt="" />
                                </div>
                            </div>
                            {pri ?
                                <div className={style.droper}>
                                    <div onClick={() => {
                                        setFormValues({ ...formValues, Priority: 'A' });
                                        setpri(false)
                                    }}>

                                        <p  >A-Emergency Job</p>
                                    </div>
                                    <div onClick={() => {
                                        setFormValues({ ...formValues, Priority: 'B' });
                                        setpri(false)
                                    }}>

                                        <p >B-Urgent Job</p>
                                    </div>
                                    <div onClick={() => {
                                        setFormValues({ ...formValues, Priority: 'C' });
                                        setpri(false);
                                    }}>

                                        <p >C-Maintainance Job within 8 days</p>
                                    </div>
                                    <div onClick={() => {
                                        setFormValues({ ...formValues, Priority: 'D' });
                                        setpri(false)
                                    }}>

                                        <p >D-General purpose within 7 days
                                            or more</p>
                                    </div>
                                </div> : null
                            }
                            <div >
                                <p className='mt-2'>
                                    Description of work
                                </p>
                                <textarea name='Description' onChange={updateFormValues} type="text" required />
                            </div>
                        </div>
                        <div className={style.sec2}>
                            <div >
                                <p className='mt-2'>Machine Code</p>
                                <div onClick={() => {
                                    setcode(!code)
                                }} className={style.dropdownfield}>
                                    <p>{formValues?.MachineCode}</p>
                                    <img className={code ? style.rotate : null} src={arrow} alt="" />
                                </div>
                            </div>
                            {code ?
                                <div className={style.droper}>
                                    {machineries?.map((machine) => {

                                        return (
                                            <p onClick={() => {
                                                setFormValues({
                                                    ...formValues, MachineCode: machine.machineCode,
                                                    MachineId: machine._id
                                                });
                                                setcode(false);
                                            }} className={style.optStyle}>{machine.machineCode}</p>
                                        )
                                    })}

                                </div> : null
                            }
                            <div>
                                <p className='mt-2'>Discipline</p>
                                <div className={style.dropdownfield}>


                                </div>
                            </div>

                            <div className={style.droper}>
                                <div>
                                    <input value='Mechenical' onChange={updateDiscipline} type="checkbox" />
                                    <p >Mechanical</p>
                                </div>
                                <div>
                                    <input value='Electrical' onChange={updateDiscipline} type="checkbox" />
                                    <p >Electrical</p>
                                </div>

                                <div>
                                    <input value='Insulation & Paint' onChange={updateDiscipline} type="checkbox" />
                                    <p >Insulation & Paint</p>
                                </div>
                                <div>
                                    <input value='Carpentary' onChange={updateDiscipline} type="checkbox" />
                                    <p >Carpentary</p>
                                </div>
                                <div>
                                    <input value='Civil' onChange={updateDiscipline} type="checkbox" />
                                    <p >Civil</p>
                                </div>
                            </div>

                            <div>
                                <p className='mt-2'>
                                    Special Instruction
                                </p>
                                <textarea name='SpecialInstruction' onChange={updateFormValues} type="text" required />
                            </div>
                        </div>
                    </div>
                    <div className={style.btnparent}>
                        <p>Image</p>
                        <a onClick={handleImageClick} className={`${style.download} btn btn-outline-danger`}>{formValues?.mwrImage?.name?.slice(0, 15) || 'Upload'}</a>
                        <input
                            type="file"
                            id="file-input"
                            name='mwrImage'
                            accept='.jpg, .jpeg, .png'
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={updateFormFiles}
                            required
                        />
                    </div>
                    <div className={style.resbtns}>
                        <button type='submit' className={`${style.submit} px-3 py-2 btn btn-danger`} >Submit</button>
                    </div>

                </form>

            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>

                                <button onClick={alertManager} className={style.btn2}>OK.</button>

                            </div>
                        </div>
                    </div> : null
            }
            {
                submitAlert ?
                    <div class={style.alertparent}>
                        <div class={`bg-light p-3`}>
                            <p class={style.msg}>{popUpData}</p>
                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    makeRequest()
                                    setSubmitAlert(false)
                                }} className={style.btn2}>Submit</button>
                                <button onClick={() => {
                                    setSubmitAlert(false);
                                }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default GenerateMWR
