import ProfileUser from '../../components/profileUser/ProfileUser'
import SideBar from '../../components/sidebar/SideBar'
import style from './AddPlan.module.css'
import arrow from '../../assets/images/addEmployee/arrow.svg'
import date from '../../assets/images/employeeProfile/Calendar.svg'

function AddPlan() {
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <ProfileUser />
            <div className={style.subparent}>
                <div className={style.headers}>
                    <div className={style.spans}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div className={style.heading}>
                        Add Monthly Plan
                    </div>
                </div>
                <div className={style.formDivider}>
                    <div className={style.sec1}>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Month Name</p>
                            </div>
                            <div>
                                <input type="text" placeholder='Select month' />
                                <div className={style.indicator}>
                                    <div>
                                        <img src={arrow} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Date</p>
                            </div>
                            <div>
                                <input type="text" placeholder='dd----yyyy' />
                                <div className={style.indicator}>
                                        <img style={{width:'20px' , height:'20px'}} src={date} alt="" />
                                </div>
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Time</p>
                            </div>
                            <div>
                                <input type="text" placeholder='(e.g) 9:00 AM to 6:00 PM' />
                               
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Department</p>
                            </div>
                            <div>
                                <input type="text" placeholder='Select department' />
                                <div className={style.indicator}>
                                    <div>
                                        <img src={arrow} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Training</p>
                            </div>
                            <div>
                                <input type="text" placeholder='Select training' />
                                <div className={style.indicator}>
                                    <div>
                                        <img src={arrow} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Venue</p>
                            </div>
                            <div>
                                <input type="text" placeholder='(e.g) Training Hall' />
                            
                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Duration</p>
                            </div>
                            <div>
                                <input type="text" placeholder='(e.g) 2 Days' />
                              
                            </div>
                        </div>
                        <div className={`${style.checkinputParent} ${style.bg}`}>
                            <div className={style.para}>
                                <p>Internal/External</p>
                            </div>
                            <div className={style.dropdown}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{width:'26px' , height:'36px'}} type="radio" />
                                    <p className={style.paraind}>Internal</p>
                                </div>
                                <div className='bg-#FFF d-flex justify-content-between align-items-center w-50 gap-2'>
                                    <p className={style.paraind}>External</p>
                                    <img className='cursor-pointer' src={arrow} alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={style.btn}>
                    <button>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default AddPlan
