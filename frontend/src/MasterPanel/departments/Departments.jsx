
import style from './Departments.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import profile from '../../assets/images/addEmployee/prof.svg'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { changeId } from '../../redux/slices/idToProcessSlice';
import Cookies from 'js-cookie';
import { setLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function Departments() {

    const [depCompaniesList, setDepCompaniesList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-departments`, { headers: { Authorization: `${user._id}` } }).then((response) => {
            // Create a Set to keep track of unique property values
            const uniqueCompanyObjects = new Set();
            // Use reduce to build the new array with distinct property values
            const UniqueCompanyDepartments = response.data.data.reduce((acc, obj) => {
                const  CompanyId  = obj.Company?._id;
                // Check if the property value is already in the Set
                if (!uniqueCompanyObjects.has(CompanyId)) {
                    // Add the property value to the Set and include the object in the new array
                    uniqueCompanyObjects.add(CompanyId);
                    acc.push(obj);
                }
                return acc;
            }, []);
            dispatch(setLoading(false));
            setAllDataArr(UniqueCompanyDepartments)
            setDepCompaniesList(UniqueCompanyDepartments.slice(startIndex, endIndex));
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
        setDepCompaniesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const search = (event) => {
        if (event.target.value !== "") {
            console.log(event.target.value);
            const searchedList = allDataArr.filter((obj) =>
                obj.Comapany.CompanyId.includes(event.target.value) || obj?.CompanyName?.includes(event.target.value)
            )
            setDepCompaniesList(searchedList);
        } else {
            setDepCompaniesList(allDataArr?.slice(startIndex, endIndex))
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
                            dispatch(updateTabData({...tabData, Tab : 'addDepartments'}));
                        }}>
                            <img src={add} alt="" />
                            <p>Add Department</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!depCompaniesList || depCompaniesList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Company ID</td>
                                <td>Company Name</td>
                                <td>Short Name</td>
                                <td>Departments</td>
                            </tr>
                            {
                                depCompaniesList?.map((depCompany, i) => {
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
                                            }}>{depCompany.Company?.CompanyId}</p></td>
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
                                                }} src={depCompany.Company?.CompanyLogo || profile} alt="Image" />
                                            </div> {depCompany.Company?.CompanyName}</td>
                                            <td>{depCompany.Company?.ShortName}</td>
                                            <td> <p onClick={() => {
                                                 dispatch(updateTabData({...tabData, Tab : 'viewDepartments'}));
                                                 console.log(depCompany.Company)
                                                dispatch(changeId(depCompany.Company._id))
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

export default Departments
