
import style from './AddUsers.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { FaMinus } from 'react-icons/fa'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { updateTabData } from '../../redux/slices/tabSlice';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { setLoading } from '../../redux/slices/loading';

function AddUsers() {


    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const [companies, setCompanies] = useState(null);
    const [allDepartments, setAllDepartments] = useState();
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [departmentsToShow, setDepartmentsToShow] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [users, setUsers] = useState([]);
    const updateUsers = (event, index) => {
        const updatedUsers = [...users];
        // Update the existing object at the specified index
        updatedUsers[index][event.target.name] = event.target.value;
        setUsers(updatedUsers);
    }
    const userToken = Cookies.get('userToken');

    useEffect(() => {
        dispatch(setLoading(true));
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-all-departments`, { headers: { Authorization: `Bearer ${userToken}` } }).then((response) => {
            // Those Companies which have some departments
            setAllDepartments(response.data.data);
            // Create a Set to keep track of unique property values
            const uniqueCompanyObjects = new Set();
            // Use reduce to build the new array with distinct property values
            const UniqueCompanyDepartments = response.data.data.reduce((acc, obj) => {
                const CompanyId = obj.Company?._id;
                // Check if the property value is already in the Set
                if (!uniqueCompanyObjects.has(CompanyId)) {
                    // Add the property value to the Set and include the object in the new array
                    uniqueCompanyObjects.add(CompanyId);
                    acc.push(obj);
                }
                return acc;
            }, []);
            dispatch(setLoading(false));
            setCompanies(UniqueCompanyDepartments);
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])

    useEffect(() => {
        setDataToSend({ ...dataToSend, Users: users });
    }, [users])




    const addUser = () => {
        const updatedUsers = [...users];
        updatedUsers.push({});
        setUsers(updatedUsers);
    }

    const clearLastUser = () => {
        if (users.length > 0) {

            const updatedUsers = [...users]
            updatedUsers.pop();
            setUsers(updatedUsers)
        }
    };


    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])

    const alertManager = () => {
        setalert(!alert)
    }


    function generateRandomPassword(index) {
        const lowercaseCharset = 'abcdefghijklmnopqrstuvwxyz';
        const uppercaseCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numberCharset = '0123456789';

        let password = '';

        // Ensure at least one lowercase character
        password += lowercaseCharset.charAt(Math.floor(Math.random() * lowercaseCharset.length));

        // Ensure at least one uppercase character
        password += uppercaseCharset.charAt(Math.floor(Math.random() * uppercaseCharset.length));

        // Ensure at least one number
        password += numberCharset.charAt(Math.floor(Math.random() * numberCharset.length));

        // Generate the remaining characters
        for (let i = 3; i < 8; i++) {
            const charset = lowercaseCharset + uppercaseCharset + numberCharset;
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        // Shuffle the password characters to randomize their positions
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        CheckPassword(password, index)
        return password;
    }




    function CheckPassword(submittedPassword, index) {
        if (submittedPassword?.length < 8) {

            const updatedUsers = [...users];
            updatedUsers[index].validationMessage = 'Password must be at least 8 characters long.'
            setUsers(updatedUsers);
            return;
        }

        if (
            !/[a-z]/.test(submittedPassword) ||
            !/[A-Z]/.test(submittedPassword) ||
            !/[0-9]/.test(submittedPassword)
        ) {
            const updatedUsers = [...users];
            updatedUsers[index].validationMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
            setUsers(updatedUsers);

            return;
        }

        // Password is valid
        const updatedUsers = [...users];
        updatedUsers[index].validationMessage = 'Password is valid!'
        setUsers(updatedUsers);

    }

    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();

    useEffect(() => {
        console.log(selectedCompany);
        if (selectedCompany) {
            setDepartmentsToShow(allDepartments.filter((depObj) => depObj.Company._id === selectedCompany.Company._id));
        }
    }, [selectedCompany])


    const makeRequest = () => {
        const userToken = Cookies.get('userToken');

        if (dataToSend.Users.length > 0) {

            if (dataToSend.Users.filter((obj) => obj.validationMessage !== 'Password is valid!').length === 0) {
                dispatch(setLoading(true));
                axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-user`, dataToSend, { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
                    dispatch(setLoading(false));
                    setDataToSend(null);
                    if (res.data.status === 201) {
                        Swal.fire({
                            title: 'Success',
                            text: res.data.message,
                            icon: 'success',
                            confirmButtonText: 'Go!',
                        })
                    } else {
                        Swal.fire({
                            title: 'Success',
                            text: 'Submitted Successfully',
                            icon: 'success',
                            confirmButtonText: 'Go!',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                dispatch(updateTabData({ ...tabData, Tab: 'Users Details' }))
                            }
                        })
                    }
                }).catch(err => {
                    dispatch(setLoading(false));
                    Swal.fire({
                        icon : 'error',
                        title : 'OOps..',
                        text : 'Something went wrong, Try Again!'
                    })
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Kindly Provide Valid Passwords!',
                    confirmButtonText: 'OK.'
                })
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Add At least one Team Member!',
                confirmButtonText: 'OK.'
            })
        }
    }






    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row px-lg-5 mx-lg-5 px-2 mx-2 my-1'>
                        <BsArrowLeftCircle role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                            {
                                dispatch(updateTabData({ ...tabData, Tab: 'Users Details' }))


                            }
                        }} />

                    </div>
                    <div className={`${style.headers} d-flex justify-content-start ps-3 align-items-center `}>
                        <div className={style.spans}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <div className={`${style.heading} ms-3 `}>
                            Add Users
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();


                        alertManager();


                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>

                            <div className={style.formDivider}>
                                <div className={style.sec1}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p></p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <select onChange={(e) => {

                                                const depCompanyObj = JSON.parse(e.target.value);

                                                setSelectedCompany(depCompanyObj);


                                                setDataToSend({ ...dataToSend, companyId: depCompanyObj.Company._id })
                                            }} style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Select Company</option>
                                                {companies?.map((depCompany) => {

                                                    return (
                                                        <option value={JSON.stringify(depCompany)}>{depCompany.Company?.CompanyName}</option>
                                                    )
                                                })}


                                            </select>

                                        </div>
                                    </div>




                                </div>
                                <div className={style.sec2}>
                                    <div className={style.inputParent}>
                                        <div className={style.para}>
                                            <p></p>

                                        </div>
                                        <div className='border border-dark-subtle'>


                                            <select onChange={(e) => {

                                                const depObj = JSON.parse(e.target.value);

                                                setSelectedDepartment(depObj);


                                                setDataToSend({ ...dataToSend, departmentId: depObj._id })
                                            }} name='DepartmentIndex' style={{ width: "100%" }} required>
                                                <option value="" selected >Select Department</option>

                                                {departmentsToShow?.map((depObj, i) => {
                                                    console.log(depObj)
                                                    return (
                                                        <option value={JSON.stringify(depObj)}>{depObj.DepartmentName}</option>
                                                    )
                                                })}


                                            </select>







                                        </div>
                                    </div>

                                </div>
                            </div>



                            {users?.map((user, index) => {
                                return (

                                    <div className='bg-white   m-lg-5 m-2 p-3 '>
                                        <div className='row'>

                                            <div className='col-lg-6 col-md-12 p-2'>
                                                <input onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.Name} name='Name' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='User Name' required />
                                                <input onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.PhoneNo} name='PhoneNo' type='number' className='p-3 bg-light my-3 w-100 border-0' placeholder='Phone Number' required />
                                                <input onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.UserName} name='UserName' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='username (for login)' required />

                                                <div className='d-flex flex-row'>

                                                    <input onChange={(event) => {
                                                        updateUsers(event, index);
                                                        CheckPassword(user.Password, index);
                                                    }} value={user.Password} name='Password' type='text' className='p-3 bg-light mt-3 mb-1 w-100 border-0' placeholder='Password' required />
                                                    <a onClick={() => {
                                                        const newPassword = generateRandomPassword(index);
                                                        const updatedUsers = [...users];
                                                        // Update the existing object at the specified index
                                                        updatedUsers[index].Password = newPassword;
                                                        setUsers(updatedUsers);
                                                    }} className='btn btn-outline-primary my-4'>Generate</a>
                                                </div>
                                                {user.validationMessage && (
                                                    <p className={`${user.validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'} ms-2`}>{user.validationMessage}</p>
                                                )}

                                            </div>
                                            <div className='col-lg-6 col-md-12 p-2'>
                                                <input onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.Designation} name='Designation' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='User Designation' required />
                                                <input onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.Email} name='Email' type='email' className='p-3 bg-light my-3 w-100 border-0' placeholder='Email Addess' required />
                                                <select onChange={(event) => {
                                                    updateUsers(event, index)
                                                }} value={user.Role} name='Role' type='text' className='p-3 bg-light my-3 w-100 border-0' required>
                                                    <option selected disabled>Role</option>
                                                    <option value='Manager'>Manager</option>
                                                    <option value='Executive'>Executive</option>
                                                </select>

                                            </div>
                                        </div>

                                    </div>
                                )
                            })}

                            <div className='d-flex justify-content-center p-lg-5 py-4 px-2'>

                                <a onClick={addUser} className='btn btn-outline-danger py-2 fs-4 w-50'>Add User</a>
                                {users.length > 0 && (

                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',

                                    }} onClick={clearLastUser} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                )}
                            </div>
                        </div>


                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-between`}>
                            <div className={style.inputParent}>
                                <div className={style.para}>
                                    <p></p>
                                </div>
                                <div className='border w-50 border-dark-subtle'>
                                    <select className='w-100' name='Department'  >
                                        <option value="" selected >Added Members</option>

                                        {users?.map((user) => {

                                            return (

                                                <option disabled>{user.Name}</option>
                                            )
                                        })}


                                    </select>


                                </div>
                            </div>
                            <button type='submit' >Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            {
                alert ?
                    <div class={style.alertparent}>
                        <div class={style.alert}>
                            <p class={style.msg}>Do you want to submit this information?</p>
                            <div className={style.alertbtns}>
                                <button onClick={() => {
                                    alertManager();
                                    makeRequest();

                                }
                                } className={style.btn1}>Submit</button>


                                <button onClick={alertManager} className={style.btn2}>Cancel</button>

                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AddUsers
