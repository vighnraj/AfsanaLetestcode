// import React, { useEffect, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import Swal from "sweetalert2";
// import { Form } from "react-bootstrap";
// import api from "../../services/axiosInterceptor";
// import BASE_URL from "../../Config";
// const Addstaff = () => {
//     const [staffMembers, setStaffMembers] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [showModal, setShowModal] = useState(false);
//     const [editingId, setEditingId] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 100;
//     const defaultPermissions = {
//         Inquiry: { view: false, add: false, edit: false, delete: false },
//         Lead: { view: false, add: false, edit: false, delete: false },
//         "Payments & Invoice": { view: false, add: false, edit: false, delete: false }
//     };
//     const [formData, setFormData] = useState({
//         full_name: "",
//         email: "",
//         phone: "",
//         password: "",
//         status: "active",
//         permissions: JSON.parse(JSON.stringify(defaultPermissions)),
//         branch: "Default Branch", // Set default value here
//     });
//     const fetchStaff = async () => {
//         try {
//             const res = await api.get(`${BASE_URL}getAllStaff`);
//             setStaffMembers(res.data);
//         } catch (err) {
//             console.error("Failed to fetch staff", err);
//             Swal.fire("Error", "Failed to fetch staff members", "error");
//         }
//     };

//     useEffect(() => {
//         fetchStaff();
//     }, []);

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;

//         if (name.startsWith("permission_")) {
//             const [_, module, action] = name.split("_");
//             setFormData(prev => ({
//                 ...prev,
//                 permissions: {
//                     ...prev.permissions,
//                     [module]: {
//                         ...prev.permissions[module],
//                         [action]: checked
//                     }
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: type === "checkbox" ? checked : value
//             }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const permissionsArray = Object.entries(formData.permissions).map(([module, perm]) => ({
//             permission_name: module,
//             view_permission: perm.view ? 1 : 0,
//             add_permission: perm.add ? 1 : 0,
//             edit_permission: perm.edit ? 1 : 0,
//             delete_permission: perm.delete ? 1 : 0
//         }));
//         const payload = {
//             ...formData,
//             user_id: 1,
//             role: "staff",
//             permissions: permissionsArray
//         };
//         try {
//             if (editingId) {
//                 await api.put(`${BASE_URL}updateStaff/${editingId}`, payload);
//                 Swal.fire("Success", "Staff updated successfully", "success");
//             } else {
//                 await api.post(`${BASE_URL}createStaff`, payload);
//                 Swal.fire("Success", "Staff member added", "success");
//             }
//             fetchStaff();
//             setShowModal(false);
//             resetForm();
//         } catch (err) {
//             Swal.fire("Error", "Operation failed", "error");
//             console.error("API Error:", err);
//         }
//     };
//     const handleEdit = (staff) => {
//         const permissionsObj = staff.permissions?.reduce((acc, perm) => {
//             acc[perm.permission_name] = {
//                 view: perm.view_permission === 1,
//                 add: perm.add_permission === 1,
//                 edit: perm.edit_permission === 1,
//                 delete: perm.delete_permission === 1
//             };
//             return acc;
//         }, JSON.parse(JSON.stringify(defaultPermissions)));
//         setFormData({
//             full_name: staff.full_name,
//             email: staff.email,
//             phone: staff.phone,
//             password: "",
//             status: staff.status,
//             permissions: permissionsObj,
//             branch: staff.branch || "",
//         });
//         setEditingId(staff.id);
//         setShowModal(true);
//     };

//     const handleDelete = async (id) => {
//         const result = await Swal.fire({
//             title: "Confirm Delete",
//             text: "Are you sure you want to delete this staff member?",
//             icon: "warning",
//             showCancelButton: true,
//             confirmButtonColor: "#d33",
//             cancelButtonColor: "#3085d6",
//             confirmButtonText: "Delete"
//         });
//         if (result.isConfirmed) {
//             try {
//                 await api.delete(`${BASE_URL}deleteStaff/${id}`);
//                 Swal.fire("Deleted", "Staff member removed", "success");
//                 fetchStaff();
//             } catch (err) {
//                 Swal.fire("Error", "Delete operation failed", "error");
//             }
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             full_name: "",
//             email: "",
//             phone: "",
//             password: "",
//             status: "active",
//             permissions: JSON.parse(JSON.stringify(defaultPermissions)),
//             branch: "Default Branch", // Reset to default value
//         });
//         setEditingId(null);
//     };

//     // Filter and pagination logic
//     const filteredStaff = staffMembers.filter(staff =>
//         staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         staff.email.toLowerCase().includes(searchTerm.toLowerCase())
//     );



//     const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
//     const currentItems = filteredStaff.slice(
//         (currentPage - 1) * itemsPerPage,
//         currentPage * itemsPerPage
//     );


//     console.log(currentItems);


//     return (
//         <div className="p-4">

//             <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
//                 {/* Title */}
//                 <div>
//                     <h3 className="mb-0">Staff Management</h3>
//                 </div>

//                 {/* Input + Button */}
//                 <div className="d-flex flex-column flex-md-row align-items-stretch gap-2 w-md-auto mt-2 mt-md-0">
//                     <input
//                         type="text"
//                         className="form-control"
//                         placeholder="Search by name"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                     <button
//                         className="btn btn-primary"
//                         style={{ whiteSpace: 'nowrap' }}
//                         onClick={() => {
//                             resetForm();
//                             setShowModal(true);
//                         }}
//                     >
//                         + Add Staff
//                     </button>
//                 </div>
//             </div>



//             <div className="card shadow-sm">
//                 <div className="card-body">
//                     <div className="table-responsive">
//                         <table className="table table-hover">
//                             <thead className="table-light">
//                                 <tr className="text-center">
//                                     <th>#</th>
//                                     <th>Name</th>
//                                     <th>Email</th>
//                                     <th>Phone</th>
//                                     <th>Branch</th>
//                                     <th>Status</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {currentItems?.map((staff, index) => (
//                                     <tr key={staff.id}>
//                                         <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                                         <td>{staff.full_name}</td>
//                                         <td>{staff.email}</td>
//                                         <td>{staff.phone}</td>
//                                         <td>{staff.branch}</td>
//                                         <td>
//                                             <span className={`badge ${staff.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
//                                                 {staff.status}
//                                             </span>
//                                         </td>

//                                         <td className="" style={{ alignItems: "center" }}>
//                                             <button className="btn btn-sm btn-outline-danger "
//                                                 onClick={() => handleDelete(staff.id)}> Delete
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))}
//                                 {currentItems.length === 0 && (
//                                     <tr>
//                                         <td colSpan="7" className="text-center py-4 text-muted">
//                                             No staff members found
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                     {totalPages > 1 && (
//                         <nav className="mt-4">
//                             <ul className="pagination justify-content-center">
//                                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                                     <button
//                                         className="page-link"
//                                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                                     >
//                                         Previous
//                                     </button>
//                                 </li>
//                                 {[...Array(totalPages)].map((_, i) => (
//                                     <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
//                                         <button
//                                             className="page-link"
//                                             onClick={() => setCurrentPage(i + 1)}
//                                         >
//                                             {i + 1}
//                                         </button>
//                                     </li>
//                                 ))}
//                                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                                     <button
//                                         className="page-link"
//                                         onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                                     >
//                                         Next
//                                     </button>
//                                 </li>
//                             </ul>
//                         </nav>
//                     )}
//                 </div>
//             </div>
//             {/* Add/Edit Staff Modal */}
//             {
//                 showModal && (
//                     <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//                         <div className="modal-dialog modal-lg modal-dialog-centered">
//                             <div className="modal-content">
//                                 <div className="modal-header">
//                                     <h5 className="modal-title">
//                                         {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
//                                     </h5>
//                                     <button
//                                         type="button"
//                                         className="btn-close"
//                                         onClick={() => setShowModal(false)}
//                                     ></button>
//                                 </div>
//                                 <form onSubmit={handleSubmit}>
//                                     <div className="modal-body">
//                                         <div className="row g-3">
//                                             <div className="col-md-6">
//                                                 <label className="form-label">Full Name</label>
//                                                 <input
//                                                     type="text"
//                                                     className="form-control"
//                                                     name="full_name"
//                                                     placeholder="Full Name"
//                                                     value={formData.full_name}
//                                                     onChange={handleInputChange}
//                                                     required
//                                                 />
//                                             </div>
//                                             <div className="col-md-6">
//                                                 <label className="form-label">Email</label>
//                                                 <input
//                                                     type="email"
//                                                     className="form-control"
//                                                     name="email"
//                                                     placeholder="Email"
//                                                     value={formData.email}
//                                                     onChange={handleInputChange}
//                                                     required
//                                                 />
//                                             </div>
//                                             <div className="col-md-6">
//                                                 <label className="form-label">Phone</label>
//                                                 <input
//                                                     type="tel"
//                                                     className="form-control"
//                                                     name="phone"
//                                                     placeholder="Phone"
//                                                     value={formData.phone}
//                                                     onChange={handleInputChange}
//                                                     required
//                                                 />
//                                             </div>
//                                             <div className="col-md-6">
//                                                 <label className="form-label">Status</label>
//                                                 <select
//                                                     className="form-select"
//                                                     name="status"
//                                                     value={formData.status}
//                                                     onChange={handleInputChange}
//                                                 >
//                                                     <option value="active">Active</option>
//                                                     <option value="inactive">Inactive</option>
//                                                 </select>
//                                             </div>
//                                             {!editingId && (
//                                                 <div className="col-md-6">
//                                                     <label className="form-label">Password</label>
//                                                     <input
//                                                         type="password"
//                                                         className="form-control"
//                                                         name="password"
//                                                         placeholder="Password"
//                                                         value={formData.password}
//                                                         onChange={handleInputChange}
//                                                         required={!editingId}
//                                                     />
//                                                 </div>
//                                             )}
//                                             <div className="col-md-6">
//                                                 <label className="form-label">Branch</label>
//                                                 <select
//                                                     className="form-select"
//                                                     name="branch"
//                                                     value={formData.branch}
//                                                     onChange={handleInputChange}
//                                                     required
//                                                 >
//                                                     <option value="Default Branch">Default Branch</option>
//                                                     <option value="Sylhet">Sylhet</option>
//                                                     <option value="Dhaka">Dhaka</option>
//                                                     <option value="Both">Both</option>
//                                                 </select>
//                                             </div>
//                                         </div>
//                                         <div className="mt-4">
//                                             <h5>Permissions</h5>
//                                             <div className="table-responsive">
//                                                 <table className="table table-sm table-bordered">
//                                                     <thead className="table-light">
//                                                         <tr>
//                                                             <th>Module</th>
//                                                             <th className="text-center">View</th>
//                                                             <th className="text-center">Add</th>
//                                                             <th className="text-center">Edit</th>
//                                                             <th className="text-center">Delete</th>
//                                                         </tr>
//                                                     </thead>
//                                                     <tbody>
//                                                         {Object.entries(formData.permissions).map(([module, perms]) => (
//                                                             <tr key={module}>
//                                                                 <td>{module}</td>
//                                                                 <td className="text-center">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name={`permission_${module}_view`}
//                                                                         checked={perms.view}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                 </td>
//                                                                 <td className="text-center">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name={`permission_${module}_add`}
//                                                                         checked={perms.add}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                 </td>
//                                                                 <td className="text-center">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name={`permission_${module}_edit`}
//                                                                         checked={perms.edit}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                 </td>
//                                                                 <td className="text-center">
//                                                                     <input
//                                                                         type="checkbox"
//                                                                         name={`permission_${module}_delete`}
//                                                                         checked={perms.delete}
//                                                                         onChange={handleInputChange}
//                                                                     />
//                                                                 </td>
//                                                             </tr>
//                                                         ))}
//                                                     </tbody>
//                                                 </table>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="modal-footer">
//                                         <button
//                                             type="button"
//                                             className="btn btn-secondary"
//                                             onClick={() => setShowModal(false)}
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button type="submit" className="btn btn-primary">
//                                             {editingId ? 'Save Changes' : 'Add Staff'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 )
//             }
//         </div>
//     );
// };
// export default Addstaff;



import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { Form } from "react-bootstrap";
import api from "../../services/axiosInterceptor";
import BASE_URL from "../../Config";

const Addstaff = () => {
    const [staffMembers, setStaffMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedStaffId, setExpandedStaffId] = useState(null);
    const [staffLeads, setStaffLeads] = useState({});
    const itemsPerPage = 100;

    const defaultPermissions = {
        Inquiry: { view: false, add: false, edit: false, delete: false },
        Lead: { view: false, add: false, edit: false, delete: false },
        "Payments & Invoice": { view: false, add: false, edit: false, delete: false }
    };

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
        permissions: JSON.parse(JSON.stringify(defaultPermissions)),
        branch: "Default Branch",
    });

    const fetchStaff = async () => {
        try {
            const res = await api.get(`${BASE_URL}getAllStaff`);
            setStaffMembers(res.data);
        } catch (err) {
            console.error("Failed to fetch staff", err);
            Swal.fire("Error", "Failed to fetch staff members", "error");
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith("permission_")) {
            const [_, module, action] = name.split("_");
            setFormData(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [module]: {
                        ...prev.permissions[module],
                        [action]: checked
                    }
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const permissionsArray = Object.entries(formData.permissions).map(([module, perm]) => ({
            permission_name: module,
            view_permission: perm.view ? 1 : 0,
            add_permission: perm.add ? 1 : 0,
            edit_permission: perm.edit ? 1 : 0,
            delete_permission: perm.delete ? 1 : 0
        }));
        const payload = {
            ...formData,
            user_id: 1,
            role: "staff",
            permissions: permissionsArray
        };
        try {
            if (editingId) {
                await api.put(`${BASE_URL}updateStaff/${editingId}`, payload);
                Swal.fire("Success", "Staff updated successfully", "success");
            } else {
                await api.post(`${BASE_URL}createStaff`, payload);
                Swal.fire("Success", "Staff member added", "success");
            }
            fetchStaff();
            setShowModal(false);
            resetForm();
        } catch (err) {
            Swal.fire("Error", "Operation failed", "error");
            console.error("API Error:", err);
        }
    };

    const handleEdit = (staff) => {
        const permissionsObj = staff.permissions?.reduce((acc, perm) => {
            acc[perm.permission_name] = {
                view: perm.view_permission === 1,
                add: perm.add_permission === 1,
                edit: perm.edit_permission === 1,
                delete: perm.delete_permission === 1
            };
            return acc;
        }, JSON.parse(JSON.stringify(defaultPermissions)));
        setFormData({
            full_name: staff.full_name,
            email: staff.email,
            phone: staff.phone,
            password: "",
            status: staff.status,
            permissions: permissionsObj,
            branch: staff.branch || "",
        });
        setEditingId(staff.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this staff member?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete"
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`${BASE_URL}deleteStaff/${id}`);
                Swal.fire("Deleted", "Staff member removed", "success");
                fetchStaff();
            } catch (err) {
                Swal.fire("Error", "Delete operation failed", "error");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            full_name: "",
            email: "",
            phone: "",
            password: "",
            status: "active",
            permissions: JSON.parse(JSON.stringify(defaultPermissions)),
            branch: "Default Branch",
        });
        setEditingId(null);
    };

    const fetchStaffBranch = async (staffId) => {
        try {

            let response;


            try {
                response = await api.get(`${BASE_URL}getStaffById/${staffId}`);
            } catch (err) {
                console.log("First API endpoint failed, trying alternative...");
                response = await api.get(`${BASE_URL}staff/${staffId}`);
            }

            if (response.status === 200 && response.data) {

                let staff;
                if (Array.isArray(response.data) && response.data.length > 0) {
                    staff = response.data[0];
                } else if (typeof response.data === 'object') {
                    staff = response.data;
                } else {
                    console.warn("Unexpected response format:", response.data);
                    return { branch: null, created_at: null };
                }


                const branch = staff.branch || staff.branch_name || null;
                const created_at = staff.created_at || staff.createdAt || staff.creation_date || null;

                return {
                    branch: branch,
                    created_at: created_at
                        ? new Date(created_at).toISOString().split("T")[0]
                        : null,
                };
            } else {
                console.warn("Unexpected response:", response);
                return { branch: null, created_at: null };
            }
        } catch (error) {
            console.error("Error fetching staff branch:", error);
            return { branch: null, created_at: null };
        }
    };


    const fetchStaffLeads = async (staff) => {
        try {
            // 如果已经获取过该员工的线索，则直接展开/折叠
            if (staffLeads[staff.id]) {
                setExpandedStaffId(expandedStaffId === staff.id ? null : staff.id);
                return;
            }

            Swal.fire({
                title: 'Loading...',
                text: 'Fetching staff leads',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let branch = staff.branch;
            let created_at = staff.created_at;

            if (!branch || !created_at) {
                const staffData = await fetchStaffBranch(staff.id);
                branch = staffData.branch;
                created_at = staffData.created_at;
            }

            if (branch && created_at) {
                console.log(`Fetching leads for staff: ${staff.full_name}, branch: ${branch} from ${created_at}`);

                // 确保created_at只包含日期部分，不包含时间
                const dateOnly = created_at.includes('T')
                    ? created_at.split('T')[0]
                    : created_at;

                // 构建API URL
                const apiUrl = `${BASE_URL}AllConvertedLeadsinquiries?branch=${encodeURIComponent(branch)}&created_at=${encodeURIComponent(dateOnly)}`;
                console.log("API URL:", apiUrl);

                const response = await api.get(apiUrl);

                if (response.data && Array.isArray(response.data)) {
                    const withPriority = response.data.map((item) => ({
                        ...item,
                        priority: item.priority || "Low",
                    }));

                    // 存储员工线索
                    setStaffLeads(prev => ({
                        ...prev,
                        [staff.id]: withPriority
                    }));

                    // 展开该员工行
                    setExpandedStaffId(staff.id);

                    console.log(`Fetched ${response.data.length} leads for ${staff.full_name}`);

                    // 关闭加载指示器
                    Swal.close();
                } else {
                    console.error("Invalid response data:", response.data);

                    // 存储空数组
                    setStaffLeads(prev => ({
                        ...prev,
                        [staff.id]: []
                    }));

                    // 展开该员工行
                    setExpandedStaffId(staff.id);

                    // 关闭加载指示器并显示错误
                    Swal.close();
                    Swal.fire({
                        icon: 'info',
                        title: 'No Leads Found',
                        text: 'No leads found for this staff member'
                    });
                }
            } else {
                // 如果没有分支或创建日期，存储空数组
                setStaffLeads(prev => ({
                    ...prev,
                    [staff.id]: []
                }));

                // 展开该员工行
                setExpandedStaffId(staff.id);

                // 关闭加载指示器并显示消息
                Swal.close();
                Swal.fire({
                    icon: 'warning',
                    title: 'Missing Information',
                    text: 'Staff branch or creation date not found. Cannot fetch leads.'
                });
            }
        } catch (error) {
            console.error("Error fetching staff leads:", error);
            Swal.close();
            Swal.fire("Error", "Failed to fetch staff leads", "error");

            // 存储空数组
            setStaffLeads(prev => ({
                ...prev,
                [staff.id]: []
            }));

            // 展开该员工行
            setExpandedStaffId(staff.id);
        }
    };

    // Filter and pagination logic
    const filteredStaff = staffMembers.filter(staff =>
        staff.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const currentItems = filteredStaff.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3">
                <div>
                    <h3 className="mb-0">Staff Management</h3>
                </div>
                <div className="d-flex flex-column flex-md-row align-items-stretch gap-2 w-md-auto mt-2 mt-md-0">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                    >
                        + Add Staff
                    </button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr className="text-center">
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems?.map((staff, index) => (
                                    <React.Fragment key={staff.id}>
                                        <tr>
                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td>
                                                <button
                                                    className="btn btn-link p-0 text-decoration-none"
                                                    onClick={() => fetchStaffLeads(staff)}
                                                >
                                                    {staff.full_name}
                                                </button>
                                            </td>
                                            <td>{staff.email}</td>
                                            <td>{staff.phone}</td>
                                            <td>{staff.branch}</td>
                                            <td>
                                                <span className={`badge ${staff.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {staff.status}
                                                </span>
                                            </td>
                                            <td className="" style={{ alignItems: "center" }}>
                                                <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEdit(staff)}>
                                                    Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(staff.id)}>
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedStaffId === staff.id && (
                                            <tr>
                                                <td colSpan="7" className="p-0">
                                                    <div className="p-3 bg-light">
                                                        <h5 className="mb-3">Leads for {staff.full_name} ({staff.branch})</h5>
                                                        <div className="table-responsive">
                                                            <table className="table table-sm table-bordered">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>#</th>
                                                                        <th>Name</th>
                                                                        <th>Email</th>
                                                                        <th>Phone</th>
                                                                        <th>Status</th>
                                                                        <th>Priority</th>
                                                                        <th>Created Date</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {staffLeads[staff.id]?.map((lead, index) => (
                                                                        <tr key={lead.id}>
                                                                            <td>{index + 1}</td>
                                                                            <td>{lead.name || lead.full_name || 'N/A'}</td>
                                                                            <td>{lead.email || 'N/A'}</td>
                                                                            <td>{lead.phone_number || 'N/A'}</td>
                                                                            <td>
                                                                                <span
                                                                                    className={`badge ${lead.status === "1" ? 'bg-success' : 'bg-danger'
                                                                                        }`}
                                                                                >
                                                                                    {lead.status === "1" ? 'Active' : 'Inactive'}
                                                                                </span>
                                                                            </td>

                                                                            <td>
                                                                                <span className={`badge ${lead.priority === 'High' ? 'bg-danger' :
                                                                                        lead.priority === 'Medium' ? 'bg-warning' : 'bg-info'
                                                                                    }`}>
                                                                                    {lead.priority}
                                                                                </span>
                                                                            </td>
                                                                            <td>{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'N/A'}</td>
                                                                        </tr>
                                                                    ))}
                                                                    {(!staffLeads[staff.id] || staffLeads[staff.id].length === 0) && (
                                                                        <tr>
                                                                            <td colSpan="7" className="text-center py-4 text-muted">
                                                                                No leads found for this staff member
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted">
                                            No staff members found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <nav className="mt-4">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(totalPages)].map((_, i) => (
                                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            </div>

            {/* Add/Edit Staff Modal */}
            {
                showModal && (
                    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="full_name"
                                                    placeholder="Full Name"
                                                    value={formData.full_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phone"
                                                    placeholder="Phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="inactive">Inactive</option>
                                                </select>
                                            </div>
                                            {!editingId && (
                                                <div className="col-md-6">
                                                    <label className="form-label">Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        name="password"
                                                        placeholder="Password"
                                                        value={formData.password}
                                                        onChange={handleInputChange}
                                                        required={!editingId}
                                                    />
                                                </div>
                                            )}
                                            <div className="col-md-6">
                                                <label className="form-label">Branch</label>
                                                <select
                                                    className="form-select"
                                                    name="branch"
                                                    value={formData.branch}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="Default Branch">Default Branch</option>
                                                    <option value="Sylhet">Sylhet</option>
                                                    <option value="Dhaka">Dhaka</option>
                                                    <option value="Both">Both</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h5>Permissions</h5>
                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Module</th>
                                                            <th className="text-center">View</th>
                                                            <th className="text-center">Add</th>
                                                            <th className="text-center">Edit</th>
                                                            <th className="text-center">Delete</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(formData.permissions).map(([module, perms]) => (
                                                            <tr key={module}>
                                                                <td>{module}</td>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`permission_${module}_view`}
                                                                        checked={perms.view}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`permission_${module}_add`}
                                                                        checked={perms.add}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`permission_${module}_edit`}
                                                                        checked={perms.edit}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </td>
                                                                <td className="text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        name={`permission_${module}_delete`}
                                                                        checked={perms.delete}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editingId ? 'Save Changes' : 'Add Staff'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default Addstaff;