
import style from './CreateDocument.module.css'
import { useEffect, useRef, useState } from 'react'
import axios from "axios";
import { BsArrowLeftCircle } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { updateTabData } from '../../redux/slices/tabSlice';
import { setSmallLoading } from '../../redux/slices/loading';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js'
import dayjs from 'dayjs';

function ViewDocument() {

    const [documentData, setDocumentData] = useState(null);
    const [alert, setalert] = useState(false);
    const alertManager = () => {
        setalert(!alert)
    }
    const user = useSelector(state => state.auth.user);
    const tabData = useSelector(state => state.tab);
    const dispatch = useDispatch();
    const idToWatch = useSelector(state => state.idToProcess);

    const downloadPDF = async () => {
        dispatch(setSmallLoading(true))
        var element = document.getElementById('printable');
        const contentBox = document.getElementById('content-box');

        // Clone the contentBox instead of moving it
        const clonedContentBox = contentBox.cloneNode(true);

        // Add a forced page break div before appending the cloned content
        const pageBreakDiv = document.createElement('div');
        pageBreakDiv.style.pageBreakBefore = 'always'; // Ensures a new page starts
        pageBreakDiv.style.height = '0px'; // Keep it hidden

        element.appendChild(pageBreakDiv); // Insert page break
        element.appendChild(clonedContentBox); // Now append content after page break
        var opt = {
            margin: [1.3, 0.2, 0.2, 0.2],
            filename: `${user.Department.DepartmentName}-doc.pdf`,
            enableLinks: false,
            pagebreak: { mode: ['avoid-all', 'css'] },
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
                        const pageWidth = pdf.internal.pageSize.getWidth();
                        // pass the data URL to the pdf.addImage method
                        console.log(pageWidth);
                        
                        pdf.addImage(dataURL, 'JPEG', ((pageWidth - 3) / 2), 2.5, 3, 3);
                        pdf.setFontSize(20);
                        pdf.text(`${user.Company.CompanyName}`, ((pageWidth - pdf.getTextWidth(user.Company.CompanyName)) / 2), (pdf.internal.pageSize.getHeight() / 2));
                        pdf.setFontSize(15)
                        const address = `${user.Company.Address}`;
                        const margins = 1; // Adjust margins as needed
                        const maxWidth = pageWidth - margins * 2; // Calculate usable width
                        const wrappedAddress = pdf.splitTextToSize(address, maxWidth);
                        
                        const yStart = (pdf.internal.pageSize.getHeight() / 2) + 0.4; // Starting Y position
                        

                        wrappedAddress.forEach((line, index) => {
                            const textWidth = pdf.getTextWidth(line);
                            pdf.text(line, (pageWidth - textWidth) / 2, yStart + index * 0.25);
                        });

                        // pdf.setLineWidth(0.01); // Example line width
                        // pdf.line(0.1, (pdf.internal.pageSize.getHeight() / 2) + 1, pdf.internal.pageSize.getWidth() - 0.2, (pdf.internal.pageSize.getHeight() / 2) + 1)
                        // pdf.text("Document Id", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        // pdf.text(`${dataToSend.ChecklistId}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.5);
                        pdf.text("Created By", 1, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text(`${documentData.CreatedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 1.8);
                        pdf.text("Creation Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        pdf.text(`${dayjs(documentData.CreationDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.1);
                        if (documentData.ReviewedBy) {
                            pdf.text("Reviewed By", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                            pdf.text(`${documentData.ReviewedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.4);
                            pdf.text("Reviewed Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                            pdf.text(`${dayjs(documentData.ReviewDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 2.7);
                        }
                        if (documentData.Status == 'Approved') {
                            pdf.text("Approved By", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text(`${documentData.ApprovedBy}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.0);
                            pdf.text("Approval Date", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                            pdf.text(`${dayjs(documentData.ApprovalDate).format('DD/MM/YYYY')}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.3);
                        }
                        pdf.text("Revision Number", 1, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                        pdf.text(`${documentData.RevisionNo}`, 5, (pdf.internal.pageSize.getHeight() / 2) + 3.6);
                    } catch (error) {
                        console.log(error);
                    }
                } else {
                    pdf.setFontSize(15)
                    const title = documentData?.DocumentTitle;
                    const titleWidth = pdf.getTextWidth(title);
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    pdf.text(title, (pageWidth - titleWidth) / 2, 0.5); // Centering the title
                    pdf.setFontSize(10);
                    pdf.text(`${user.Company.CompanyName}`, pdf.internal.pageSize.getWidth() - 2, 0.3);
                    pdf.text(`Doc ID : ${documentData.DocumentId}`, pdf.internal.pageSize.getWidth() - 2, 0.5);
                    pdf.text(`Revision No :${documentData.RevisionNo}`, pdf.internal.pageSize.getWidth() - 2, 0.7);
                    if (documentData.Status == 'Approved') {
                        pdf.text(`Issue Date : ${dayjs(documentData.ApprovalDate).format('DD/MM/YYYY')}`, pdf.internal.pageSize.getWidth() - 2, 0.9);
                    }
                }
            }
        }).save();

        setTimeout(() => {
            element.removeChild(clonedContentBox); // Remove only the cloned element
            dispatch(setSmallLoading(false));
        }, 3000);
    };

    useEffect(() => {
        dispatch(setSmallLoading(true))
        axios.get(`${process.env.REACT_APP_BACKEND_URL}/get-documentById/${idToWatch}`).then((response) => {
            setDocumentData(response.data.data);
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




    return (
        <>
            <div className={`${style.parent} mx-auto`}>


                <div className={`${style.subparent} mx-2 mx-sm-4 mt-5 mx-lg-5`}>
                    <div className='d-flex flex-row bg-white px-lg-5 mx-lg-5 mx-3 px-2 py-2'>
                        <BsArrowLeftCircle
                            role='button' className='fs-3 mt-1 text-danger' onClick={(e) => {
                                {
                                    dispatch(updateTabData({ ...tabData, Tab: 'Master List of Documents' }))
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
                            View Document
                        </div>
                    </div>
                    <form encType='multipart/form-data' onSubmit={(event) => {
                        event.preventDefault();

                    }}>
                        <div className={style.myBox}>
                            <div id='printable'>
                                <div className={style.formDivider}>
                                    <div className={style.sec1}>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Document Title</p>
                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={documentData?.DocumentTitle} readOnly />

                                            </div>
                                        </div>

                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Revision No.</p>

                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={documentData?.RevisionNo} readOnly />
                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Department</p>
                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={documentData?.Department.DepartmentName} readOnly />
                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Created Date</p>
                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={`${documentData?.CreationDate?.slice(0, 10).split('-')[2]}/${documentData?.CreationDate?.slice(0, 10).split('-')[1]}/${documentData?.CreationDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Review Date</p>

                                            </div>
                                            <div>
                                                {documentData?.ReviewDate ? (
                                                    <input autoComplete='off' className='text-dark' value={`${documentData?.ReviewDate?.slice(0, 10).split('-')[2]}/${documentData?.ReviewDate?.slice(0, 10).split('-')[1]}/${documentData?.ReviewDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                                ) : (
                                                    <input autoComplete='off' className='text-dark' value='- - -' />
                                                )}

                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Approval Date</p>

                                            </div>
                                            <div>
                                                {documentData?.ApprovalDate ? (

                                                    <input autoComplete='off' className='text-dark' value={`${documentData?.ApprovalDate?.slice(0, 10).split('-')[2]}/${documentData?.ApprovalDate?.slice(0, 10).split('-')[1]}/${documentData?.ApprovalDate?.slice(0, 10).split('-')[0]}`} readOnly />
                                                ) : (
                                                    <input autoComplete='off' className='text-dark' value='- - -' />
                                                )}


                                            </div>
                                        </div>


                                    </div>
                                    <div className={style.sec2}>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Document ID</p>

                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={documentData?.DocumentId} readOnly />


                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Document Type</p>

                                            </div>
                                            <div>
                                                <input autoComplete='off' className='text-dark' value={documentData?.DocumentType} readOnly />


                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Created By</p>

                                            </div>
                                            <div>

                                                <input autoComplete='off' className='text-dark' value={documentData?.CreatedBy} readOnly />


                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Reviewed By</p>

                                            </div>
                                            <div>
                                                {documentData?.ReviewedBy ? (

                                                    <input autoComplete='off' className='text-dark' value={documentData?.ReviewedBy} readOnly />
                                                ) : (
                                                    <input autoComplete='off' value='- - -' />
                                                )}


                                            </div>
                                        </div>
                                        <div className={style.inputParent}>
                                            <div className={style.para}>
                                                <p className='text-black'>Approved By</p>

                                            </div>
                                            <div>
                                                {documentData?.ApprovedBy ? (

                                                    <input autoComplete='off' className='text-dark' value={documentData?.ApprovedBy} readOnly />
                                                ) : (
                                                    <input autoComplete='off' className='text-dark' value='- - -' />
                                                )}


                                            </div>
                                        </div>



                                    </div>
                                </div>
                            </div>

                            <div className='mx-2 p-lg-5 p-2'>

                                <div className='bg-white' style={{
                                    height: '450px',
                                    overflowY: 'scroll',
                                    border: '2px solid silver'
                                }}  >

                                    <div id='content-box' className='p-5' dangerouslySetInnerHTML={{ __html: documentData?.EditorData }} />
                                </div>
                            </div>
                        </div>

                        <div className={style.btn}>
                            <button onClick={downloadPDF} type='button' >Download</button>
                        </div>
                    </form>
                </div>
            </div>


        </>
    )
}

export default ViewDocument
