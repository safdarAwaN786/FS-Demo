import style from './YearlyPlan.module.css'
import SideBar from '../../../sidebar/SideBar'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import ProfileUser from '../../../profileUser/ProfileUser'
function YearlyPlan() {
    let data = [
        '2023',
        '2023',
        '2023',
        '2023',
        '2023',
        '2023',
        '2023',
        '2023',
    ]
    let next = 'Next page >>'
    return (
        <div className={style.parent}>
            <div className={style.sidebar}>
                <SideBar />
            </div>
                <ProfileUser />
            <div className={style.subparent}>
                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={search} alt="" />
                        <input type="text" placeholder='Search Employee by name or id' />
                    </div>
                    <div className={style.sec2}>
                        <img src={add} alt="" />
                        <p>Add New</p>
                    </div>
                </div>
                <div className={style.tableParent2}>
                    <table className={style.table}>
                        <tr className={style.headers}>
                            <td>Year</td>
                            <td>Action</td>
                        </tr>
                        {
                            data.map((year, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{year}</p>
                                        </td>
                                        <td ><button className={style.view}>
                                            View
                                        </button></td>
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

export default YearlyPlan
