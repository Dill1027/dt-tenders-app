import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectsResponse } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiSearch, 
  FiPlus, 
  FiFilter, 
  FiRefreshCw, 
  FiEye, 
  FiDollarSign, 
  FiUsers, 
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiArchive,
  FiUser,
  FiCalendar
} from 'react-icons/fi';
import './Dashboard.css'; // Dashboard-specific styles
import '../components/progressBar.css'; // Progress bar styles

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response: ProjectsResponse = await projectsAPI.getProjects({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined
      });
      
      setProjects(response.projects);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary', text: 'Draft', icon: <FiFileText className="me-1" /> },
      in_progress: { variant: 'warning', text: 'In Progress', icon: <FiClock className="me-1" /> },
      completed: { variant: 'success', text: 'Completed', icon: <FiCheckCircle className="me-1" /> },
      cancelled: { variant: 'danger', text: 'Cancelled', icon: <FiArchive className="me-1" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge bg={config.variant} className="d-flex align-items-center status-badge">{config.icon}{config.text}</Badge>;
  };

  const getCompletionBadge = (project: Project) => {
    const completed = [project.part1Completed, project.part2Completed, project.part3Completed].filter(Boolean).length;
    const total = 3;
    const percentage = Math.round((completed / total) * 100);
    
    let variant = 'danger';
    if (percentage >= 100) variant = 'success';
    else if (percentage >= 66) variant = 'warning';
    else if (percentage >= 33) variant = 'info';

    return (
      <div className="d-flex align-items-center">
        <progress 
          className={`progress-bar-custom me-2 progress-${variant}`}
          value={percentage} 
          max="100"
          aria-label={`Project completion: ${percentage}%`}
        ></progress>
        <small className="text-muted">{completed}/{total} ({percentage}%)</small>
      </div>
    );
  };

  const canEditProject = (project: Project, part: string) => {
    if (!user) return false;
    
    // Check explicit permissions first
    if (user.permissions) {
      switch (part) {
        case 'part1':
          return user.permissions.canEditPart1;
        case 'part2':
          return user.permissions.canEditPart2;
        case 'part3':
          return user.permissions.canEditPart3;
        case 'invoice_payment':
          return user.permissions.canEditInvoicePayment;
        default:
          return false;
      }
    }
    
    // Fallback to role-based permissions
    switch (part) {
      case 'part1':
        return user.role === 'project_team' || user.role === 'admin';
      case 'part2':
        return user.role === 'finance_team' || user.role === 'admin';
      case 'part3':
        return user.role === 'project_team' || user.role === 'admin';
      case 'invoice_payment':
        return user.role === 'finance_team' || user.role === 'project_team' || user.role === 'admin';
      default:
        return false;
    }
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
          className="pagination-item"
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-between align-items-center mt-3 pagination-container">
        <div className="text-muted pagination-info">
          Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} entries
        </div>
        <Pagination className="mb-0 custom-pagination">
          <Pagination.Prev 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-nav"
          />
          {items}
          <Pagination.Next 
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-nav"
          />
        </Pagination>
      </div>
    );
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'project_team': return 'Project Team';
      case 'finance_team': return 'Finance Team';
      case 'admin': return 'Administrator';
      default: return 'General User';
    }
  };

  return (
    <Container fluid className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center header-content">
            <div className="header-text">
              <h1 className="dashboard-title">DT TENDERS Dashboard</h1>
              <p className="dashboard-subtitle">Manage and track all your tender projects</p>
            </div>
            <Button 
              onClick={() => navigate('/projects/new')}
              variant="primary"
              className="new-project-btn"
            >
              <FiPlus className="me-2" /> New Project
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4 stats-row">
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="stats-card total-projects">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase text-muted mb-1">Total Projects</h6>
                  <h3 className="mb-0 text-primary">{pagination.total}</h3>
                </div>
                <div className="icon-shape bg-primary text-white rounded-circle p-3">
                  <FiTrendingUp size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="stats-card in-progress">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase text-muted mb-1">In Progress</h6>
                  <h3 className="mb-0 text-warning">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </h3>
                </div>
                <div className="icon-shape bg-warning text-white rounded-circle p-3">
                  <FiClock size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="stats-card completed">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase text-muted mb-1">Completed</h6>
                  <h3 className="mb-0 text-success">
                    {projects.filter(p => p.status === 'completed').length}
                  </h3>
                </div>
                <div className="icon-shape bg-success text-white rounded-circle p-3">
                  <FiCheckCircle size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card user-role">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title text-uppercase text-muted mb-1">Your Role</h6>
                  <h6 className="mb-0 text-info">
                    {user ? getRoleDisplay(user.role) : 'Loading...'}
                  </h6>
                </div>
                <div className="icon-shape bg-info text-white rounded-circle p-3">
                  <FiUser size={20} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Card className="mb-4 filter-card">
        <Card.Body className="p-4">
          <h5 className="card-title mb-4 d-flex align-items-center filter-title">
            <FiFilter className="me-2" /> Filter Projects
          </h5>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3 mb-md-0">
                  <div className="input-group search-input-group">
                    <span className="input-group-text">
                      <FiSearch className="text-muted" />
                    </span>
                    <Form.Control
                      type="text"
                      placeholder="Search by tender name or site details..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3 mb-md-0">
                  <Form.Label htmlFor="status-filter" className="visually-hidden">Filter by Status</Form.Label>
                  <Form.Select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="status-filter"
                    aria-labelledby="status-filter-label"
                    name="statusFilter"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="d-flex filter-buttons">
                  <Button type="submit" variant="primary" className="apply-filter-btn">
                    Apply
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline-secondary"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                      setCurrentPage(1);
                    }}
                    title="Reset filters"
                    className="reset-filter-btn"
                  >
                    <FiRefreshCw />
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Projects Table */}
      <Card className="projects-table-card">
        <Card.Header className="table-header">
          <h5 className="mb-0">Projects</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="mt-3">Loading projects...</p>
            </div>
          )}
          
          {!loading && projects.length === 0 && (
            <div className="empty-state">
              <FiFilter size={48} className="empty-icon" />
              <h5>No projects found</h5>
              <p className="mb-4">Try adjusting your search or filter to find what you're looking for</p>
              <Button 
                onClick={() => navigate('/projects/new')}
                variant="primary"
                className="create-project-btn"
              >
                <FiPlus className="me-2" /> Create New Project
              </Button>
            </div>
          )}
          
          {!loading && projects.length > 0 && (
            <>
              <div className="table-container">
                <Table hover className="projects-table">
                  <thead>
                    <tr>
                      <th>Tender Name</th>
                      <th>Site Details</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Created By</th>
                      <th>Created Date</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr key={project._id} className="project-row">
                        <td>
                          <Link 
                            to={`/projects/${project._id}`}
                            className="project-link"
                          >
                            {project.nameOfAwardedTender}
                          </Link>
                        </td>
                        <td>{project.siteDetails}</td>
                        <td>{getStatusBadge(project.status)}</td>
                        <td>{getCompletionBadge(project)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="user-avatar">
                              <FiUser size={14} />
                            </div>
                            {project.createdBy?.username || 'Unknown User'}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="date-icon">
                              <FiCalendar size={14} />
                            </div>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Button
                              onClick={() => navigate(`/projects/${project._id}`)}
                              variant="outline-primary"
                              size="sm"
                              className="action-btn view-btn"
                              title="View project"
                            >
                              <FiEye size={14} />
                            </Button>
                            {canEditProject(project, 'part1') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part1`)}
                                variant="outline-primary"
                                size="sm"
                                className="action-btn edit-btn"
                                title="Edit project details"
                              >
                                <FiFileText size={14} />
                              </Button>
                            )}
                            {canEditProject(project, 'part2') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part2`)}
                                variant="outline-warning"
                                size="sm"
                                className="action-btn finance-btn"
                                title="Edit finance details"
                              >
                                <FiDollarSign size={14} />
                              </Button>
                            )}
                            {canEditProject(project, 'part3') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part3`)}
                                variant="outline-info"
                                size="sm"
                                className="action-btn team-btn"
                                title="Edit team details"
                              >
                                <FiUsers size={14} />
                              </Button>
                            )}
                            {canEditProject(project, 'invoice_payment') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/invoice_payment`)}
                                variant="outline-success"
                                size="sm"
                                className="action-btn invoice-btn"
                                title="Edit invoice/payment"
                              >
                                <FiFileText size={14} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;