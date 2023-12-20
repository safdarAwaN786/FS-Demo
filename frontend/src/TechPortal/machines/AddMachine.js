import style from './AddMachine.module.css'
import profile from '../../assets/images/techPortal/SClock.svg'
import Phone from '../../assets/images/employeeProfile/Location.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function AddMachine() {
    const [maintenance, setMaintenance] = useState(null);
    const [isDailyChecked, setDailyChecked] = useState(false);
    const [isWeeklyChecked, setWeeklyChecked] = useState(false);
    const [isMonthlyChecked, setMonthlyChecked] = useState(false);
    const [isQuarterlyChecked, setQuarterlyChecked] = useState(false);
    const [isYearlyChecked, setYearlyChecked] = useState(false);
    const [formData, setFormData] = useState('');
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const [commentOpened, setCommentOpened] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();


    const updateData = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });

    }

    const [comment, setComment] = useState(null);


    const updateComment = (e) => {

        setComment(e.target.value)
    }


    useEffect(() => {

        setFormData({ ...formData, maintenanceFrequency: maintenance });
    }, [maintenance])

    const [submitAlert, setSubmitAlert] = useState(false);

    const toggleCommentBox = (e) => {
        if (e.target.checked === true) {
            setCommentOpened(e.target.name)
            alertManager();

        } else {
            if (maintenance) {

                const newObj = maintenance;
                delete newObj[e.target.name];
                setMaintenance(newObj)
            }
        }
    }


    const [alert2, setAlert2] = useState(false);
    return (
        <>

            <div className={style.addEmployee}>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Master List of Machinery' }))
                        }
                    }} />

                </div>
                <div className={`${style.form} mt-1 `}>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Add Machinery
                        </div>

                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        if (maintenance === null || Object.keys(maintenance).length === 0) {
                            setAlert2(true)
                        } else {

                            console.log(formData)
                            setSubmitAlert(true);
                        }

                    }}>
                        <div className={style.userform}>
                            <div className={style.sec1}>

                                <div className='mb-5'>
                                    <input onChange={updateData} name='machineName' value={formData?.machineName} type="text" placeholder='Machinery name' required />
                                    <img src={profile} alt="" />
                                </div>
                                <div>
                                    <input value={formData?.machinaryLocation} onChange={updateData} name='machinaryLocation' type="text" placeholder='Machinery location' required />
                                    <img src={Phone} alt="" />

                                </div>

                                <div className={style.dropdown}>
                                    <p>Add Maintainance</p>

                                    <div className={style.droper}>
                                        <p className={style.optStyle} ><input onChange={(e) => {
                                            toggleCommentBox(e);
                                            setDailyChecked(e.target.checked);
                                        }} type="checkbox" name='Daily' /> Daily {isDailyChecked && maintenance?.Daily && <p className='text-success fs-6'> ( Added )</p>}  {isDailyChecked && !maintenance?.Daily && <p className='text-danger fs-6'> ( Not Added )</p>}</p>

                                        <p className={style.optStyle} ><input onChange={(e) => {
                                            toggleCommentBox(e);
                                            setWeeklyChecked(e.target.checked);
                                        }} name='Weekly' type="checkbox" /> Weekly  {isWeeklyChecked && maintenance?.Weekly && <p className='text-success fs-6'> ( Added )</p>}  {isWeeklyChecked && !maintenance?.Weekly && <p className='text-danger fs-6'> ( Not Added )</p>}</p>



                                        <p className={style.optStyle} ><input onChange={(e) => {
                                            toggleCommentBox(e);
                                            setMonthlyChecked(e.target.checked);
                                        }} name='Monthly' type="checkbox" /> Monthly  {isMonthlyChecked && maintenance?.Monthly && <p className='text-success fs-6'> ( Added )</p>}  {isMonthlyChecked && !maintenance?.Monthly && <p className='text-danger fs-6'> ( Not Added )</p>}</p>


                                        <p className={style.optStyle} ><input onChange={(e) => {
                                            toggleCommentBox(e);
                                            setQuarterlyChecked(e.target.checked);

                                        }} name='Quarterly' type="checkbox" /> Quarterly  {isQuarterlyChecked && maintenance?.Quarterly && <p className='text-success fs-6'> ( Added )</p>}  {isQuarterlyChecked && !maintenance?.Quarterly && <p className='text-danger fs-6'> ( Not Added )</p>}</p>


                                        <p className={style.optStyle} ><input onChange={(e) => {
                                            toggleCommentBox(e);
                                            setYearlyChecked(e.target.checked);
                                        }} name='Yearly' type="checkbox" /> Yearly  {isYearlyChecked && maintenance?.Yearly && <p className='text-success fs-6'> ( Added )</p>}   {isYearlyChecked && !maintenance?.Yearly && <p className='text-danger fs-6'> ( Not Added )</p>}</p>
                                    </div>

                                </div>

                            </div>

                        </div>
                        <div className={style.resbtns}>
                            <button type='submit' className={style.submit} >Submit</button>
                        </div>

                    </form>
                </div>


            </div>

            {
                alert ?
                    <div class={`${style.alertparent} `}>
                        <div class={`${style.alert} bg-light`}>
                            <form className='bg-light py-2 pb-4' onSubmit={() => {
                                setMaintenance({ ...maintenance, [commentOpened]: comment })
                                alertManager();
                            }}>

                                <textarea name={commentOpened} onChange={updateComment} id="" cols="30" rows="10" placeholder='Comment here' required></textarea>
                                <div className={style.alertbtns}>
                                    <button type='submit' className={style.btn1}>Submit</button>
                                    <button onClick={alertManager} className={style.btn2}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div> : null
            }
            {
                alert2 ?
                    <div class={style.alertparent}>
                        <div style={{
                            padding: "20px"
                        }} class={style.alert}>
                            <p style={{
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "18px",
                                fontFamily: "Poppins"

                            }}>Choose At least one maintenance plan.</p>
                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setAlert2(false);
                                }} className={style.btn2}>Ok.</button>
                            </div>
                        </div>
                    </div> : null
            }

            {
                submitAlert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setSubmitAlert(false)
                                    dispatch(setLoading(true))
                                    axios.post(`${process.env.REACT_APP_BACKEND_URL}/addMachinery`, formData, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
                                        dispatch(setLoading(false))
                                        setFormData(null)
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',

                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                dispatch(updateTabData({ ...tabData, Tab: 'Master List of Machinery' }))
                                            }
                                        })
                                    }).catch(err => {
                                        dispatch(setLoading(false));
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'OOps..',
                                            text: 'Something went wrong, Try Again!'
                                        })
                                    })
                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={() => { setSubmitAlert(false) }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AddMachine
