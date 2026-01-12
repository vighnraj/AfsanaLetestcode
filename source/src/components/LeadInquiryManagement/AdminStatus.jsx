import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Table, Badge, Row, Col, Form, Button, InputGroup, Pagination } from 'react-bootstrap';
import api from '../../services/axiosInterceptor';
import BASE_URL from '../../Config';
import { MdDelete } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';
import Lead from './Lead';
import './Lead.css'; // Import the same CSS file for freeze columns styling

function AdminStatus() {
  const [convertData, setConvertData] = useState([]);
  const [getPerformance, setPerformance] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    counselor: "",
    followUp: "",
    country: "",
    search: "",
    startDate: "",
    endDate: "",
    source: "",
    branch: "",
    leadType: ""
  });
  const [filteredData, setFilteredData] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 items per page

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await api.get('getAllleadsstatus');
        const allInquiries = response.data;
        const userRole = localStorage.getItem('role');
        const userId = localStorage.getItem('user_id');
        const filteredInquiries =
          userRole === 'admin'
            ? allInquiries
            : allInquiries.filter(
              (inquiry) => inquiry.counselor_id === parseInt(userId)
            );
        setInquiries(filteredInquiries);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const fetchConvertedLeads = async () => {
      try {
        const response = await api.get(`${BASE_URL}AllConvertedLeadsinquiries`);
        setConvertData(response.data);
      } catch (error) {
        console.error('Error fetching converted leads:', error);
      }
    };
    const fetchPerformance = async () => {
      try {
        const response = await api.get(`${BASE_URL}counselor-performance`);
        setPerformance(response.data || []);
      } catch (error) {
        console.log('Error fetching performance data:', error);
        setPerformance([]);
      }
    };
    fetchConvertedLeads();
    fetchPerformance();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [filters, inquiries]);

  const filterInquiries = () => {
    let data = [...inquiries];
    // Search filter (name, email, or phone)
    if (filters.search) {
      data = data.filter(
        (inq) =>
          inq?.full_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inq?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          inq?.phone_number?.includes(filters.search)
      );
    }
    // Branch filter
    if (filters.branch) {
      data = data.filter((inq) => inq.branch === filters.branch);
    }
    // Source filter
    if (filters.source) {
      data = data.filter((inq) => inq.source === filters.source);
    }
    // Lead Type filter (inquiry_type)
    if (filters.leadType) {
      data = data.filter((inq) => inq.inquiry_type === filters.leadType);
    }
    // Date Range filter
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59); // Include entire end day
      data = data.filter((inq) => {
        const inquiryDate = new Date(inq.date_of_inquiry);
        return inquiryDate >= start && inquiryDate <= end;
      });
    }
    // Status filter (lead_status)
    if (filters.status) {
      data = data.filter((inq) => inq.lead_status === filters.status);
    }
    // Counselor filter
    if (filters.counselor) {
      data = data.filter((inq) => inq.counselor_id == filters.counselor);
    }
    // Country filter
    if (filters.country) {
      data = data.filter((inq) => inq.country === filters.country);
    }
    // Follow-Up filter
    if (filters.followUp) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      switch (filters.followUp) {
        case "today":
          data = data.filter((inq) => {
            if (!inq.follow_up_date) return false;
            const followDate = new Date(inq.follow_up_date);
            return followDate.toDateString() === today.toDateString();
          });
          break;
        case "thisWeek":
          const sunday = new Date(today);
          sunday.setDate(today.getDate() + (6 - today.getDay())); // Next Sunday
          data = data.filter((inq) => {
            if (!inq.follow_up_date) return false;
            const followDate = new Date(inq.follow_up_date);
            return followDate >= today && followDate <= sunday;
          });
          break;
        case "overdue":
          data = data.filter((inq) => {
            if (!inq.follow_up_date) return false;
            const followDate = new Date(inq.follow_up_date);
            return followDate < today;
          });
          break;
      }
    }
    setFilteredData(data);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const uniqueBranches = [...new Set(convertData.map(lead => lead.branch_name))].filter(Boolean);

  const getStatusBadge = (status) => {
    let variant = 'dark'; // default
    let textColor = '#fff'; // default text color
    switch (status) {
      case 'New':
        variant = 'success'; // Green
        textColor = '#000';
        break;
      case 'In Review':
        variant = 'warning'; // Yellow
        textColor = '#000';
        break;
      case 'Check Eligibility':
        variant = 'info'; // Light Blue
        textColor = '#000';
        break;
      case 'Converted to Lead':
        variant = 'primary'; // Blue
        break;
      case 'Not Eligible':
        variant = 'danger'; // Red
        break;
      case 'Not Interested':
        variant = 'secondary'; // Gray
        break;
      case 'Duplicate':
        variant = 'warning'; // Using 'warning' for orange-like feel
        textColor = '#000';
        break;
      default:
        variant = 'dark';
    }
    return (
      <Badge
        bg={variant}
        style={{
          padding: '5px 10px',
          borderRadius: '4px',
          color: textColor,
          fontSize: '0.85rem',
          textTransform: 'capitalize',
        }}
      >
        {status}
      </Badge>
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="p-4">
        <h2>Total Inquiry</h2>
        <div className="card mt-3">
          <Tabs defaultActiveKey="allleads" id="inquiries-tabs" className="mb-3">
            <Tab eventKey="allleads" title="All Leads">
              <div className="mb-3 p-3 bg-light rounded border">
                <Row className="g-2 align-items-end">
                  {/* Date Range Filters */}
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      />
                    </Form.Group>
                  </Col>
                  {/* Existing Filters */}
                  <Col md={2}>
                    <Form.Label>All Statuses</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="">All Statuses</option>
                      <option value="new">New Lead</option>
                      <option>Contacted</option>
                      <option>Follow-Up Needed</option>
                      <option>Visited Office</option>
                      <option>Not Interested</option>
                      <option>Next Intake Interested</option>
                      <option>Registered</option>
                      <option>Not Eligible</option>
                      <option>In Review</option>
                      <option>Converted to Lead</option>
                      <option>Dropped</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>All Counselors</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.counselor}
                      onChange={(e) => setFilters({ ...filters, counselor: e.target.value })}
                    >
                      <option value="">All Counselors</option>
                      {[...new Set(convertData.map((d) => d.counselor_id))]
                        .filter((id) => id !== 1)
                        .map((id) => (
                          <option key={id} value={id}>
                            {convertData.find((c) => c.counselor_id === id)?.counselor_name || "N/A"}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>Follow Up</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.followUp}
                      onChange={(e) => setFilters({ ...filters, followUp: e.target.value })}
                    >
                      <option value="">Follow-Up</option>
                      <option value="today">Today</option>
                      <option value="thisWeek">This Week</option>
                      <option value="overdue">Overdue</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>All Country</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.country}
                      onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    >
                      <option value="">All Countries</option>
                      {[...new Set(convertData.map((d) => d.country))].map(
                        (c, i) =>
                          c && (
                            <option key={i} value={c}>
                              {c}
                            </option>
                          )
                      )}
                    </Form.Select>
                  </Col>
                  {/* New Filters */}
                  <Col md={2}>
                    <Form.Label>All Sources</Form.Label>
                    <Form.Select
                      style={{ height: "40px" }}
                      value={filters.source}
                      onChange={(e) =>
                        setFilters({ ...filters, source: e.target.value })
                      }
                    >
                      <option value="">All Sources</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="youtube">YouTube</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="event">Event</option>
                      <option value="agent">Agent</option>
                      <option value="office_visit">Office Visit</option>
                      <option value="hotline">Hotline</option>
                      <option value="seminar">Seminar</option>
                      <option value="expo">Expo</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>All Branches</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.branch}
                      onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                    >
                      <option value="">All Branches</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Sylhet">Sylhet</option>
                      {uniqueBranches.map((branch, i) => (
                        branch !== "Dhaka" && branch !== "Sylhet" && (
                          <option key={i} value={branch}>
                            {branch}
                          </option>
                        )
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>All Lead Types</Form.Label>
                    <Form.Select
                      size="sm"
                      value={filters.leadType}
                      onChange={(e) => setFilters({ ...filters, leadType: e.target.value })}
                    >
                      <option value="">All Lead Types</option>
                      <option value="student_visa">Student Visa</option>
                      <option value="visit_visa">Visit Visa</option>
                      <option value="work_visa">Work Visa</option>
                      <option value="short_visa">Short Visa</option>
                      <option value="german_course">German Course</option>
                      <option value="english_course">English Course</option>
                      <option value="others">Others</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label>Search</Form.Label>
                    <InputGroup size="sm">
                      <Form.Control
                        placeholder="Search by name, email or phone"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />
                      <InputGroup.Text>
                        <BsSearch />
                      </InputGroup.Text>
                    </InputGroup>
                  </Col>
                  <Col md={1}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setFilters({
                          status: "",
                          counselor: "",
                          followUp: "",
                          country: "",
                          search: "",
                          startDate: "",
                          endDate: "",
                          source: "",
                          branch: "",
                          leadType: ""
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>
              </div>

              <div className="table-responsive">
                <Table bordered hover className="freeze-columns-table">
                  <thead className="table-light">
                    <tr>
                      <th className="freeze-column freeze-column-1" >#</th>
                      <th className="freeze-column freeze-column-2" >Name</th>
                      <th className="freeze-column freeze-column-3" >Email</th>
                      <th className="freeze-column freeze-column-4" >Phone</th>
                      <th>Country</th>
                      <th>Branch</th>
                      <th>Enquiry Type</th>
                      <th>Course</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Follow-Up</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((inq, index) => (
                        <tr key={inq.id}>
                          <td className="freeze-column freeze-column-1" style={{ width: '50px' }}>{indexOfFirstItem + index + 1}</td>
                          <td className="freeze-column freeze-column-2" style={{ width: '150px' }}>{inq.full_name}</td>
                          <td className="freeze-column freeze-column-3" style={{ width: '200px' }}>{inq.email}</td>
                          <td className="freeze-column freeze-column-4" style={{ width: '120px' }}>{inq.phone_number}</td>
                          <td>{inq.country}</td>
                          <td>{inq.branch}</td>
                          <td>{inq.inquiry_type}</td>
                          <td>{inq.course_name}</td>
                          <td>{inq.source}</td>
                          <td>{getStatusBadge(inq.lead_status)}</td>
                          <td>
                            {inq.follow_up_date
                              ? new Date(inq.follow_up_date).toISOString().split('T')[0]
                              : 'N/A'}
                          </td>
                          <td>
                            {inq.created_at
                              ? new Date(inq.created_at).toISOString().split('T')[0]
                              : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12">No inquiries available.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                
                {/* Pagination Component */}
                {filteredData.length > itemsPerPage && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </div>
            </Tab>
            <Tab eventKey="convertedLeads" title="Converted Leads">
              <Lead />
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default AdminStatus;