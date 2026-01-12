import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Card,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Alert,
} from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import BASE_URL from "../../Config";
import api from "../../services/axiosInterceptor";
import Logo from '../../assets/logo.jpeg';

const AdminPayments = () => {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState(""); // For date validation error
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Invoice modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Invoice form fields
  const [paymentAmount, setPaymentAmount] = useState("");
  const [gstPercent, setGstPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [paymentdate, setPaymentdate] = useState();
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [viewDetailsData, setViewDetailsData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewDetailsPaymentId, setViewDetailsPaymentId] = useState(null);

  // New state for invoice list modal
  const [showInvoiceListModal, setShowInvoiceListModal] = useState(false);
  const [selectedStudentInvoices, setSelectedStudentInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  // New state for viewing a single invoice
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchPayments = async () => {
    try {
      const response = await api.get(`${BASE_URL}payments`);
      if (response?.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // New function to fetch invoices for a student
  const fetchStudentInvoices = async (studentId) => {
    setLoadingInvoices(true);
    try {
      const response = await api.get(`${BASE_URL}student_invoices/${studentId}`);
      if (response?.data) {
        setSelectedStudentInvoices(response.data);
      }
    } catch (error) {
      console.error("Error fetching student invoices:", error);
      alert("Failed to fetch invoices");
    }
    setLoadingInvoices(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Function to validate date range
  const validateDateRange = (from, to) => {
    if (from && to) {
      const fromDateObj = new Date(from);
      const toDateObj = new Date(to);
      
      // Reset time to compare dates only
      fromDateObj.setHours(0, 0, 0, 0);
      toDateObj.setHours(0, 0, 0, 0);
      
      if (fromDateObj > toDateObj) {
        setDateError("From Date cannot be after To Date");
        return false;
      }
    }
    setDateError("");
    return true;
  };

  // Handle from date change
  const handleFromDateChange = (e) => {
    const newFromDate = e.target.value;
    setFromDate(newFromDate);
    validateDateRange(newFromDate, toDate);
  };

  // Handle to date change
  const handleToDateChange = (e) => {
    const newToDate = e.target.value;
    setToDate(newToDate);
    validateDateRange(fromDate, newToDate);
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSearch("");
    setBranchFilter("");
    setCountryFilter("");
    setPaymentMethodFilter("");
    setPaymentTypeFilter("");
    setPaymentStatusFilter("");
    setFromDate("");
    setToDate("");
    setDateError("");
    setCurrentPage(1); // Reset to first page
  };

  const deletePayment = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await api.delete(`${BASE_URL}payments/${id}`);
        fetchPayments(); // Refresh list after deletion
      } catch (error) {
        console.error("Error deleting payment:", error);
        alert("Failed to delete payment.");
      }
    }
  };

  // New function to delete an invoice
  const deleteInvoice = async (invoiceId) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await api.delete(`${BASE_URL}student_invoice/${invoiceId}`);
        // Refresh the invoices list for this student
        if (selectedPayment) {
          fetchStudentInvoices(selectedPayment.student_id);
        }
        alert("Invoice deleted successfully");
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice.");
      }
    }
  };

  // Open invoice modal and initialize invoice form
  const openInvoiceModal = (payment) => {
    setSelectedPayment(payment);
    // Set default values or from payment
    setPaymentAmount(payment.payment_amount || "");
    setGstPercent(0);
    setTaxPercent(0);
    setDiscount(0);
    setPaymentdate('');
    setNotes("");
    setShowInvoiceModal(true);
  };

  // Close invoice modal
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedPayment(null);
  };

  // Calculate totals for invoice
  const calculateTotals = () => {
    const amt = parseFloat(paymentAmount) || 0;
    const gstAmount = (amt * (parseFloat(gstPercent) || 0)) / 100;
    const taxAmount = (amt * (parseFloat(taxPercent) || 0)) / 100;
    const disc = parseFloat(discount) || 0;
    const total = amt + gstAmount + taxAmount - disc;
    return { amt, gstAmount, taxAmount, disc, total };
  };

  // Generate and save invoice to database (without downloading)
  const generateInvoice = async () => {
    if (!selectedPayment) return;

    try {
      // Prepare totals
      const { amt, gstAmount, taxAmount, disc, total } = calculateTotals();

      // Prepare payload
      const payload = {
        payment_amount: amt.toString(),
        tax: taxAmount.toString(),
        total: total.toString(),
        additional_notes: notes,
        payment_date: paymentdate,
        student_id: selectedPayment?.student_id || "",
      };

      // Save invoice API
      const response = await api.post(`${BASE_URL}student_invoice`, payload);

      if (response.status === 200 || response.status === 201) {
        alert("Invoice created successfully!");
        closeInvoiceModal();
        
        // Refresh payments to update invoice status
        fetchPayments();
        
        // If we're in the invoice list modal, refresh the list
        if (showInvoiceListModal) {
          fetchStudentInvoices(selectedPayment.student_id);
        }
      } else {
        alert("Invoice save failed. Please try again.");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Something went wrong while saving the invoice.");
    }
  };

  // Generate PDF invoice and download it
  const downloadInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Add logo (top-right) with error handling
    if (Logo) {
      doc.addImage(Logo, "PNG", 150, 10, 40, 20);
    }

    // Header
    doc.setFontSize(18);
    doc.text("INVOICE", 14, 22);

    // Student Details
    doc.setFontSize(12);
    doc.text(`Student Name: ${selectedPayment?.name || invoice.name || "N/A"}`, 14, 40);
    doc.text(`Email: ${selectedPayment?.email || invoice.email || "N/A"}`, 14, 48);

    // Format payment & generated dates properly
    const paymentDate = new Date(invoice.payment_date || selectedPayment?.payment_date).toLocaleString("en-IN", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const generatedDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Dhaka",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    doc.text(`Payment Date: ${paymentDate}`, 14, 56);
    doc.text(`Generated On: ${generatedDate}`, 14, 64);

    // Properly formatted table with alignment and BDT symbol
    const tableData = [
      ["Description", "Amount (BDT)"],
      ["Payment Amount", `৳${parseFloat(invoice.payment_amount || 0).toFixed(2)}`],
      ["Tax", `৳${parseFloat(invoice.tax || 0).toFixed(2)}`],
      ["Total", `৳${parseFloat(invoice.total || 0).toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: 74,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
      styles: { fontSize: 11, cellPadding: 4 },
      columnStyles: {
        0: { halign: "left", cellWidth: 90 },
        1: { halign: "right", cellWidth: 60 },
      },
    });

    // Notes section
    const invoiceNotes = invoice.additional_notes || notes;
    if (invoiceNotes) {
      const finalY = doc.lastAutoTable.finalY || 100;
      doc.setFontSize(11);
      doc.text("Notes:", 14, finalY + 12);
      doc.text(invoiceNotes, 14, finalY + 20);
    }

    // Footer with thank you note
    const footerY = (doc.lastAutoTable.finalY || 100) + 40;
    doc.setFontSize(10);
    doc.text("Thank you for your payment!", 14, footerY);

    // Save PDF
    doc.save(`Invoice_${selectedPayment?.name || invoice.name}_${Date.now()}.pdf`);
  };

  const openViewDetailsModal = async (studentId) => {
    setViewDetailsPaymentId(studentId);
    setShowViewDetailsModal(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`${BASE_URL}paymentsbyid/${studentId}`);
      setViewDetailsData(res.data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      alert("Failed to fetch payment details");
    }
    setLoadingDetails(false);
  };

  const closeViewDetailsModal = () => {
    setShowViewDetailsModal(false);
    setViewDetailsData(null);
    setViewDetailsPaymentId(null);
  };

  // New function to open invoice list modal
  const openInvoiceListModal = async (studentId) => {
    // Find the payment object to set selectedPayment for context
    const payment = payments.find(p => p.student_id === studentId);
    if (payment) {
        setSelectedPayment(payment);
    }
    setShowInvoiceListModal(true);
    await fetchStudentInvoices(studentId);
  };

  // New function to close invoice list modal
  const closeInvoiceListModal = () => {
    setShowInvoiceListModal(false);
    setSelectedStudentInvoices([]);
    setSelectedPayment(null); // Clear selected payment when closing
  };

  // New function to open view invoice modal
  const openViewInvoiceModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowViewInvoiceModal(true);
  };

  // New function to close view invoice modal
  const closeViewInvoiceModal = () => {
    setShowViewInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const filteredPayments = payments
    .filter(
      (item) =>
        item?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item?.email?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item) => branchFilter === "" || item.branch_name === branchFilter)
    .filter(
      (item) =>
        countryFilter === "" ||
        item.country === countryFilter ||
        item.country_other === countryFilter
    )
    .filter(
      (item) =>
        paymentMethodFilter === "" ||
        item.payment_method === paymentMethodFilter ||
        item.payment_method_other === paymentMethodFilter
    )
    .filter(
      (item) =>
        paymentTypeFilter === "" || item.payment_type == paymentTypeFilter
    )
    .filter(
      (item) =>
        paymentStatusFilter === "" || item.payment_status === paymentStatusFilter
    )
    .filter((item) => {
      if (!fromDate && !toDate) return true;
      
      const itemDate = new Date(item.created_at);
      const start = fromDate ? new Date(fromDate) : null;
      const end = toDate ? new Date(toDate) : null;
      
      // Set time to start of day for start date
      if (start) start.setHours(0, 0, 0, 0);
      // Set time to end of day for end date
      if (end) end.setHours(23, 59, 59, 999);
      
      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const statusUpdate = async (payment, newStatus) => {
    try {
      const response = await api.patch(`${BASE_URL}payment_status/${payment.id}`, {
        payment_status: newStatus,
      });

      if (response.status === 200 || response.status === 201) {
        alert(`✅ Payment status updated to "${newStatus.toUpperCase()}"`);
        await fetchPayments();
      } else {
        alert("❌ Failed to update payment status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Something went wrong while updating payment status.");
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename || "downloaded_file";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  // Function to generate PDF for all payments
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add logo with error handling
    if (Logo) {
      doc.addImage(Logo, "PNG", 150, 10, 40, 20);
    }
    
    // Title
    doc.setFontSize(18);
    doc.text("All Student Payments Report", 14, 22);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated On: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Prepare table data with BDT symbol
    const tableData = filteredPayments.map((payment, index) => [
      index + 1,
      payment.name || "N/A",
      payment.email || "N/A",
      payment.branch_name || "N/A",
      payment.country_other || payment.country || "N/A",
      payment.payment_method_other || payment.payment_method || "N/A",
      payment.payment_type_other || payment.payment_type || "N/A",
      `৳${payment.payment_amount || "0"}`, // Added BDT symbol
      payment.payment_status || "Pending"
    ]);
    
    // Create table
    autoTable(doc, {
      head: [["#", "Student Name", "Email", "Branch", "Country", "Payment Method", "Payment Type", "Amount", "Status"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 25 },
        5: { cellWidth: 30 },
        6: { cellWidth: 30 },
        7: { cellWidth: 15, halign: "right" }, // Right align currency
        8: { cellWidth: 20 }
      }
    });
    
    // Save PDF
    doc.save(`All_Payments_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
        <h2 className="mb-4">Admin - All Student Payments</h2>
        <Button
          variant="success"
          size="sm"
          className="d-inline-flex align-items-center"
          style={{ whiteSpace: 'nowrap' }}
          onClick={() => generatePDF()}
        >
          Download as PDF
        </Button>
      </div>

      {/* Filters card */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Search by Name / Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Branch</Form.Label>
                <Form.Select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="">All Branches</option>
                  <option>Dhaka</option>
                  <option>Sylhet</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Country</Form.Label>
                <Form.Select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">Select Country</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Denmark">Denmark</option>
                  <option value="UK">UK</option>
                  <option value="Australia">Australia</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Canada">Canada</option>
                  <option value="Malta">Malta</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="Germany">Germany</option>
                  {/* Newly added countries below */}
                  <option value="Latvia">Latvia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Estonia">Estonia</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Romania">Romania</option>
                  <option value="Russia">Russia</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Ireland">Ireland</option>
                  <option value="USA">USA</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Others">Others</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Payment Method</Form.Label>
                <Form.Select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                >
                  <option value="">Select Payment Method</option>
                  <option>Bkash</option>
                  <option>Bkash to Bank</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Bank Deposit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Payment Type</Form.Label>
                <Form.Select
                  value={paymentTypeFilter}
                  onChange={(e) => setPaymentTypeFilter(e.target.value)}
                >
                  <option value="">Select Payment Type</option>
                  <option>File Opening Charge</option>
                  <option>Application Fee</option>
                  <option>After Offer Letter Charge</option>
                  <option>Insurance Fee</option>
                  <option>Bank Statement</option>
                  <option>After Visa</option>
                  <option>Accommodation</option>
                  <option>Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {/* New filters */}
            <Col md={3}>
              <Form.Group>
                <Form.Label>Filter by Payment Status</Form.Label>
                <Form.Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Declined">Declined</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  isInvalid={!!dateError}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  isInvalid={!!dateError}
                  min={fromDate} // Prevent selecting dates before from date
                />
                <Form.Control.Feedback type="invalid">
                  {dateError}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
                Reset Filters
              </Button>
            </Col>
          </Row>
          
          {dateError && (
            <Alert variant="danger" className="mt-3">
              {dateError}
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th className="freeze-column freeze-column-1">#</th>
                <th className="freeze-column freeze-column-2">Student</th>
                <th className="freeze-column freeze-column-3">Whatsapp</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Group Name</th>
                <th>University</th>
                <th>Country</th>
                <th>Payment Method</th>
                <th>Payment Type</th>
                <th>Proof</th>
                <th>Assistant</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="freeze-column freeze-column-1">{indexOfFirstItem + index + 1}</td>
                  <td className="freeze-column freeze-column-2">{item.name}</td>
                  <td className="freeze-column freeze-column-3">{item.whatsapp}</td>
                  <td>{item.email}</td>
                  <td>{item.branch_name}</td>
                  <td>{item.group_name}</td>
                  <td>{item.university_other || item.universityName}</td>
                  <td>{item.country_other || item.country}</td>
                  <td>{item.payment_method_other || item.payment_method}</td>
                  <td>{item.payment_type_other || item.payment_type}</td>
                  <td>
                    {item.file?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        style={{ width: "100px", height: "100px", cursor: "pointer" }}
                        src={item.file}
                        alt="Download File"
                        onClick={() => handleDownload(item.file, "image.jpg")}
                      />
                    ) : (
                      <button className="btn btn-sm btn-primary"
                        onClick={() => handleDownload(item.file, "document.pdf")}>
                        Download File
                      </button>
                    )}
                  </td>
                  <td>{item.assistant}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.payment_status || "Pending"}
                      onChange={(e) => statusUpdate(item, e.target.value)}
                      style={{ width: "130px" }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Declined">Declined</option>
                    </select>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openViewDetailsModal(item.student_id)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => deletePayment(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                  <td>
                    {item?.isInvoiceView === 1 ? (
                      <div className="d-flex gap-1">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => openInvoiceListModal(item.student_id)}
                        >
                          View Invoices
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => openInvoiceModal(item)}
                        >
                          Create New
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => openInvoiceModal(item)}
                      >
                        Create Invoice
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="16" className="text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-end">
              {[...Array(totalPages)].map((_, page) => (
                <Pagination.Item
                  key={page}
                  active={page + 1 === currentPage}
                  onClick={() => setCurrentPage(page + 1)}
                >
                  {page + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </Card.Body>
      </Card>

      {/* Invoice Modal */}
      <Modal show={showInvoiceModal} onHide={closeInvoiceModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Generate Invoice for {selectedPayment?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="paymentAmount">
                  <Form.Label>Payment Amount</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="taxPercent">
                  <Form.Label>Tax (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    placeholder="Enter tax percentage"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="paymentDate">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentdate}
                    onChange={(e) => setPaymentdate(e.target.value)}
                    placeholder="Enter payment date"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Form.Group controlId="notes" className="mb-3">
                <Form.Label>Additional Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any notes or terms"
                />
              </Form.Group>
            </Row>
          </Form>
          <hr />
          <h5>Invoice Summary</h5>
          <p>Payment Amount: ৳{parseFloat(paymentAmount || 0).toFixed(2)}</p>
          <p>Tax ({taxPercent}%): ৳{((parseFloat(paymentAmount || 0) * taxPercent) / 100).toFixed(2)}</p>
          <hr />
          <h5>
            Total: ৳
            {(
              (parseFloat(paymentAmount || 0) +
                (parseFloat(paymentAmount || 0) * taxPercent) / 100) || 0
            ).toFixed(2)}
          </h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeInvoiceModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={generateInvoice}>
            Create Invoice
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Details Modal - Updated to match invoice format */}
      <Modal
        show={showViewDetailsModal}
        onHide={closeViewDetailsModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div>Loading...</div>
          ) : viewDetailsData && viewDetailsData.length > 0 ? (
            <div className="border p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3>INVOICE</h3>
                  <p className="mb-0">Student: {viewDetailsData[0].student_name || "N/A"}</p>
                  <p className="mb-0">Email: {viewDetailsData[0].email || "N/A"}</p>
                </div>
                <div className="text-end">
                  <p className="mb-0">Payment Date: {viewDetailsData[0].payment_date ? new Date(viewDetailsData[0].payment_date).toLocaleDateString() : "N/A"}</p>
                  <p className="mb-0">Generated On: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <Table bordered>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Payment Amount</td>
                    <td className="text-end">৳{parseFloat(viewDetailsData[0].payment_amount || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Tax</td>
                    <td className="text-end">৳{parseFloat(viewDetailsData[0].tax || 0).toFixed(2)}</td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Total</strong></td>
                    <td className="text-end"><strong>৳{parseFloat(viewDetailsData[0].total || viewDetailsData[0].payment_amount || 0).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </Table>
              
              {viewDetailsData[0].additional_notes && (
                <div className="mt-3">
                  <h6>Notes:</h6>
                  <p>{viewDetailsData[0].additional_notes}</p>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <p>Thank you for your payment!</p>
              </div>
              
              <hr className="my-4" />
              
              <h5>Additional Payment Information</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Branch:</strong> {viewDetailsData[0].branch_name || "N/A"}</p>
                  <p><strong>Payment Method:</strong> {viewDetailsData[0].payment_method || viewDetailsData[0].payment_method_other || "N/A"}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Payment Type:</strong> {viewDetailsData[0].payment_type || viewDetailsData[0].payment_type_other || "N/A"}</p>
                  <p><strong>Payment Status:</strong> {viewDetailsData[0].payment_status || "N/A"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>No data found.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewDetailsModal}>
            Close
          </Button>
          {viewDetailsData && viewDetailsData.length > 0 && (
            <Button 
              variant="success" 
              onClick={() => {
                // Create a temporary invoice object for download
                const tempInvoice = {
                  payment_amount: viewDetailsData[0].payment_amount,
                  tax: viewDetailsData[0].tax || 0,
                  total: viewDetailsData[0].total || viewDetailsData[0].payment_amount,
                  payment_date: viewDetailsData[0].payment_date,
                  additional_notes: viewDetailsData[0].additional_notes || "",
                  name: viewDetailsData[0].name,
                  email: viewDetailsData[0].email
                };
                setSelectedPayment(viewDetailsData[0]);
                downloadInvoicePDF(tempInvoice);
              }}
            >
              Download PDF
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Invoice List Modal */}
      <Modal
        show={showInvoiceListModal}
        onHide={closeInvoiceListModal}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Student Invoices - {selectedPayment?.name || 'Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingInvoices ? (
            <div>Loading invoices...</div>
          ) : selectedStudentInvoices.length > 0 ? (
            <div>
              {/* Invoice Format as per Screenshot */}
              <div className="border p-4 mb-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h3>INVOICE</h3>
                    <p className="mb-0">Student: {selectedPayment?.name || "N/A"}</p>
                    <p className="mb-0">Email: {selectedPayment?.email || "N/A"}</p>
                  </div>
                  <div className="text-end">
                    <p className="mb-0">Payment Date: {selectedStudentInvoices[0].payment_date ? new Date(selectedStudentInvoices[0].payment_date).toLocaleDateString() : "N/A"}</p>
                    <p className="mb-0">Generated On: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th className="text-end">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentInvoices.map((invoice, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td>Payment Amount</td>
                          <td className="text-end">৳{parseFloat(invoice.payment_amount || 0).toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Tax</td>
                          <td className="text-end">৳{parseFloat(invoice.tax || 0).toFixed(2)}</td>
                        </tr>
                        <tr className="table-active">
                          <td><strong>Total</strong></td>
                          <td className="text-end"><strong>৳{parseFloat(invoice.total || 0).toFixed(2)}</strong></td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
                
                {selectedStudentInvoices[0].additional_notes && (
                  <div className="mt-3">
                    <h6>Notes:</h6>
                    <p>{selectedStudentInvoices[0].additional_notes}</p>
                  </div>
                )}
                
                <div className="mt-4 text-center">
                  <p>Thank you for your payment!</p>
                </div>
              </div>
              
              {/* Individual Invoice List with Actions */}
              <h5 className="mt-4">All Invoices</h5>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Invoice ID</th>
                    <th>Payment Amount</th>
                    <th>Tax</th>
                    <th>Total</th>
                    <th>Payment Date</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentInvoices.map((invoice, index) => (
                    <tr key={invoice.id || index}>
                      <td>{index + 1}</td>
                      <td>{invoice.id}</td>
                      <td>৳{invoice.payment_amount}</td>
                      <td>৳{invoice.tax}</td>
                      <td>৳{invoice.total}</td>
                      <td>{invoice.payment_date ? new Date(invoice.payment_date).toLocaleDateString() : "N/A"}</td>
                      <td>{invoice.additional_notes || "N/A"}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => openViewInvoiceModal(invoice)}
                          >
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => downloadInvoicePDF(invoice)}
                          >
                            Download
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteInvoice(invoice.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div>No invoices found for this student.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeInvoiceListModal}>
            Close
          </Button>
          {selectedPayment && (
            <Button variant="primary" onClick={() => {
              closeInvoiceListModal();
              openInvoiceModal(selectedPayment);
            }}>
              Create New Invoice
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* View Invoice Modal */}
      <Modal
        show={showViewInvoiceModal}
        onHide={closeViewInvoiceModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice ? (
            <div className="border p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h3>INVOICE</h3>
                  <p className="mb-0">Student: {selectedPayment?.name || "N/A"}</p>
                  <p className="mb-0">Email: {selectedPayment?.email || "N/A"}</p>
                </div>
                <div className="text-end">
                  <p className="mb-0">Payment Date: {selectedInvoice.payment_date ? new Date(selectedInvoice.payment_date).toLocaleDateString() : "N/A"}</p>
                  <p className="mb-0">Generated On: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <Table bordered>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-end">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Payment Amount</td>
                    <td className="text-end">৳{parseFloat(selectedInvoice.payment_amount || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Tax</td>
                    <td className="text-end">৳{parseFloat(selectedInvoice.tax || 0).toFixed(2)}</td>
                  </tr>
                  <tr className="table-active">
                    <td><strong>Total</strong></td>
                    <td className="text-end"><strong>৳{parseFloat(selectedInvoice.total || 0).toFixed(2)}</strong></td>
                  </tr>
                </tbody>
              </Table>
              
              {selectedInvoice.additional_notes && (
                <div className="mt-3">
                  <h6>Notes:</h6>
                  <p>{selectedInvoice.additional_notes}</p>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <p>Thank you for your payment!</p>
              </div>
            </div>
          ) : (
            <div>No invoice data found.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeViewInvoiceModal}>
            Close
          </Button>
          {selectedInvoice && (
            <Button variant="success" onClick={() => downloadInvoicePDF(selectedInvoice)}>
              Download PDF
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPayments;