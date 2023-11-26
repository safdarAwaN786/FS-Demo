import SideBar from '../../../sidebar/SideBar'
import style from './Employees.module.css'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import avatar from '../../assets/images/employees/Avatar.png'
import ProfileUser from '../../../profileUser/ProfileUser'
import Btns from '../../../btns/Btns'


function Employees() {
    let data = [
        {
            img: avatar,
            code: '3310',
            name: 'Tanner Finsha',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Not Trained'
        },
        {
            img: avatar,
            code: '3310',
            name: 'Emeto  Winner',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'Tassy Omah',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'James Muriel',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'Emeto  Winner',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'Tassy Omah',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'James Muriel',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        },
        {
            img: avatar,
            code: '3310',
            name: 'Emeto  Winner',
            cnic: '33101-1543434-2',
            phonen: '0306-56302121',
            email: 'Emetowinner@gmail.com',
            dep: 'Manufacture',
            status: 'Manufacture'
        }
    ]
    let next = 'Next page >>'
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <div className={style.subparent}>
                <ProfileUser />
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={search} alt="" />
                        <input type="text" placeholder='Search Employee by name or id' />
                    </div>
                    <div className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Add Employee</p>
                    </div>
                </div>
                <div className={style.tableParent}>

                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Employee Code</td>
                            <td>Name</td>
                            <td>CNIC</td>
                            <td>Phone Number</td>
                            <td>Email</td>
                            <td>Department</td>
                            <td>Training Status</td>
                            <td>Action</td>
                            <td>CV Certificate</td>
                        </tr>
                        {
                            data.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{employee.code}</p>
                                        </td>
                                        <td><img src={employee.img} alt="" /> {employee.name}</td>
                                        <td>{employee.cnic}</td>
                                        <td>{employee.phonen}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.dep}</td>
                                        <td className={employee.status === 'Trained' ? style.txtStyle5 : style.txtStyle6}>{employee.status}</td>
                                        <td>
                                            <button>
                                                View
                                            </button>
                                        </td>
                                        <td>
                                            <button>
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                )

                            })
                        }
                    </table>
                </div>
              <Btns />
            </div>
        </div>
    )
}

export default Employees
