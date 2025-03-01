import style from './AddProductDetails.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import html2pdf from 'html2pdf.js';
import dayjs from 'dayjs'

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
                icon: 'error',
                title: 'OOps..',
                text: 'Something went wrong, Try Again!'
            })
        })
    }, [])
    const downloadPDF = async () => {
        var element = document.getElementById('printable');
        var opt = {
            margin: [1.3, 0, 0, 0],
            filename: `${user.Department.DepartmentName}-doc.pdf`,
            enableLinks: false,
            pagebreak: { mode: 'avoid-all' },
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 4 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).toPdf().get('pdf').then(async function (pdf) {
            pdf.insertPage(1);
            var totalPages = pdf.internal.getNumberOfPages();
            //print current pdf width & height to console
            console.log("getHeight:" + pdf.internal.pageSize.getHeight());
            console.log("getWidth:" + pdf.internal.pageSize.getWidth());
            for (var i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFillColor(0, 0, 0);
                if (i === 1) {
                    try {
                        console.log(user.Company.CompanyLogo);
                        const response = await fetch(user.Company.CompanyLogo);
                        const blob = await response.blob();
                        const imageBitmap = await createImageBitmap(blob);
                        // create a canvas element and draw the image bitmap on it
                        const canvas = document.createElement('canvas');
                        canvas.width = imageBitmap.width;
                        canvas.height = imageBitmap.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(imageBitmap, 0, 0);
                        // get the data URL of the canvas
                        const dataURL = canvas.toDataURL('image/jpeg');
                        // pass the data URL to the pdf.addImage method
                        pdf.addImage(dataURL, 'JPEG', 1, 2.5, 3, 3);
                        pdf.setFontSize(20);
                        pdf.text(`Company : ${user.Company.CompanyName}`, (1), (pdf.internal.pageSize.getHeight() / 2));
                        pdf.setFontSize(15)
                        const address = `Address : ${user.Company.Address}`;
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        const margins = 1; // Adjust margins as needed
                        const maxWidth = pageWidth - margins * 2; // Calculate usable width
                        const wrappedAddress = pdf.splitTextToSize(address, maxWidth);

                        pdf.text(wrappedAddress, 1, (pdf.internal.pageSize.getHeight() / 2) + 0.5);

                        pdf.setLineWidth(0.1); // Example line width
                        pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        // pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        // pdf.text(`${dataToSend.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${dataToSend.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${dayjs(dataToSend.CreationDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        pdf.text(`${dataToSend.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                        if (dataToSend.Status == 'Approved') {
                            pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text(`${dataToSend.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text(`${dayjs(dataToSend.ApprovalDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                        }
                        if (dataToSend.ReviewedBy) {
                            pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text(`${dataToSend.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                            pdf.text(`${dayjs(dataToSend.ReviewDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    pdf.text('Product Details', (pdf.internal.pageSize.getWidth() / 2) - 1.3, 0.5);
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text(`Doc ID : ${dataToSend.DocumentId}`, pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`Revision No : ${dataToSend.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    if (dataToSend.Status == 'Approved') {
                        pdf.text(`Issue Date : ${dayjs(dataToSend.ApprovalDate).format('DD/MM/YYYY')}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    }
                }
            }
        }).save();
    };
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
                        <div id='printable' className={`${style.myBox} bg-light pb-3`}>
                            <div className='bg-white   m-lg-5 m-2 p-3 '>
                                <div className='row'>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off' name='Name' value={product.Name} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Name' required readOnly />
                                        <input autoComplete='off' name='RawMaterial' value={product.RawMaterial} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Raw Material' required readOnly />
                                        <textarea value={product.PhysicalProperties} name='PhysicalProperties' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Physical Properties' required readOnly />
                                        <textarea value={product.ProductDescription} name='ProductDescription' type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Product Description' required readOnly />
                                        <textarea name='Allergens' value={product.Allergens} type='text' className='p-3 bg-light  my-3 w-100 border-0' placeholder='Allergens' required readOnly />
                                        <textarea value={product.StorageConditions} name='StorageConditions' type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Storage Conditions' required readOnly />
                                        <textarea name='Transportation' value={product.Transportation} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Transportation' required readOnly />
                                    </div>
                                    <div className='col-lg-6 col-md-12 p-2'>
                                        <input autoComplete='off' name='Origin' value={product.Origin} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Origin' required readOnly />
                                        <input autoComplete='off' name='PackingMaterial' value={product.PackingMaterial} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Packing Material' required readOnly />
                                        <textarea name='ChemicalProperties' value={product.ChemicalProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Chemical Properties' required readOnly />
                                        <textarea name='MicrobialProperties' value={product.MicrobialProperties} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Microbial Properties' required readOnly />
                                        <textarea name='IntendedUsers' value={product.IntendedUsers} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Intended users' required readOnly />
                                        <textarea name='LabellingInstructions' value={product.LabellingInstructions} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Labelling Instructions' required readOnly />
                                        <textarea name='FoodSafetyRisk' value={product.FoodSafetyRisk} type='text' className='p-3 bg-light  my-3  w-100 border-0' placeholder='Food Safety Risks' required readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`${style.btn} px-lg-4 px-2 d-flex justify-content-center`}>
                            <button onClick={downloadPDF} type='button' >Download</button>
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
