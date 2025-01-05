
import style from './AddDepartments.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { FaMinus } from 'react-icons/fa'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function AddDepartments() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [companies, setCompanies] = useState(null);
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-companies`, { headers: { Authorization: `${user.Department._id}` } }).then((res) => {
            setCompanies(res.data.data);
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

    const addDepartment = () => {
        const updatedDepartments = [...departments];
        updatedDepartments.push({});
        setDepartments(updatedDepartments);
    };
    const clearLastDepartment = () => {
        if (departments.length > 0) {
            const updatedDepartments = [...departments];
            updatedDepartments.pop(); // Remove the last element
            setDepartments(updatedDepartments);
        }
    };

    const updateDepartments = (event, index) => {
        const updatedDepartments = [...departments];
        // Update the existing object at the specified index
        updatedDepartments[index][event.target.name] = event.target.value;
        setDepartments(updatedDepartments);
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, Departments: departments });
    }, [departments])
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const alertManager = () => {
        setalert(!alert)
    }

    const makeRequest = () => {
        if (dataToSend.Departments.length !== 0) {
            dispatch(setSmallLoading(true));
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-department`, dataToSend, { headers: { Authorization: `${user.Department._id}` } }).then(() => {
                dispatch(setSmallLoading(false));
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Departments'}))
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
                text: 'Kindly Add at least one Department',
                confirmButtonText: 'OK.'
            })
        }
    }



    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row px-lg-5 mx-lg-5 px-2 mx-2 my-1'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({...tabData, Tab : 'Departments'}))
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
                            Add Departments
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <select className='form-select  form-select-lg' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} value={dataToSend?.Company} name='Company' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Select Company</option>
                                                {companies?.map((company) => {
                                                    return (
                                                        <option value={company._id}>{company.CompanyName}</option>
                                                    )
                                                })}

                                            </select>

                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>
                                    

                                </div>
                            </div>



                            {departments?.map((department, index) => {
                                return (

                                    <div className='bg-white py-4   m-lg-5 m-2 p-3 '>
                                        <div className='d-flex justify-content-center'>

                                            <div className='mx-lg-4 mx-md-3 mx-2'>
                                                <input autoComplete='off' value={department.DepartmentName} onChange={(event) => {
                                                    updateDepartments(event, index)
                                                }} name='DepartmentName' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Department Name' required />
                                                <input autoComplete='off' value={department.ShortName} onChange={(event) => {
                                                    updateDepartments(event, index)
                                                }} name='ShortName' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Department Short Name' required />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className='d-flex justify-content-center p-5'>
                                <a onClick={addDepartment} className='btn btn-outline-danger py-2 fs-4 w-50'>Add Department</a>
                                {departments?.length > 0 && (
                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',
                                    }} onClick={clearLastDepartment} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
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
                                        <option value="" selected >Added Departments</option>
                                        {departments?.map((dep) => {
                                            return (
                                                <option disabled>{dep.DepartmentName}</option>
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

export default AddDepartments
