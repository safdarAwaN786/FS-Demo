

import style from './AddPerson.module.css'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { updatePersonFormData } from '../../redux/slices/appSlice';

function AddPerson() {

 
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const personFormData = useSelector(state => state.appData.personFormData);


    return (

     <>

     
            <form onSubmit={(event) => {
                event.preventDefault();
                dispatch(updateTabData({ ...tabData, Tab: 'addPersonalRec2' }))
            }}>
                <div className='d-flex flex-row bg-white px-lg-5  px-2 py-2'>
                    <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                        {
                            dispatch({ ...tabData, Tab: 'Employee Requisition' })
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
                                    <input autoComplete='off' onChange={(event) => {
                                        dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                    }} name='Station' value={personFormData?.Station} type="text" />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Job Title</p>
                                </div>
                                <div className={style.inputp}>
                                    <input autoComplete='off' onChange={(event) => {
                                         dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                    }} value={personFormData?.JobTitle} name='JobTitle' type="text" />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Department</p>
                                </div>
                                <div className={style.inputp}>
                                    <input autoComplete='off' onChange={(event) => {
                                        dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                    }} value={personFormData?.DepartmentText} name='DepartmentText' type="text" required />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Section</p>
                                </div>
                                <div className={style.inputp}>
                                    <input autoComplete='off' onChange={(event) => {
                                        dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                    }} value={personFormData?.Section} name='Section' type="text" required />
                                </div>
                            </div>
                            <div className={style.card1body}>
                                <div className='d-flex justify-content-start align-items-start'>
                                    <p className={style.paraincard}>Supervisor</p>
                                </div>
                                <div className={style.inputp}>
                                    <input autoComplete='off' onChange={(event) => {
                                        dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                    }} value={personFormData?.Supervisor} name='Supervisor' type="text" required />
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
                            <div className={` ${style.bg} ${style.checksParent}`}>
                                <div className={style.checks}>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} checked={personFormData?.EmploymentType === "Permanent"} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Permanent" type="radio" />
                                        <p className={style.paraind}>Permanent</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' checked={personFormData?.EmploymentType === "Contractual"} onChange={(event) => {
                                             dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Contractual" type="radio" />
                                        <p className={style.paraind}>Contractual</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' checked={personFormData?.EmploymentType === "Specific Record"} onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Specific Record" type="radio" />
                                        <p className={style.paraind}>Specific Record</p>
                                    </div>
                                </div>
                            </div>
                            <div className={` ${style.bg} ${style.checksParent}`}>
                                <div className={style.checks}>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' checked={personFormData?.EmploymentType === "Part Time"} onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Part Time" type="radio" />
                                        <p className={style.paraind}>Part Time</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' checked={personFormData?.EmploymentType === "Temporary"} onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Temporary" type="radio" />
                                        <p className={style.paraind}>Temporary</p>
                                    </div>
                                    <div className='d-flex justify-content-between align-items-center gap-2' >
                                        <input autoComplete='off' checked={personFormData?.EmploymentType === "Internship"} onChange={(event) => {
                                           dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} name='EmploymentType' style={{ width: '26px', height: '36px' }} value="Internship" type="radio" />
                                        <p className={style.paraind}>Internship</p>
                                    </div>
                                </div>
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
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Gross Salary</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input autoComplete='off' onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} value={personFormData?.GrossSalary} name='GrossSalary' type="number" />
                                    </div>
                                </div>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Net Salary</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input autoComplete='off' onChange={(event) => {
                                             dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} value={personFormData?.NetSalary} name='NetSalary' type="number" />
                                    </div>
                                </div>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Basic Salary</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input autoComplete='off' onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} value={personFormData?.BasicSalaryDetail} name='BasicSalaryDetail' type="text" />
                                    </div>
                                </div>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Allowence</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input autoComplete='off' onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} value={personFormData?.AllowanceDetail} name='AllowanceDetail' type="text" />
                                    </div>
                                </div>
                                <div className={style.card1body}>
                                    <div style={{ width: '70%', }} className='d-flex justify-content-start align-items-start'>
                                        <p className={style.paraincard}>Incentives</p>
                                    </div>
                                    <div className={style.inputp}>
                                        <input autoComplete='off' onChange={(event) => {
                                            dispatch(updatePersonFormData({ ...personFormData, [event.target.name]: event.target.value }));
                                        }} value={personFormData?.IncentivesDetail} name='IncentivesDetail' type="text" />
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>


                <div className={style.btn}>
                    <button type='submit'  >Next Page</button>
                </div>
            </form>
        </>
        

    )
}

export default AddPerson
