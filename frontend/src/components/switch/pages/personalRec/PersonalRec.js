import ProfileUser from '../../components/profileUser/ProfileUser'
import SideBar from '../../components/sidebar/SideBar'
import style from './PersonalRec.module.css'
import arrow from '../../assets/images/addEmployee/arrow.svg'
import date from '../../assets/images/employeeProfile/Calendar.svg'

function PersonalRec() {
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
                        Hiring Specification
                    </div>
                </div>
                <div className={style.formDivider}>
                    <div className={style.sec1}>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Minimum Qualification Required</p>
                            </div>
                            <div>
                                <input type="text" />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Minimum Qualification Required</p>
                            </div>
                            <div>
                                <input type="text" />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Industry Specific Experience</p>
                            </div>
                            <div>
                                <input type="text" />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Age Bracket</p>
                            </div>
                            <div>
                                <input type="text" />

                            </div>
                        </div>
                        <div className={style.textareaParent}>
                            <div className={style.para}>
                                <p>Main Job Responsibilities</p>
                            </div>
                            <div style={{ height: '168px !important' }}>
                                <textarea type="text" />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Designation</p>
                            </div>
                            <div>
                                <input type="text" />

                            </div>
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Internal/External</p>
                            </div>
                            <div className={style.checks}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>High</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Medium</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Average</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Not Applicable</p>
                                </div>
                            </div>
                        </div>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Internal/External</p>
                            </div>
                            <div className={style.checks}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>High</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Medium</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Average</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Not Applicable</p>
                                </div>
                            </div>
                        </div>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Internal/External</p>
                            </div>
                            <div className={style.checks}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>New Business Need</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>New Structure Need</p>
                                </div>
                            </div>
                            <div className={style.checks}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>New Target Requirment</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Department Extension</p>
                                </div>
                            </div>
                            <div className={style.checks}>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Work Overload Sharing</p>
                                </div>
                                <div className='d-flex justify-content-between align-items-center gap-2' >
                                    <input style={{ width: '26px', height: '36px' }} type="radio" />
                                    <p className={style.paraind}>Employee Resignation</p>
                                </div>
                            </div>
                        </div>
                       
                        <div className={style.inputParentSec2}>
                            <div className={style.para}>
                                <p>Others</p>
                            </div>
                            <div>
                                <input type="text" />
                            </div>
                        </div>
                        <div className={style.inputParentSec2}>
                            <div className={style.para}>
                                <p>Request Initiated by</p>
                            </div>
                            <div>
                                <input type="text" />
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

export default PersonalRec
