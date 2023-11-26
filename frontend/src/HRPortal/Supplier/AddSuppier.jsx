import style from './AddSupplier.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading';

function AddSupplier() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const userToken = Cookies.get('userToken');
    const user = useSelector(state => state.auth.user);

    const makeRequest = () => {

        if (dataToSend) {
            dispatch(setLoading(true))
            axios.post("/create-supplier", dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                dispatch(setLoading(false))
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',
                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'Suppliers' }))
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
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
                                dispatch(updateTabData({ ...tabData, Tab: 'Suppliers' }))
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
                            Add Supplier
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
                                        <div >
                                            <input value={dataToSend?.Name} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Name' className='text-dark' type='text' placeholder='Name' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.Address} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='Address' className='text-dark' type='text' placeholder='Address' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <select value={dataToSend?.DueDate} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='DueDate' className='w-100 text-dark' required>
                                                <option value='' selected disabled>Due Date</option>
                                                <option>1 Year</option>
                                                <option>2 Year</option>
                                                <option>3 Year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className={style.sec2}>

                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.ContactPerson} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='ContactPerson' className='text-dark' type='text' placeholder='Contact Person' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.PhoneNumber} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='PhoneNumber' className='text-dark' type='number' placeholder='Contact No' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.ProductServiceOffered} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value });
                                            }} name='ProductServiceOffered' className='text-dark' type='text' placeholder='Product Service Offered' required />
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

export default AddSupplier
