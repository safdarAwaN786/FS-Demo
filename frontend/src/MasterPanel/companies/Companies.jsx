
import style from './Companies.module.css'
import Search from '../../assets/images/employees/Search.svg'
import add from '../../assets/images/employees/Application Add.svg'
import { useEffect, useState } from 'react'
import axios from "axios";
import profile from '../../assets/images/addEmployee/prof.svg'
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';

function Companies() {

    const [companiesList, setCompaniesList] = useState(null);
    const [showBox, setShowBox] = useState(false);
    const tabData =  useSelector(state => state.tab);
    const [dataToShow, setDataToShow] = useState(null);
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(8);
    const [allDataArr, setAllDataArr] = useState(null);
    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        dispatch(setSmallLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-companies`, { headers: { Authorization: `${user.Department._id}` } }).then((response) => {
            dispatch(setSmallLoading(false));
            setAllDataArr(response.data.data)
            console.log(response.data);
            setCompaniesList(response.data.data.slice(startIndex, endIndex));
        }).catch(err => {
            dispatch(setSmallLoading(false));
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
        setCompaniesList(allDataArr?.slice(startIndex, endIndex))
    }, [startIndex, endIndex])


    const dispatch = useDispatch();
    const search = (event) => {
        if (event.target.value !== "") {
            const searchedList = allDataArr.filter((obj) =>
                obj.CompanyId.includes(event.target.value) || obj?.CompanyName?.includes(event.target.value)
            )
            setCompaniesList(searchedList);
        } else {
            setCompaniesList(allDataArr?.slice(startIndex, endIndex))
        }
    }


    return (
        <>

                <div className={style.searchbar}>
                    <div className={style.sec1}>
                        <img src={Search} alt="" />
                        <input onChange={search} type="text" placeholder='Search Company by name or Id' />
                    </div>
                    {tabData?.Creation && (

                        <div className={style.sec2} onClick={() => {
                            dispatch(updateTabData({...tabData, Tab : 'addCompany'}))
                        }}>
                            <img src={add} alt="" />
                            <p>Add New</p>
                        </div>
                    )}
                </div>
                <div className={style.tableParent}>
                    {!companiesList || companiesList?.length === 0 ? (
                        <div className='w-100 d-flex align-items-center justify-content-center'>
                            <p className='text-center'>No any Records Available here.</p>
                        </div>
                    ) : (

                        <table className={style.table}>
                            <tr className={style.headers}>
                                <td>Company ID</td>
                                <td>Company Name</td>
                                <td>Short Name</td>
                                <td>Email</td>
                                <td>Address</td>
                                <td>Contact #</td>
                            </tr>
                            {
                                companiesList?.map((company, i) => {
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
                                            }}>{company.CompanyId}</p></td>
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
                                                }} src={company.CompanyLogo || profile} alt="Image" />

                                            </div> {company.CompanyName}</td>
                                            <td>{company.ShortName}</td>
                                            <td>{company.Email}</td>
                                            <td>{company.Address}</td>
                                            <td>{company.PhoneNo}</td>
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

export default Companies
