
import style from './UsersCompanies.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import profile from '../../assets/images/addEmployee/prof.svg'
import { useDispatch, useSelector } from 'react-redux';
import { changeId } from '../../redux/slices/idToProcessSlice';
import { updateTabData } from '../../redux/slices/tabSlice';
import Cookies from 'js-cookie';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function UsersCompanies() {

    const [usersList, setUsersList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);

    useEffect(() => {
        const userToken = Cookies.get('userToken');
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-users`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            // Create a Set to keep track of unique property values
            const uniqueCompanyObjects = new Set();
            // Use reduce to build the new array with distinct property values
            const UniqueCompanyUsers = response.data.data.reduce((acc, obj) => {
                const  property  = obj.Company?._id;
                // Check if the property value is already in the Set
                if (!uniqueCompanyObjects.has(property)) {
                    // Add the property value to the Set and include the object in the new array
                    uniqueCompanyObjects.add(property);
                    acc.push(obj);
                }
                return acc;
            }, []);
            dispatch(setLoading(false));
            setAllDataArr(UniqueCompanyUsers)
            setUsersList(UniqueCompanyUsers.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])


    const nextPage = () => {
        setStartIndex(startIndex + 8);
        setEndIndex(endIndex + 8);
    }

    const backPage = () => {
        setStartIndex(startIndex - 8);
        setEndIndex(endIndex - 8);
    }

    useEffect(() => {

        setUsersList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);

            const searchedList = allDataArr.filter((obj) =>

                obj.Company.CompanyId.includes(event.target.value) || obj?.Company.CompanyName?.includes(event.target.value)
            )
            console.log(searchedList);
            setUsersList(searchedList);
        } else {
            setUsersList(allDataArr?.slice(startIndex, endIndex))
        }
    }


    return (
        <>

            <div className={style.subparent}>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Company by name or Id' />
                    </div>
                    {tabData?.Creation && (
                        <div className={style.sec2} style={{
                            width: '150px'
                        }} onClick={() => {
                            dispatch(updateTabData({...tabData, Tab : 'addUsers'}))
                            
                        }}>
                            <img src={add} alt="" />
                            <p>Add Users</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!usersList || usersList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Company ID</td>
                                <td>Company Name</td>
                                <td>Departments</td>
                            </tr>
                            {
                                usersList?.map((user, i) => {
                                    return (
                                        <tr className={style.tablebody} key={i}>
                                            <td ><p style={{
                                                backgroundColor: "#f0f5f0",
                                                padding: "2px 5px",
                                                borderRadius: "10px",
                                                fontFamily: "Inter",
                                                fontSize: "12px",
                                                fontStyle: "normal",
                                                fontWeight: "400",
                                                lineHeight: "20px",
                                            }}>{user.Company?.CompanyId}</p></td>
                                            <td className={style.simpleContent}><div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                overflow: "hidden",


                                                backgroundImage: `url(${profile})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',

                                            }}>
                                                <img style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }} onError={(e) => {
                                                    e.target.style.display = 'none'; // Hide the img tag on error
                                                }} src={user?.Company?.CompanyLogo || profile} alt="Image" />

                                            </div> {user.Company?.CompanyName}</td>
                                           

                                            <td> <p onClick={() => {
                                                dispatch(updateTabData({...tabData, Tab : 'viewUsersDepartments'}))
                                                dispatch(changeId(user.Company?._id))
                                                
                                            }} className={style.click}>View</p></td>

                                        </tr>

                                    )

                                })
                            }
                        </table>
                    )}
                </div>
                <div className={style.Btns}>
                    {startIndex > 0 && (

                        <button onClick={backPage}>
                            {'<< '}Back
                        </button>
                    )}
                    {allDataArr?.length > endIndex && (

                        <button onClick={nextPage}>
                            next{'>> '}
                        </button>
                    )}
                </div>
            </div>





            {
                showBox && (

                    <div class={style.alertparent}>
                        <div class={style.alert}>

                            <p class={style.msg}>{dataToShow}</p>

                            <div className={style.alertbtns}>

                                <button onClick={() => {
                                    setShowBox(false);

                                }} className={style.btn2}>OK</button>

                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}

export default UsersCompanies
