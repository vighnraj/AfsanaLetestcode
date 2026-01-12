// src/StudentInvoice.js

import React, { useState, useEffect } from 'react';
import BASE_URL from '../../Config';

// Define all styles as JavaScript objects
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '20px auto',
    backgroundColor: '#ffffff',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    textAlign: 'start',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: '600',
  },
  filtersCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    border: '1px solid #e9ecef',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '15px',
  },
  filterGroup: {
    flex: '1 1 200px',
    minWidth: '200px',
  },
  filterLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#495057',
  },
  filterInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    height: 'fit-content',
    marginTop: '24px',
  },
  resetButtonHover: {
    backgroundColor: '#5a6268',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '5px',
  },
  invoiceTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  tableHeader: {
    backgroundColor: '#f1f3f5',
    color: '#495057',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.85rem',
    letterSpacing: '0.5px',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
  },
  tableCell: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #e9ecef',
    verticalAlign: 'middle',
  },
  studentName: {
    fontWeight: '700',
    color: '#2c3e50',
  },
  invoiceId: {
    fontWeight: '600',
    color: '#3498db',
  },
  totalAmount: {
    fontWeight: '700',
    color: '#27ae60',
  },
  paymentDate: {
    color: '#6c757d',
    fontSize: '0.9rem',
  },
  messageBox: {
    textAlign: 'center',
    padding: '40px 20px',
    fontSize: '1.1rem',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  errorMessageBox: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  noResultsBox: {
    textAlign: 'center',
    padding: '30px',
    fontSize: '1rem',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
};

function StudentInvoice() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [dateError, setDateError] = useState('');

  const counselor = localStorage.getItem('counselor_id');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}students/invoices/${counselor}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStudents(data);
        setError(null);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [counselor, BASE_URL]);

  // Validate date range
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFromDate('');
    setToDate('');
    setDateError('');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Student Invoices</h1>
        <div style={styles.messageBox}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Student Invoices</h1>
        <div style={{ ...styles.messageBox, ...styles.errorMessageBox }}>{error}</div>
      </div>
    );
  }

  // First, filter students who have invoices
  const studentsWithInvoices = students.filter(student => student.invoices && student.invoices.length > 0);

  // Then, create a flat array of all invoices, each tagged with the student's name
  const allInvoices = studentsWithInvoices.flatMap(student =>
    student.invoices.map(invoice => ({
      ...invoice,
      student_full_name: student.full_name,
      student_unique_id: student.unique_id,
    }))
  );

  // Filter invoices based on search term and date range
  const filteredInvoices = allInvoices.filter(invoice => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      invoice.student_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_id.toString().includes(searchTerm) ||
      (invoice.additional_notes && invoice.additional_notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Date range filter
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const invoiceDate = new Date(invoice.payment_date);
      const start = fromDate ? new Date(fromDate) : null;
      const end = toDate ? new Date(toDate) : null;
      
      // Set time to start of day for start date
      if (start) start.setHours(0, 0, 0, 0);
      // Set time to end of day for end date
      if (end) end.setHours(23, 59, 59, 999);
      
      if (start && end) {
        matchesDateRange = invoiceDate >= start && invoiceDate <= end;
      } else if (start) {
        matchesDateRange = invoiceDate >= start;
      } else if (end) {
        matchesDateRange = invoiceDate <= end;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Student Invoices</h1>

      {/* Filters Section */}
      <div style={styles.filtersCard}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search</label>
            <input
              type="text"
              style={styles.filterInput}
              placeholder="Enter search term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>From Date</label>
            <input
              type="date"
              style={styles.filterInput}
              value={fromDate}
              onChange={handleFromDateChange}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>To Date</label>
            <input
              type="date"
              style={styles.filterInput}
              value={toDate}
              onChange={handleToDateChange}
              min={fromDate} // Prevent selecting dates before from date
            />
            {dateError && <div style={styles.errorMessage}>{dateError}</div>}
          </div>
          <div style={styles.filterGroup}>
            <button 
              style={styles.resetButton}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.resetButtonHover.backgroundColor}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = styles.resetButton.backgroundColor}
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {allInvoices.length === 0 ? (
        <div style={styles.messageBox}>No student invoices found.</div>
      ) : filteredInvoices.length === 0 ? (
        <div style={styles.noResultsBox}>No invoices match your search criteria. Try adjusting your filters.</div>
      ) : (
        <table style={styles.invoiceTable}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>#</th>
              <th style={styles.tableHeader}>Student Name</th>
              <th style={styles.tableHeader}>Invoice ID</th>
              <th style={styles.tableHeader}>Payment Amount</th>
              <th style={styles.tableHeader}>Tax</th>
              <th style={styles.tableHeader}>Total Amount</th>
              <th style={styles.tableHeader}>Payment Date</th>
              <th style={styles.tableHeader}>Additional Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice, index) => (
              <tr
                key={invoice.invoice_id}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
              >
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={{ ...styles.tableCell, ...styles.studentName }}>
                  {invoice.student_full_name}
                </td>
                <td style={{ ...styles.tableCell, ...styles.invoiceId }}>
                  {invoice.invoice_id}
                </td>
                <td style={styles.tableCell}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "24px" }}>৳</span>
                    <span>{invoice.payment_amount}</span>
                  </div>
                </td>

                <td style={styles.tableCell}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "24px" }}>৳</span>
                    <span>{invoice.tax}</span>
                  </div>
                </td>

                <td style={{ ...styles.tableCell, ...styles.totalAmount }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "24px" }}>৳</span>
                    <span>{invoice.total}</span>
                  </div>
                </td>

                <td style={{ ...styles.tableCell, ...styles.paymentDate }}>
                  {new Date(invoice.payment_date).toLocaleDateString('en-US')}
                </td>
                <td style={styles.tableCell}>
                  {invoice.additional_notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StudentInvoice;