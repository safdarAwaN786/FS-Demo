
import style from './AddProductDetails.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function AddProductDetails() {

    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [product, setProduct] = useState({});
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const [departmentsToShow, SetDepartmentsToShow] = useState(null);
    const user = useSelector(state => state.auth?.user);

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-department/${user?.Company?._id}`).then((res) => {
            SetDepartmentsToShow(res.data.data);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])




    const updateProduct = (event) => {
        setProduct({ ...product, [event.target.name]: event.target.value });
    }

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, ProductDetails: product });
    }, [product])

    const makeRequest = () => {

        dispatch(setSmallLoading(true))
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-product`, { ...dataToSend, createdBy: user.Name }, { headers: { Authorization: `${user._id}` } }).then(() => {
            setDataToSend(null);
            Swal.fire({
                title: 'Success',
                text: 'Submitted Successfully',
                icon: 'success',
                confirmButtonText: 'Go!',
            }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(updateTabData({ ...tabData, Tab: 'Describe Product' }))
                }
            })
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }

    return (
        <>
            <div className={`${style.parent} mx-auto`}>
                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Describe Product' }))
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
                            Add Product Description
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
                                            <p>Document Type</p>
                                        </div>
                                        <div className='border border-dark-subtle'>
                                            <select className='form-select  form-select-lg' value={dataToSend?.DocumentType} name='DocumentType' onChange={(e) => {
                                                setDataToSend({ ...dataToSend, [e.target.name]: e.target.value })
                                            }} style={{ width: "100%" }} required >
                                                <option value="" selected disabled>Choose Type</option>
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
                                            <p>Department</p>
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
                            <div className='bg-white   m-lg-5 m-2 p-3 '>
                                <div className='row'>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off' name='Name' onChange={(event) => {
                                            updateProduct(event)
                                        }} value={product.Name} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Name' required />
                                        <input autoComplete='off' name='RawMaterial' onChange={(event) => {
                                            updateProduct(event)
                                        }} value={product.RawMaterial} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Raw Material' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} value={product.PhysicalProperties} name='PhysicalProperties' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Physical Properties' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} value={product.ProductDescription} name='ProductDescription' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Product Description' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='Allergens' value={product.Allergens} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Allergens' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} value={product.StorageConditions} name='StorageConditions' type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Storage Conditions' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='Transportation' value={product.Transportation} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Transportation' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='ShelfLife' value={product.ShelfLife} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Shelf Life' required />
                                         <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='Consumer' value={product.Consumer} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Consumer' required />

                                    </div>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off' onChange={(event) => {
                                            updateProduct(event)
                                        }} name='Origin' value={product.Origin} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Origin' required />
                                        <input autoComplete='off' onChange={(event) => {
                                            updateProduct(event)
                                        }} name='PackingMaterial' value={product.PackingMaterial} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Packing Material' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='ChemicalProperties' value={product.ChemicalProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Chemical Properties' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='MicrobialProperties' value={product.MicrobialProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Microbial Properties' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='IntendedUsers' value={product.IntendedUsers} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Intended users' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='LabellingInstructions' value={product.LabellingInstructions} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Labelling Instructions' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='FoodSafetyRisk' value={product.FoodSafetyRisk} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Food Safety Risks' required />
                                        <textarea onChange={(event) => {
                                            updateProduct(event)
                                        }} name='TargetMarket' value={product.TargetMarket} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Target Market' required />
                                       
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
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
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cencel</button>
                            </div>
                        </div>
                    </div> : null
            }

        </>
    )
}

export default AddProductDetails
