import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Table, Modal, Button } from 'react-bootstrap';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { FaUsers, FaUserGraduate, FaUserTie, FaUniversity, FaTasks, FaQuestionCircle, FaChartLine, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../../services/axiosInterceptor';
import BASE_URL from '../../Config';

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard = () => {
    const [allDashboardData, setAllDashboardData] = useState({});
    const [dashboardData, setDashboardData] = useState({}); // Filtered data
    const [counselors, setCounselors] = useState([]);
    const [showDateModal, setShowDateModal] = useState(false);
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [loading, setLoading] = useState(false);
    const [growthData, setGrowthData] = useState({
        this_month_conversion_rate: '0%',
        last_month_conversion_rate: '0%',
        growth_rate: '0%',
        top_counselors: [],
        conversion_funnel: { inquiries: 0, leadCount: 0, studentCount: 0, application: 0 },
        country_wise_converted_leads: []
    });

    const [filters, setFilters] = useState({
        fromDate: '', // Custom date range start
        toDate: '',   // Custom date range end
        country: '',
        counselor: '',
        status: '',
        intake: '',
        leadSource: ''
    });

    // Helper function to check if a date is within a custom range
    const isDateInCustomRange = (dateString, fromDate, toDate) => {
        if (!dateString) return true;
        if (!fromDate && !toDate) return true;
        
        const date = new Date(dateString);
        
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (date < from) return false;
        }
        
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (date > to) return false;
        }
        
        return true;
    };

    // Function to fetch dashboard data with filters
    const fetchDashboardData = async (filtersToUse = filters) => {
        setLoading(true);
        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            
            // Map fromDate/toDate to startDate/endDate for API
            if (filtersToUse.fromDate) {
                queryParams.append('startDate', filtersToUse.fromDate);
            }
            if (filtersToUse.toDate) {
                queryParams.append('endDate', filtersToUse.toDate);
            }
            
            // Add other filters
            Object.entries(filtersToUse).forEach(([key, value]) => {
                if (value && key !== 'fromDate' && key !== 'toDate') {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString();
            const url = queryString 
                ? `${BASE_URL}dashboard?${queryString}`
                : `${BASE_URL}dashboard`;
                
            const res = await api.get(url);
            console.log("Dashboard API Response with filters:", res.data);
            setAllDashboardData(res.data || {});
            setDashboardData(res.data || {});
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters to dashboard data
    const applyFiltersToData = useMemo(() => {
        if (!allDashboardData || Object.keys(allDashboardData).length === 0) {
            return {};
        }

        // Create a deep copy of the data to avoid mutating the original
        const filteredData = JSON.parse(JSON.stringify(allDashboardData));
        
        // Filter recent leads if they exist
        if (filteredData.recentLeads && Array.isArray(filteredData.recentLeads)) {
            filteredData.recentLeads = filteredData.recentLeads.filter(lead => {
                // Country filter
                if (filters.country && lead.country !== filters.country) {
                    return false;
                }
                
                // Status filter
                if (filters.status) {
                    const leadStatus = lead.status ? lead.status.toString().toLowerCase() : "";
                    const filterStatus = filters.status.toString().toLowerCase();
                    
                    if (!leadStatus.includes(filterStatus) && !filterStatus.includes(leadStatus)) {
                        return false;
                    }
                }
                
                // Intake filter
                if (filters.intake) {
                    const leadIntake = lead.intake ? lead.intake.toString().toLowerCase() : "";
                    const filterIntake = filters.intake.toString().toLowerCase();
                    
                    if (!leadIntake.includes(filterIntake) && !filterIntake.includes(leadIntake)) {
                        return false;
                    }
                }
                
                // Lead Source filter
                if (filters.leadSource) {
                    const leadSource = lead.source ? lead.source.toString().toLowerCase() : "";
                    const filterSource = filters.leadSource.toString().toLowerCase();
                    
                    if (!leadSource.includes(filterSource) && !filterSource.includes(leadSource)) {
                        return false;
                    }
                }
                
                // Custom date range filtering
                if (filters.fromDate || filters.toDate) {
                    const inRange = isDateInCustomRange(lead.created_at, filters.fromDate, filters.toDate);
                    if (!inRange) return false;
                }
                
                return true;
            });
        }
        
        // Filter student applications if they exist
        if (filteredData.studentApplications && Array.isArray(filteredData.studentApplications)) {
            filteredData.studentApplications = filteredData.studentApplications.filter(app => {
                // Country filter
                if (filters.country && app.country !== filters.country) {
                    return false;
                }
                
                // Intake filter
                if (filters.intake) {
                    const appIntake = app.intake ? app.intake.toString().toLowerCase() : "";
                    const filterIntake = filters.intake.toString().toLowerCase();
                    
                    if (!appIntake.includes(filterIntake) && !filterIntake.includes(appIntake)) {
                        return false;
                    }
                }
                
                // Custom date range filtering
                if (filters.fromDate || filters.toDate) {
                    const inRange = isDateInCustomRange(app.assigned_date, filters.fromDate, filters.toDate);
                    if (!inRange) return false;
                }
                
                return true;
            });
        }
        
        // Keep the original counts for static metrics
        filteredData.totalleads = allDashboardData.totalleads || 0;
        filteredData.totalstudents = allDashboardData.totalstudents || 0;
        filteredData.totalcounselors = allDashboardData.totalcounselors || 0;
        filteredData.totalUniversities = allDashboardData.totalUniversities || 0;
        filteredData.totalTasks = allDashboardData.totalTasks || 0;
        filteredData.totalInquiries = allDashboardData.totalInquiries || 0;
        
        return filteredData;
    }, [allDashboardData, filters]);

    // Update filtered data when filters change
    useEffect(() => {
        setDashboardData(applyFiltersToData);
    }, [applyFiltersToData]);

    const handleResetFilters = () => {
        const resetFilters = {
            fromDate: '',
            toDate: '',
            country: '',
            counselor: '',
            status: '',
            intake: '',
            leadSource: ''
        };
        setFilters(resetFilters);
        setCustomRange({ start: '', end: '' });
        // Fetch data without filters
        fetchDashboardData(resetFilters);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleCustomDateApply = (e) => {
        e.preventDefault();
        setFilters({
            ...filters,
            fromDate: customRange.start,
            toDate: customRange.end
        });
        setShowDateModal(false);
    };

    const handleSearch = () => {
        fetchDashboardData();
    };

    useEffect(() => {
        // Initial data fetch without filters
        fetchDashboardData();
    }, []);

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                const res = await api.get(`${BASE_URL}dashboardinfo`);
                console.log("Growth Data API Response:", res.data);
                setGrowthData(res.data || {});
            } catch (error) {
                console.error('Failed to fetch growth data', error);
            }
        };

        fetchGrowthData();
    }, []);

    useEffect(() => {
        const fetchCounselors = async () => {
            try {
                const res = await api.get(`${BASE_URL}counselor`);
                setCounselors(res.data);
            } catch (err) {
                console.error("Failed to fetch counselors", err);
            }
        };
        fetchCounselors();
    }, []);

    // Funnel Chart Data
    const funnelData = {
        labels: ['Inquiries', 'Leads', 'Students', 'Applicants'],
        datasets: [{
            label: 'Count',
            data: [
                growthData.conversion_funnel.inquiries || 0,
                growthData.conversion_funnel.leadCount || 0,
                growthData.conversion_funnel.studentCount || 0,
                growthData.conversion_funnel.application || 0
            ],
            backgroundColor: '#0d1b3d'
        }]
    };

    // Day mapping for labels
    const dayShortMap = {
        Monday: "Mon",
        Tuesday: "Tue",
        Wednesday: "Wed",
        Thursday: "Thu",
        Friday: "Fri",
        Saturday: "Sat",
        Sunday: "Sun"
    };

    // Heatmap Data
    const heatmapData = {
        labels: (growthData.weekly_inquiries_by_day || []).map(item => dayShortMap[item.day]),
        datasets: [{
            label: 'Inquiries',
            data: (growthData.weekly_inquiries_by_day || []).map(item => item.total_inquiries),
            borderColor: '#ff6600',
            backgroundColor: 'rgba(255, 102, 0, 0.3)',
            fill: true
        }]
    };

    // World Map simulation with Pie chart
    const countryData = {
        labels: (growthData.country_wise_converted_leads || []).map(item => item.country),
        datasets: [{
            data: (growthData.country_wise_converted_leads || []).map(item => item.inquiries),
            backgroundColor: ['#0d1b3d', '#ff6600', '#ffc107', '#198754', '#dc3545', '#00bcd4', '#8e44ad', '#ff4081']
        }]
    };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: Inquiries ${value}`;
                    }
                }
            }
        }
    };

    // Define the cards array dynamically
    const cards = [
        { key: 'totalleads', label: 'Total Leads', value: dashboardData.totalleads || 0, icon: <FaUsers />, bg: '#e0f7fa' },
        { key: 'totalstudents', label: 'Total Students', value: dashboardData.totalstudents || 0, icon: <FaUserGraduate />, bg: '#e8f5e9' },
        { key: 'totalcounselors', label: 'Total Counselors', value: dashboardData.totalcounselors || 0, icon: <FaUserTie />, bg: '#fff3e0' },
        { key: 'totalUniversities', label: 'Total Universities', value: dashboardData.totalUniversities || 0, icon: <FaUniversity />, bg: '#fce4ec' },
        { key: 'totalTasks', label: 'Total Tasks', value: dashboardData.totalTasks || 0, icon: <FaTasks />, bg: '#ede7f6' },
        { key: 'totalInquiries', label: 'Inquiries', value: dashboardData.totalInquiries || 0, icon: <FaQuestionCircle />, bg: '#f3e5f5' },
    ];

    return (
        <div className="p-4">
            <Modal show={showDateModal} onHide={() => setShowDateModal(false)} centered>
                <Form onSubmit={handleCustomDateApply}>
                    <Modal.Header closeButton>
                        <Modal.Title>Select Custom Date Range</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>End Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowDateModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Apply Filter
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Filters - Two rows layout */}
            <Card className="mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>Dashboard Filters</h5>
                    </div>
                    
                    {/* First row of filters */}
                    <Row className="g-3 mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>From Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fromDate"
                                    value={filters.fromDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>To Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="toDate"
                                    value={filters.toDate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Country</Form.Label>
                                <Form.Select
                                    name="country"
                                    onChange={handleChange}
                                    value={filters.country}
                                >
                                    <option value="">Select Country</option>
                                    <option>Hungary</option>
                                    <option>UK</option>
                                    <option>Cyprus</option>
                                    <option>Canada</option>
                                    <option>Malaysia</option>
                                    <option>Lithuania</option>
                                    <option>Latvia</option>
                                    <option>Germany</option>
                                    <option>New Zealand</option>
                                    <option>USA</option>
                                    <option>Estonia</option>
                                    <option>Australia</option>
                                    <option>South Korea</option>
                                    <option>Georgia</option>
                                    <option>Denmark</option>
                                    <option>Netherlands</option>
                                    <option>Sweden</option>
                                    <option>Norway</option>
                                    <option>Belgium</option>
                                    <option>Romania</option>
                                    <option>Russia</option>
                                    <option>Turkey</option>
                                    <option>Ireland</option>
                                    <option>Portugal</option>
                                    <option>Malta</option>
                                    <option>Others</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Counselor</Form.Label>
                                <Form.Select
                                    name="counselor"
                                    onChange={handleChange}
                                    value={filters.counselor}
                                >
                                    <option value="">Select Counselor</option>
                                    {counselors.map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* Second row of filters */}
                    <Row className="g-3 mb-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="status"
                                    onChange={handleChange}
                                    value={filters.status}
                                >
                                    <option value="">Select Status</option>
                                    <option value="New">New</option>
                                    <option value="In Review">In Review</option>
                                    <option value="Converted to lead">Converted to lead</option>
                                    <option value="Not Interested">Not Interested</option>
                                    <option value="Converted to student">Converted to student</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Intake</Form.Label>
                                <Form.Select
                                    name="intake"
                                    onChange={handleChange}
                                    value={filters.intake}
                                >
                                    <option value="">Select Intake</option>
                                    <option value="February">February</option>
                                    <option value="September">September</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Lead Source</Form.Label>
                                <Form.Select
                                    name="leadSource"
                                    onChange={handleChange}
                                    value={filters.leadSource}
                                >
                                    <option value="">Select Lead Source</option>
                                    <option value="Whatsapp">Whatsapp</option>
                                    <option value="Facebook">Facebook</option>
                                    <option value="YouTube">YouTube</option>
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Event">Event</option>
                                    <option value="Agent">Agent</option>
                                    <option value="Office Visit">Office Visit</option>
                                    <option value="Hotline">Hotline</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Expo">Expo</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3} className="d-flex align-items-end">
                            <div className="d-flex gap-2 w-100">
                                <Button 
                                    variant="primary" 
                                    onClick={handleSearch}
                                    className="flex-fill"
                                >
                                    <FaSearch className="me-2" />
                                    Search
                                </Button>
                                <Button 
                                    variant="outline-danger" 
                                    onClick={handleResetFilters}
                                    className="flex-fill"
                                >
                                    Reset
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* KPI Cards */}
            <Row className="g-4 mb-4">
                {cards.map((card, index) => (
                    <InfoCard
                        key={card.key}
                        icon={card.icon}
                        title={card.label}
                        value={card.value}
                        bg={card.bg}
                    />
                ))}
            </Row>

            <Card className="growth-bar mb-4">
                <div className="growth-text">
                    <div className='mb-2'>
                        <FaChartLine size={30} className="growth-icon" />
                        <h6>Leads Conversion Growth</h6>
                    </div>

                    <h5 style={{ color: '#fff' }}>This Month: {growthData.this_month_conversion_rate}</h5>
                    <h5 style={{ color: '#fff' }}>Last Month: {growthData.last_month_conversion_rate}</h5>

                    <h3 style={{ margin: 0, color: (parseFloat(growthData.growth_rate) >= 0 ? '#4caf50' : '#f44336') }}>
                        {parseFloat(growthData.growth_rate) >= 0 ? '🔺' : '🔻'} {growthData.growth_rate}
                    </h3>
                </div>
            </Card>

            {/* Main Content Split */}
            <Row className="g-4 mb-4">
                <Col md={8}>
                    <Card className="big-card">
                        <h5>Conversion Funnel</h5>
                        <Bar data={funnelData} />
                    </Card>

                    <Card className="big-card mt-4">
                        <h5>Inquiry Heatmap / Timeline</h5>
                        <Line data={heatmapData} />
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="big-card">
                        <h5>Top Performing Counselors</h5>
                        <Table hover responsive className="small-table">
                            <thead>
                                <tr><th>#</th><th>Name</th><th>Converted Lead</th></tr>
                            </thead>
                            <tbody>
                                {growthData.top_counselors.map((counselor, index) => (
                                    <tr key={counselor.counselor_id}>
                                        <td>{index + 1}</td>
                                        <td>{counselor.full_name}</td>
                                        <td>{counselor.converted_leads}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>

                    <Card className="big-card mt-4">
                        <h5>Lead/Student Country Map</h5>
                        <Pie data={countryData} options={options} />
                    </Card>
                </Col>
            </Row>

            {loading && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// KPI CARD COMPONENT
const InfoCard = ({ icon, title, value, bg }) => (
    <Col md={2} xs={6}>
        <Card className="kpi-card text-center" style={{ backgroundColor: bg }}>
            <div className="icon">{icon}</div>
            <h6>{title}</h6>
            <h3>{value}</h3>
        </Card>
    </Col>
);

export default Dashboard;