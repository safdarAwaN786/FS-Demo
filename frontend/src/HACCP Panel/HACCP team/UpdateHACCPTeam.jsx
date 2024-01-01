import style from './AddHACCPTeam.module.css'
import { useEffect, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { FaMinus } from 'react-icons/fa'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setLoading } from '../../redux/slices/loading';

function UpdateHACCPTeam() {
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const [finalFormData, setFinalFormData] = useState(null);
    const [alert, setalert] = useState(false);
    const [dataToSend, setDataToSend] = useState(null);
    const tabData = useSelector(state => state.tab);
    const userToken = Cookies.get('userToken');
    const idToWatch = useSelector(state => state.idToProcess);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [members, setMembers] = useState([]);

    const updateMembers = (event, index) => {
        const updatedMembers = [...members];
        if (updatedMembers[index]) {
            // Update the existing object at the specified index
            updatedMembers[index][event.target.name] = event.target.value;
        } else {
            // Create a new object with the given property and value
            const newObject = {
                [event.target.name]: event.target.value
            };

            // Insert the new object at the specified index
            updatedMembers.splice(index, 0, newObject);
        }

        setMembers(updatedMembers);
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, TeamMembers: members });
    }, [members])

    useEffect(() => {
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`, { headers: { Authorization: `${user._id}` } }).then((res) => {
            SetDepartmentsToShow(res.data.data);
            if (members) {
                dispatch(setLoading(false))
            }
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
        dispatch(setLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-haccp-team/${idToWatch}`, { headers: { Authorization: `${user._id}` } }).then((res) => {
            setDataToSend(res.data.data);
            setMembers(res.data.data.TeamMembers);
            if (departmentsToShow) {
                dispatch(setLoading(false))
            }
        }).catch(err => {
            dispatch(setLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])


    const addMember = () => {
        const updatedMembers = [...members];
        updatedMembers.push({});
        setMembers(updatedMembers);
    }

    const clearLastMember = () => {
        if (members.length > 0) {

            const updatedMembers = [...members]
            updatedMembers.pop();
            setMembers(updatedMembers)
        }
    };
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

            const updatedMembers = [...members];
            updatedMembers[index].validationMessage = 'Password must be at least 8 characters long.'
            setMembers(updatedMembers);
            return;
        }

        if (
            !/[a-z]/.test(submittedPassword) ||
            !/[A-Z]/.test(submittedPassword) ||
            !/[0-9]/.test(submittedPassword)
        ) {
            const updatedMembers = [...members];
            updatedMembers[index].validationMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
            setMembers(updatedMembers);

            return;
        }

        // Password is valid
        const updatedMembers = [...members];
        updatedMembers[index].validationMessage = 'Password is valid!'
        setMembers(updatedMembers);

    }

    useEffect(() => {
        console.log(dataToSend);
    }, [dataToSend])

    const alertManager = () => {
        setalert(!alert)
    }





    const makeRequest = () => {
        if (finalFormData && dataToSend.TeamMembers.length !== 0) {
            dispatch(setLoading(true))
            axios.patch(`${process.env.REACT_APP_BACKEND_URL}/update-haccp-team/${idToWatch}`, finalFormData, { headers: { Authorization: `${user._id}` } }).then(() => {
                dispatch(setLoading(false))
                Swal.fire({
                    title: 'Success',
                    text: 'Submitted Successfully',
                    icon: 'success',
                    confirmButtonText: 'Go!',

                }).then((result) => {
                    if (result.isConfirmed) {
                        dispatch(updateTabData({ ...tabData, Tab: 'HACCP Team Management' }))
                    }
                })

            }).catch(err => {
                dispatch(setLoading(false));
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'Something went wrong, Try Again!'
                })
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Kindly Add At least one Team Member!',
                confirmButtonText: 'OK.'
            })
        }
    }

    const handleDownloadImage = async (imageURL) => {
        try {
            if (imageURL) {

                dispatch(setLoading(true))
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/download-image`, {
                    params: {
                        url: imageURL,
                    },
                    responseType: 'blob', headers: { Authorization: `${user._id}` } // Specify the response type as 'blob' to handle binary data
                });


                let blob;

                blob = new Blob([response.data]);
                // }

                // Create a temporary anchor element
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the download attribute and suggested filename for the downloaded image
                link.download = `${user.Department.DepartmentName}-FSMS${imageURL.substring(imageURL.lastIndexOf('.'))}`;

                // Append the anchor element to the document body and click it to trigger the download
                document.body.appendChild(link);
                dispatch(setLoading(false))
                link.click();
                // Clean up by removing the temporary anchor element
                document.body.removeChild(link);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'OOps..',
                    text: 'No any file uploaded here!'
                })
            }
        } catch (error) {
            dispatch(setLoading(false))
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        }

    };


    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'HACCP Team Management' }))

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
                            Update HACCP Team
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        // Create a new FormData object
                        const formData = new FormData(event.target);
                        // Append the data to the FormData object
                        formData.append('Data', JSON.stringify(dataToSend));
                        setFinalFormData(formData);

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
                                            <select className='form-select  form-select-lg' value={dataToSend?.DocumentType} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} name='DocumentType' style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Document Type</option>
                                                <option value="Manuals">Manuals</option>
                                                <option value="Procedures">Procedures</option>
                                                <option value="SOPs">SOPs</option>
                                                <option value="Forms">Forms</option>

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
                                            <select className='form-select  form-select-lg' value={dataToSend?.Department} onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} name='Department' style={{ width: "100%" }} required>
                                                <option value="" selected disabled>Choose Department</option>
                                                {departmentsToShow?.map((depObj) => {
                                                    return (
                                                        <option value={depObj._id}>{depObj.DepartmentName}</option>
                                                    )
                                                })}

                                            </select>


                                        </div>
                                    </div>

                                </div>
                            </div>



                            {members?.map((member, index) => {
                                return (

                                    <div className='bg-white   m-lg-5 m-2 p-3 '>
                                        <div className='row'>

                                            <div className='col-lg-6 col-md-12 p-2'>
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Name} name='Name' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Name' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Designation} name='Designation' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Designation' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Department} name='Department' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Department' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.TrainingsAttended} name='TrainingsAttended' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Training Attended' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Email} name='Email' type='email' className='p-3 bg-light my-3 w-100 border-0' placeholder='Email' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.UserName} name='UserName' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='User Name' required />
                                            </div>
                                            <div className='col-lg-6 col-md-12 p-2'>
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Education} name='Education' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Education' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.Experience} name='Experience' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Experience' required />
                                                <input onChange={(event) => {
                                                    updateMembers(event, index)
                                                }} value={member.RoleInTeam} name='RoleInTeam' type='text' className='p-3 bg-light my-3 w-100 border-0' placeholder='Role in Team' required />
                                                <div className='p-3 d-flex justify-content-between flex-row  bg-light my-3 w-100 border-0'>
                                                    {member.TrainingDate ? (

                                                        <p className='text-secondary'>{member.TrainingDate?.slice(0, 10).split('-')[2]}/{member.TrainingDate?.slice(0, 10).split('-')[1]}/{member.TrainingDate?.slice(0, 10).split('-')[0]}</p>
                                                    ) : (
                                                        <p>Training Date</p>
                                                    )}

                                                    <input onChange={(event) => {
                                                        updateMembers(event, index)
                                                    }} value={member.TrainingDate} name='TrainingDate' className='bg-light border-0' type='date' placeholder='Training Date' required />

                                                </div>
                                                <div className='d-flex flex-row'>

                                                    <input onChange={(event) => {
                                                        updateMembers(event, index);
                                                        CheckPassword(member.Password, index);
                                                    }} value={member.Password} name='Password' type='text' className='p-3 bg-light mt-3 mb-1 w-100 border-0' placeholder='Password' required />
                                                    <a onClick={() => {
                                                        const newPassword = generateRandomPassword(index);
                                                        const updatedMembers = [...members];
                                                        // Update the existing object at the specified index
                                                        updatedMembers[index].Password = newPassword;
                                                        setMembers(updatedMembers);
                                                    }} className='btn btn-outline-primary my-4'>Generate</a>
                                                </div>
                                                {member.validationMessage && (
                                                    <p className={`${member.validationMessage === 'Password is valid!' ? 'text-success' : 'text-danger'} ms-2`}>{user.validationMessage}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className='d-flex w-100 justify-content-center align-items-center'>
                                            <p><b>Upload Document :</b></p>
                                            <input name={`Document-${index}`} type='file' accept='.pdf' className='p-2 m-2 btn btn-danger ' />
                                            {member.Document && (

                                                <a onClick={() => {
                                                    handleDownloadImage(member.Document)
                                                }} className='btn btn-outline-danger px-2 py-1 mx-1'>Download Document</a>

                                            )}
                                        </div>
                                    </div>
                                )
                            })}

                            <div className='d-flex justify-content-center p-lg-5 py-4 px-2'>

                                <a onClick={addMember} className='btn btn-outline-danger py-2 fs-4 w-50'>Add Member</a>
                                {members.length > 0 && (

                                    <a style={{
                                        borderRadius: '100px',
                                        width: '40px',
                                        height: '40px',

                                    }} onClick={clearLastMember} className='btn  btn-outline-danger mx-4 my-auto pt-1  '><FaMinus /></a>
                                )}
                            </div>
                        </div>


                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-between`}>
                            <div className={style.inputParent}>
                                <div className={style.para}>
                                    <p></p>
                                </div>
                                <div className='border w-50 border-dark-subtle'>
                                    <select className='w-100 form-select  form-select-lg' name='Department'  >
                                        <option value="" selected >Added Members</option>

                                        {members?.map((member) => {

                                            return (

                                                <option disabled>{member.Name}</option>
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

export default UpdateHACCPTeam
