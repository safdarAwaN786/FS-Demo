import SideBar from '../../components/sidebar/SideBar'
import style from './Main.module.css'
import search from '../../assets/images/employees/Search.svg'
import avatar from '../../assets/images/employees/Avatar.png'
import ProfileUser from '../../components/profileUser/ProfileUser'
import Switch from '../../components/switch/Switch'


function Main() {
    let sampleData = {
        img: avatar,
        code: '3310',
        name: 'Tanner Finsha',
        cnic: '33101-1543434-2',
        phonen: '0306-56302121',
        email: 'Emetowinner@gmail.com',
        dep: 'Manufacture',
        status: 'pending',
        marks: 36

    }
    let data = [
        sampleData,
        sampleData,
        sampleData,
        sampleData,
        sampleData,
        sampleData,
        sampleData,
        sampleData,
    ]
    let next = 'Next page >>'
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
            <div className={style.subparent}>
                <p className={style.redtxt}>Employees who are getting trained</p>
                <ProfileUser />
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={search} alt="" />
                        <input type="text" placeholder='Search Employee by name or id' />
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
                            <td>Result Status</td>
                            <td>Pass/Fail</td>
                            <td>Attendence</td>
                            <td>Obtained Marks</td>
                            <td>Remarks</td>
                        </tr>
                        {
                            data.map((employee, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{employee.code}</p>
                                        </td>
                                        <td className={style.name}><img src={employee.img} alt="" /> {employee.name}</td>
                                        <td>{employee.cnic}</td>
                                        <td>{employee.phonen}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.status}</td>
                                        <td>{employee.attendence ? <Switch state={employee.attendence} /> : <Switch state={employee.attendence} />}</td>
                                        <td>
                                            {employee.pass ? <Switch state={employee.pass} /> : <Switch state={employee.pass} />}
                                        </td>
                                        <td>{employee.marks}</td>
                                        <td>
                                            <p className={style.click}>Click Here</p>
                                        </td>
                                    </tr>
                                )

                            })
                        }
                    </table>
                </div>
                <div className={style.next}>
                    <button>
                        {next}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Main
