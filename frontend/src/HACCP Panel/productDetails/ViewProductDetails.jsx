import style from './AddProductDetails.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';

function ViewProductDetails() {
    const [dataToSend, setDataToSend] = useState(null);
    const [alert, setalert] = useState(false);
    const [product, setProduct] = useState({});
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth?.user);
    const idToWatch = useSelector(state => state.idToProcess);
    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-product/${idToWatch}`).then((res) => {
            setDataToSend(res.data.data);
            setProduct(res.data.data.ProductDetails);
            dispatch(setSmallLoading(false))
        }).catch(err => {
            dispatch(setSmallLoading(false));
            Swal.fire({
                icon : 'error',
                title : 'OOps..',
                text : 'Something went wrong, Try Again!'
            })
        })
    }, [])

    const alertManager = () => {
        setalert(!alert)
    }

    useEffect(() => {
        setDataToSend({ ...dataToSend, ProductDetails: product });
    }, [product])

    
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
                            Product Description
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();
                        alertManager();
                    }}>
                        <div className={`${style.myBox} bg-light pb-3`}>
                           
                            <div className='bg-white   m-lg-5 m-2 p-3 '>
                                <div className='row'>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off' name='Name'  value={product.Name} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Name' required readOnly/>
                                        <input autoComplete='off' name='RawMaterial'  value={product.RawMaterial} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Raw Material' required readOnly/>
                                        <textarea  value={product.PhysicalProperties} name='PhysicalProperties' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Physical Properties' required readOnly/>
                                        <textarea  value={product.ProductDescription} name='ProductDescription' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Product Description' required readOnly/>
                                        <textarea  name='Allergens' value={product.Allergens} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Allergens' required readOnly/>
                                        <textarea  value={product.StorageConditions} name='StorageConditions' type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Storage Conditions' required readOnly/>
                                        <textarea  name='Transportation' value={product.Transportation} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Transportation' required readOnly/>
                                    </div>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off'  name='Origin' value={product.Origin} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Origin' required readOnly/>
                                        <input autoComplete='off'  name='PackingMaterial' value={product.PackingMaterial} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Packing Material' required readOnly/>
                                        <textarea  name='ChemicalProperties' value={product.ChemicalProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Chemical Properties' required readOnly/>
                                        <textarea  name='MicrobialProperties' value={product.MicrobialProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Microbial Properties' required readOnly/>
                                        <textarea  name='IntendedUsers' value={product.IntendedUsers} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Intended users' required readOnly/>
                                        <textarea  name='LabellingInstructions' value={product.LabellingInstructions} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Labelling Instructions' required readOnly/>
                                        <textarea  name='FoodSafetyRisk' value={product.FoodSafetyRisk} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Food Safety Risks' required readOnly/>
                                    </div>
                                </div>
                            </div>
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
                                    // makeRequest();
                                }} className={style.btn1}>Submit</button>
                                <button onClick={alertManager} className={style.btn2}>Cancel</button>
                            </div>
                        </div>
                    </div> : null
            }
        </>
    )
}

export default ViewProductDetails
