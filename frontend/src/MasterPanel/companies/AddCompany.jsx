import style from './AddCompany.module.css'
import { useState } from 'react'
import axios from "axios";
import man from '../../assets//images/hrprofile/man.svg'
import profile from '../../assets/images/addEmployee/prof.svg'
import Phone from '../../assets/images/employeeProfile/Phone.svg'
import Swal from 'sweetalert2'
import mail from '../../assets/images/hrprofile/mail.svg'
import Location from '../../assets/images/employeeProfile/Location.svg'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function AddCompany() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const alertManager = () => {
        setalert(!alert)
    }
    const user = useSelector(state => state.auth.user);
    const makeRequest = () => {
        if (dataToSend) {
            dispatch(setLoading(true));
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-company`, dataToSend, { headers: { Authorization: `${user._id}` } }).then(() => {
                setDataToSend(null);
                dispatch(setLoading(false));
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Companies' }));
                    }
                })
            }).catch((error) => {
                dispatch(setLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Somethinh Went Wrong, Try Again !',
                    confirmButtonText: 'OK.'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Try filling data again',
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
                                dispatch(updateTabData({ ...tabData, Tab: 'Companies' }));
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
                            Add Company
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.target);
                        setDataToSend(formData);
                        alertManager();


                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>

                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input name='CompanyName' className='text-dark' type='text' placeholder='Company Name' required />
                                            <img style={{
                                                width: '20px'
                                            }} src={profile} />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input name='PhoneNo' className='text-dark' type='number' placeholder='Company Phone Number' required />
                                            <img style={{
                                                width: '20px'
                                            }} src={Phone} />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input name='Email' className='text-dark' type='email' placeholder='Company Email' required />
                                            <img style={{
                                                width: '20px'
                                            }} src={mail} />
                                        </div>
                                    </div>





                                </div>
                                <div className={style.sec2}>

                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input name='ShortName' className='text-dark' type='text' placeholder='Company Short Name' required />
                                            <img style={{
                                                width: '20px'
                                            }} src={man} />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input name='Address' className='text-dark' type='text' placeholder='Company Address' required />
                                            <img style={{
                                                width: '20px'
                                            }} src={Location} />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p>Company Logo</p>
                                        </div>
                                        <div className='bg-danger'>
                                            <input name='CompanyLogo' className='btn btn-danger bg-danger w-100' accept='.png, .jpg, .jpeg' type='file' required />
                                        </div>
                                    </div>


                                </div>
                            </div>





                        </div>


                        <div className={style.btn}>
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

export default AddCompany
