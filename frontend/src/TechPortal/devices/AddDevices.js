import style from './Adddevices.module.css'
import profile from '../../assets/images/techPortal/SClock.svg'
import Phone from '../../assets/images/employeeProfile/Location.svg'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import { BsArrowLeftCircle } from 'react-icons/bs'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice'
import { setLoading } from '../../redux/slices/loading'

function AddDevices() {
    const [internal, setInternal] = useState(false)
    const [external, setExternal] = useState(false)
    const [alert, setalert] = useState(false)
    const alertManager = () => {
        setalert(!alert)
    }
    const [alert2, setAlert2] = useState(false);
    const [popUpData, setPopUpData] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [isDailyChecked, setDailyChecked] = useState(false);
    const [isWeeklyChecked, setWeeklyChecked] = useState(false);
    const [isMonthlyChecked, setMonthlyChecked] = useState(false);
    const [isQuarterlyChecked, setQuarterlyChecked] = useState(false);
    const [isYearlyChecked, setYearlyChecked] = useState(false);
    const [isDaily2Checked, setDaily2Checked] = useState(false);
    const [isWeekly2Checked, setWeekly2Checked] = useState(false);
    const [isMonthly2Checked, setMonthly2Checked] = useState(false);
    const [isQuarterly2Checked, setQuarterly2Checked] = useState(false);
    const [isYearly2Checked, setYearly2Checked] = useState(false);
    const [commentOpened, setCommentOpened] = useState(null);
    const [comment, setComment] = useState(null);
    const [callibration, setCallibration] = useState(null);

    const userToken = Cookies.get('userToken');
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log(callibration);
    }, [callibration])


    const updateComment = (e) => {
        setComment(e.target.value)
    }
    const [submitAlert, setSubmitAlert] = useState(false);

    const toggleCommentBox = (e) => {
        if (e.target.checked === true) {
            setCommentOpened(e.target.name)
            alertManager();
        } else {
            if (callibration) {
                const newObj = callibration;
                delete newObj[e.target.name];
                setCallibration(newObj)
            }
        }
    }

    const updateFormValues = (e) => {
        console.log('called');
        setFormValues({ ...formValues, [e.target.name]: e.target.value })
    }
    useEffect(() => {
        console.log(formValues);
    }, [formValues])



    return (
        <>

            <div className={style.addEmployee}>
                <div className='d-flex flex-row bg-white px-lg-5 mx-1 px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch(updateTabData({ ...tabData, Tab: 'Master List of Monitoring and Measuring Devices' }))

                        }
                    }} />

                </div>
                <div className={`${style.form} mt-1`}>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Add Measuring Device
                        </div>

                    </div>
                    <form onSubmit={(e) => {
                        e.preventDefault()

                        console.log(formValues);
                        console.log(callibration);
                        if (callibration) {

                            const Internal = {}
                            const External = {}
                            // Check and assign the properties only if they exist in the callibration object
                            if (callibration.hasOwnProperty('Daily')) {
                                Internal.Daily = callibration.Daily;
                            }
                            if (callibration.hasOwnProperty('Weekly')) {
                                Internal.Weekly = callibration.Weekly;
                            }
                            if (callibration.hasOwnProperty('Monthly')) {
                                Internal.Monthly = callibration.Monthly;
                            }
                            if (callibration.hasOwnProperty('Quarterly')) {
                                Internal.Quarterly = callibration.Quarterly;
                            }
                            if (callibration.hasOwnProperty('Yearly')) {
                                Internal.Yearly = callibration.Yearly;
                            }
                            if (callibration.hasOwnProperty('Daily2')) {
                                External.Daily = callibration.Daily2;
                            }
                            if (callibration.hasOwnProperty('Weekly2')) {
                                External.Weekly = callibration.Weekly2;
                            }
                            if (callibration.hasOwnProperty('Monthly2')) {
                                External.Monthly = callibration.Monthly2;
                            }
                            if (callibration.hasOwnProperty('Quarterly2')) {
                                External.Quarterly = callibration.Quarterly2;
                            }
                            if (callibration.hasOwnProperty('Yearly2')) {
                                External.Yearly = callibration.Yearly2;
                            }

                            setFormValues({
                                ...formValues, callibration: {
                                    Internal: Internal,
                                    External: External,
                                }
                            });
                            setSubmitAlert(true)

                        } else {
                            setAlert2(true)
                        }
                        // alertManager()
                        // if (value1 === 'Internal' && value2 === 'External') {
                        //     setPopUpData('Kindly choose At least one of internal or extrenal')
                        //     setAlert2(true);
                        // } else {
                        //     alertManager();
                        // }
                    }}>
                        <div className={style.userform}>

                            <div className={style.sec1}>
                                <div className='mb-4'>
                                    <input type="text" name='equipmentName' placeholder='Device Name' onChange={updateFormValues} required />
                                    <img src={profile} alt="" />
                                </div>
                                <div>
                                    <input type="text" placeholder='Device Location' name='equipmentLocation' onChange={updateFormValues} required />
                                    <div className={style.indicator}>
                                        <img src={Phone} alt="" />
                                    </div>
                                </div>

                                <div className='mt-4'>
                                    <input type="number" name='Range' onChange={updateFormValues} placeholder='Range' required />
                                </div>
                                <div className={`${style.dropdown} bg-white p-3 `}>
                                    <p className='fs-4'>Add Callibration</p>

                                    <div className='w-100 p-0 m-0 d-flex flex-row justify-content-between'>
                                        <div className=' align-items-center d-flex flex-column'>
                                            <div className='my-2 d-flex align-items-center flex-row'>
                                                <input style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #ccc',
                                                    marginRight: '5px',
                                                    backgroundColor: 'white',

                                                }} onChange={(e) => {
                                                    setInternal(e.target.checked);
                                                    if (!e.target.checked) {
                                                        if (callibration) {
                                                            const { Daily, Weekly, Monthly, Quarterly, Yearly, ...newObj } = callibration;
                                                            setCallibration(newObj)
                                                        }
                                                    }
                                                }} id='Internal' className='mx-2' type='checkbox' />
                                                <label for='Internal' className='fs-5 d-inline'>Internal</label>

                                            </div>
                                            {internal && (

                                                <div>
                                                    <div className='my-2  d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setDailyChecked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Daily' />
                                                        <label className='fs-5 d-inline'>Daily {isDailyChecked && callibration?.Daily && <p className='text-success fs-6'> ( Added )</p>}   {isDailyChecked && !callibration?.Daily && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setWeeklyChecked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Weekly' />
                                                        <label className='fs-5 d-inline'>Weekly {isWeeklyChecked && callibration?.Weekly && <p className='text-success fs-6'> ( Added )</p>}   {isWeeklyChecked && !callibration?.Weekly && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>

                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setMonthlyChecked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Monthly' />
                                                        <label className='fs-5 d-inline'>Monthly {isMonthlyChecked && callibration?.Monthly && <p className='text-success fs-6'> ( Added )</p>}   {isMonthlyChecked && !callibration?.Monthly && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setQuarterlyChecked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Quarterly' />
                                                        <label className='fs-5 d-inline'>Quarterly {isQuarterlyChecked && callibration?.Quarterly && <p className='text-success fs-6'> ( Added )</p>}   {isQuarterlyChecked && !callibration?.Quarterly && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setYearlyChecked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Yearly' />
                                                        <label className='fs-5 d-inline'>Yearly {isYearlyChecked && callibration?.Yearly && <p className='text-success fs-6'> ( Added )</p>}   {isYearlyChecked && !callibration?.Yearly && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                        <div className=' align-items-center d-flex flex-column'>
                                            <div className='my-2 d-flex align-items-center flex-row'>
                                                <input style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    border: '2px solid #ccc',
                                                    marginRight: '5px',
                                                    backgroundColor: 'white',

                                                }} onChange={(e) => {
                                                    setExternal(e.target.checked);
                                                    if (!e.target.checked) {
                                                        if (callibration) {
                                                            const { Daily2, Weekly2, Monthly2, Quarterly2, Yearly2, ...newObj } = callibration;
                                                            setCallibration(newObj)
                                                        }
                                                    }
                                                }} id='External' className='mx-2' type='checkbox' />
                                                <label for='External' className='fs-5 d-inline'>External</label>

                                            </div>
                                            {external && (
                                                <div >

                                                    <div className='my-2 justify-content-start d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setDaily2Checked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Daily2' />
                                                        <label className='fs-5 d-inline'>Daily {isDaily2Checked && callibration?.Daily2 && <p className='text-success fs-6'> ( Added )</p>}   {isDaily2Checked && !callibration?.Daily2 && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setWeekly2Checked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Weekly2' />
                                                        <label className='fs-5 d-inline'>Weekly {isWeekly2Checked && callibration?.Weekly2 && <p className='text-success fs-6'> ( Added )</p>}   {isWeekly2Checked && !callibration?.Weekly2 && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setMonthly2Checked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Monthly2' />
                                                        <label className='fs-5 d-inline'>Monthly {isMonthly2Checked && callibration?.Monthly2 && <p className='text-success fs-6'> ( Added )</p>}   {isMonthly2Checked && !callibration?.Monthly2 && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setQuarterly2Checked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Quarterly2' />
                                                        <label className='fs-5 d-inline'>Quarterly {isQuarterly2Checked && callibration?.Quarterly2 && <p className='text-success fs-6'> ( Added )</p>}   {isQuarterly2Checked && !callibration?.Quarterly2 && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>
                                                    <div className='my-2 d-flex align-items-center flex-row'>
                                                        <input style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '50%',
                                                            border: '2px solid #ccc',
                                                            marginRight: '5px',
                                                            backgroundColor: 'white',

                                                        }} onChange={(e) => {
                                                            toggleCommentBox(e);
                                                            setYearly2Checked(e.target.checked);
                                                        }} className='mx-2' type='checkbox' name='Yearly2' />
                                                        <label className='fs-5 d-inline'>Yearly {isYearly2Checked && callibration?.Yearly2 && <p className='text-success fs-6'> ( Added )</p>}   {isYearly2Checked && !callibration?.Yearly2 && <p className='text-danger fs-6'> ( Not Added )</p>}</label>

                                                    </div>

                                                </div>
                                            )}
                                        </div>
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
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setCallibration({ ...callibration, [commentOpened]: comment })
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

                            }}>Choose At least one callibration plan.</p>
                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setAlert2(false);
                                }} className={style.btn2}>Close</button>
                            </div>
                        </div>
                    </div> : null
            }

            {
                submitAlert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={`${style.msg} fs-5 m-2 text-center mt-5 pt-3`}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    setSubmitAlert(false)
                                    dispatch(setLoading(true))
                                    axios.post('/addEquipment', formValues, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
                                        dispatch(setLoading(false))
                                        Swal.fire({
                                            title: 'Success',
                                            text: 'Submitted Successfully',
                                            icon: 'success',
                                            confirmButtonText: 'Go!',

                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                dispatch(updateTabData({ ...tabData, Tab: 'Master List of Monitoring and Measuring Devices' }))

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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={() => { setSubmitAlert(false) }} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default AddDevices
