import style from './ShowAddPersom.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function ShowAddPerson() {
    const [reqPersonData, setReqPersonData] = useState(null);
    const dispatch = useDispatch();
    const tabData = useSelector(state => state.tab);
    const idToWatch = useSelector(state => state.idToProcess);
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/readPersonalRecuisition`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            // console.log(response.data);
            const reqPersonsList = response.data.data;
            setReqPersonData(reqPersonsList.find((person) => person._id === idToWatch));
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
    return (
        <>
            <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                    {
                        dispatch(updateTabData({ ...tabData, Tab: 'Employee Requisition' }));
                    }
                }} />

            </div>
            <div className={style.formDivider}>
                <div className={style.sec1}>
                    <div className={style.headers}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={style.para}>
                            Employee Details
                        </div>
                    </div>

                    <div className={style.card1bodyp}>
                        <div className={style.card1body}>
                            <div className='d-flex justify-content-start align-items-start'>
                                <p className={style.paraincard}>Station</p>
                            </div>
                            <div className={style.inputp}>
                                <p>{reqPersonData?.Station}</p>
                            </div>
                        </div>
                        <div className={style.card1body}>
                            <div className='d-flex justify-content-start align-items-start'>
                                <p className={style.paraincard}>Job Title</p>
                            </div>
                            <div className={style.inputp}>
                                <p>{reqPersonData?.JobTitle}</p>
                            </div>
                        </div>
                        <div className={style.card1body}>
                            <div className='d-flex justify-content-start align-items-start'>
                                <p className={style.paraincard}>Department</p>
                            </div>
                            <div className={style.inputp}>
                                <p>{reqPersonData?.DepartmentText}</p>
                            </div>
                        </div>
                        <div className={style.card1body}>
                            <div className='d-flex justify-content-start align-items-start'>
                                <p className={style.paraincard}>Section</p>
                            </div>
                            <div className={style.inputp}>
                                <p>{reqPersonData?.Section}</p>
                            </div>
                        </div>
                        <div className={style.card1body}>
                            <div className='d-flex justify-content-start align-items-start'>
                                <p className={style.paraincard}>Supervisor</p>
                            </div>
                            <div className={style.inputp}>
                                <p>{reqPersonData?.Supervisor}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style.sec2}>
                    <div className={style.sec1p1}>
                        <div className={style.headers}>
                            <div className={style.spans}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className={style.para}>
                                Employement Terms
                            </div>
                        </div>
                        <div className={style.term}>
                            <p>{reqPersonData?.EmploymentType}</p>
                        </div>

                    </div>
                    <div className={style.sec1p2}>
                        <div className={style.headers}>
                            <div className={style.spans}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div className={style.para}>
                                Salary
                            </div>

                        </div>
                        <div className={style.card1bodyp}>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Gross Salary</p>
                                </div>
                                <div className={style.inputp}>
                                    <p>{reqPersonData?.GrossSalary}</p>
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Net Salary</p>
                                </div>
                                <div className={style.inputp}>
                                    <p>{reqPersonData?.NetSalary}</p>
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Basic Salary</p>
                                </div>
                                <div className={style.inputp}>
                                    <p>{reqPersonData?.BasicSalaryDetail}</p>
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Allowence</p>
                                </div>
                                <div className={style.inputp}>
                                    <p>{reqPersonData?.AllowanceDetail}</p>
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Incentives</p>
                                </div>
                                <div className={style.inputp}>
                                    <p>{reqPersonData?.IncentivesDetail}</p>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
            <div className={style.btn}>
                <button onClick={() => {
                    dispatch(changeId(reqPersonData._id))
                    dispatch(updateTabData({...tabData, Tab : 'showPersonalRec2'}))
                }}>Next Page</button>
            </div>

        

        </>

    )
}

export default ShowAddPerson
