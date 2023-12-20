import style from './AddParticipant.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading';

function AddParticipant() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const [departmentsToShow, setDepartmentsToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const userToken = Cookies.get('userToken');
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
            setDepartmentsToShow(res.data.data);
            dispatch(setLoading(false));
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const makeRequest = () => {
        console.log(dataToSend);
        if (dataToSend) {
            dispatch(setLoading(true))
            axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-participants`, dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then(() => {
                dispatch(setLoading(false))
                setDataToSend(null);
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({...tabData, Tab : 'Management Review Team'}))
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
                                dispatch(updateTabData({...tabData, Tab : 'Management Review Team'}))
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
                            Add Participant
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
                                            <input value={dataToSend?.Name} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='Name' className='text-dark' type='text' placeholder='Name' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.Designation} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='Designation' className='text-dark' type='text' placeholder='Designation' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <select value={dataToSend?.Department} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='Department' className='w-100 text-dark' required>
                                                <option value='' selected disabled>Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                            return (
                                                <option value={depObj.DepartmentName}>{depObj.DepartmentName}</option>
                                            )
                                        })}
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
                                            <input value={dataToSend?.Email} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='Email' className='text-dark' type='email' placeholder='Email' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.ContactNo} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='ContactNo' className='text-dark' type='number' placeholder='Contact No' required />
                                        </div>
                                    </div>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            {/* <p>Document Type</p> */}
                                        </div>
                                        <div >
                                            <input value={dataToSend?.RoleInTeam} onChange={(e)=>{
                                                setDataToSend({...dataToSend, [e.target.name] : e.target.value});
                                            }} name='RoleInTeam' className='text-dark' type='text' placeholder='Role in Team' required />
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

export default AddParticipant
