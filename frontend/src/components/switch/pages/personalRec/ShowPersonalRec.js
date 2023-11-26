import ProfileUser from '../../components/profileUser/ProfileUser'
import SideBar from '../../components/sidebar/SideBar'
import style from './ShowPersonalRec.module.css'
import arrow from '../../assets/images/addEmployee/arrow.svg'
import date from '../../assets/images/employeeProfile/Calendar.svg'

function ShowPersonalRec() {
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
                                <input type="text" value='Bachelor' />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Minimum Qualification Required</p>
                            </div>
                            <div>
                                <input type="text" value='2 Years' />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Industry Specific Experience</p>
                            </div>
                            <div>
                                <input type="text" value='1 Years' />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Age Bracket</p>
                            </div>
                            <div>
                                <input type="text" value='40 Years' />

                            </div>
                        </div>
                        <div className={style.textareaParent}>
                            <div className={style.para}>
                                <p>Main Job Responsibilities</p>
                            </div>
                            <div style={{ height: '168px !important' }}>
                                <textarea value='Head the managment
Control Environment
Register New Plans
Touring Employee Deaprtment' type="text" />

                            </div>
                        </div>
                        <div className={style.inputParent}>
                            <div className={style.para}>
                                <p>Designation</p>
                            </div>
                            <div>
                                <input value='IT Department' type="text" />

                            </div>
                        </div>
                    </div>
                    <div className={style.sec2}>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Computer Skill Level</p>
                            </div>
                            <div className={style.term}>
                                <p>Avarage</p>
                            </div>
                        </div>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Communication Skill Level</p>
                            </div>
                            <div className={style.term}>
                                <p>Avarage</p>
                            </div>
                        </div>
                        <div className={` ${style.bg} ${style.checksParent}`}>
                            <div className={style.para}>
                                <p>Justification (Please indicate the Recruiment need such as)</p>
                            </div>
                            <div className={style.termtextarea}>
                                <p>New Business Need</p>
                            </div>
                        </div>

                        <div className={style.inputParentSec2}>
                            <div className={style.para}>
                                <p>Others</p>
                            </div>
                            <div>
                                <input value='It Department' type="text" />
                            </div>
                        </div>
                        <div className={style.inputParentSec2}>
                            <div className={style.para}>
                                <p>Request Initiated by</p>
                            </div>
                            <div>
                                <input value='HR' type="text" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowPersonalRec
