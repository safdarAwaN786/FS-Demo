import SideBar from '../../components/sidebar/SideBar'
import user from '../../assets/images/hrprofile/user.svg'
import selectImg from '../../assets/images/hrprofile/selectImg.svg'
import mail from '../../assets/images/hrprofile/mail.svg'
import Phone from '../../assets/images/employeeProfile/Phone.svg'
import copyp from '../../assets/images/employeeProfile/CopyP.svg'
import Location from '../../assets/images/employeeProfile/Location.svg'
import Office from '../../assets/images/employeeProfile/Office.svg'
import UserCard from '../../assets/images/employeeProfile/UserCard.svg'
import Calendar from '../../assets/images/employeeProfile/Calendar.svg'
import man from '../../assets/images/hrprofile/man.svg'
import { useState } from 'react'
import style from '../HRProfile/HRProfile.module.css'
import style2 from './EmployeeProfile.module.css'
import ProfileUser from '../../components/profileUser/ProfileUser'


function EmployeeProfile() {
    const [data, setdata] = useState(['IT', 'IT', 'IT'])
    return (
        <div className={style.parent}>
            <div className={`${style.sidebar}`}>
                <SideBar />
            </div>
            <div className={style.profile}>
                <ProfileUser />
                <p>Employee Profile</p>
                <div className={style.hrInfo}>
                    <div>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div>
                        <p>Taskeen Chaudary</p>
                        <p>Front End Developer</p>
                    </div>
                    <div>
                        <img src={user} alt="" />
                    </div>
                    <div>
                        <img src={selectImg} alt="" />
                    </div>
                </div>
                <div className={style2.cardParent}>
                    <div className={style2.card1}>
                        <div className={style2.card1headers}>
                            <div>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                            <div>
                                <p>Info</p>
                            </div>
                        </div>
                        <div className={style2.card1body}>
                            <div>


                                <div>
                                    <img src={man} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Name</p>
                                        <p className={style2.card1para2}>Albert Robin</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={mail} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Email</p>
                                        <p className={style2.card1para2}>Albertrobin23@gmail.com</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Phone} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Phone</p>
                                        <p className={style2.card1para2}>03044512698</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Department</p>
                                        <p className={style2.card1para2}>Manufacturing</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Office} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Designation</p>
                                        <p className={style2.card1para2}>Employee</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <img src={Calendar} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Date Of Birth</p>
                                        <p className={style2.card1para2}>31-08-2000</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={UserCard} alt="" />
                                    <div>
                                        <p className={style2.card1para}>CNIC</p>
                                        <p className={style2.card1para2}>33100-7483748-2</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={copyp} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Qualification</p>
                                        <p className={style2.card1para2}>Bachelor’s Degree</p>
                                    </div>
                                </div>
                                <div>
                                    <img src={Location} alt="" />
                                    <div>
                                        <p className={style2.card1para}>Address</p>
                                        <p className={style2.card1para2}>Faisalabad</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                    <div className={style2.card2}>
                        <table className={style2.table}>
                            <tr>
                                <th className={style2.tableheader}>
                                    <td>Serial #</td>
                                    <td>Training Name</td>
                                    <td>Details</td>
                                </th>
                            </tr>
                            {
                                data.map((training, i) => {
                                    return (
                                        <tr key={i}>
                                            <tb className={style2.tablebody}>
                                                <td className={style2.index}>{i + 1}</td>
                                                <td className={style2.training}>{training}</td>
                                                <td className={style2.clicker}>Details</td>
                                            </tb>
                                        </tr>
                                    )
                                })
                            }

                        </table>
                            <div className={style2.btns}>
                                <button>Print</button>
                                <button>Download Info</button>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EmployeeProfile
