import style from './Checked.module.css'
import SideBar from '../../components/sidebar/SideBar'
import search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import tick from '../../assets/images/tick.svg'
import ProfileUser from '../../components/profileUser/ProfileUser'
function Checked() {
    let data = [
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
        {
            trainName: 'Intro To Computing',
            weeks: [
                1, 2, 3, 4
            ]
        },
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
                            <td>Training Name</td>
                            <td>Week 1</td>
                            <td>Week 2</td>
                            <td>Week 3</td>
                            <td>Week 4</td>
                        </tr>
                        {
                            data.map((obj, i) => {
                                return (
                                    <tr className={style.tablebody} key={i}>
                                        <td>
                                            <p>{obj.trainName}</p>
                                        </td>
                                        {
                                            obj.weeks.map((week) => {
                                                return (
                                                    <td>
                                                        {
                                                            week ? <img src={tick} alt="" /> : null
                                                        }
                                                    </td>
                                                )
                                            })
                                        }
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

export default Checked
