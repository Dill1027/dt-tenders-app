import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Project, ProjectsResponse } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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
      draft: { variant: 'secondary', text: 'Draft' },
      in_progress: { variant: 'warning', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' },
      cancelled: { variant: 'danger', text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getCompletionBadge = (project: Project) => {
    const completed = [project.part1Completed, project.part2Completed, project.part3Completed].filter(Boolean).length;
    const total = 3;
    const percentage = Math.round((completed / total) * 100);
    
    let variant = 'danger';
    if (percentage >= 100) variant = 'success';
    else if (percentage >= 66) variant = 'warning';
    else if (percentage >= 33) variant = 'info';

    return <Badge bg={variant}>{completed}/{total} Parts ({percentage}%)</Badge>;
  };

  const canEditProject = (project: Project, part: string) => {
    if (!user) return false;
    
    switch (part) {
      case 'part1':
        return user.role === 'project_team';
      case 'part2':
        return user.role === 'finance_team';
      case 'part3':
        return user.role === 'project_team';
      case 'invoice_payment':
        return user.role === 'finance_team' || user.role === 'project_team';
      default:
        return false;
    }
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const items = [];
    for (let number = 1; number <= pagination.pages; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev 
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
        {items}
        <Pagination.Next 
          disabled={currentPage === pagination.pages}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      </Pagination>
    );
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="mb-4">DT TENDERS Dashboard</h1>
          
          {/* Search and Filters */}
          <Card className="mb-4">
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Search Projects</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Search by tender name or site details..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Status Filter</Form.Label>
                      <Form.Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button type="submit" variant="primary" className="me-2">
                      Search
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('');
                        setCurrentPage(1);
                      }}
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Total Projects</h5>
                  <h3 className="text-primary">{pagination.total}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>In Progress</h5>
                  <h3 className="text-warning">
                    {projects.filter(p => p.status === 'in_progress').length}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Completed</h5>
                  <h3 className="text-success">
                    {projects.filter(p => p.status === 'completed').length}
                  </h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5>Your Role</h5>
                  <h6 className="text-info">
                    {user?.role === 'project_team' ? 'Project Team' :
                     user?.role === 'finance_team' ? 'Finance Team' : 'General User'}
                  </h6>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Projects Table */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Projects</h5>
              <Button 
                onClick={() => window.location.href = '/projects/new'}
                variant="primary"
              >
                Create New Project
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center">
                  <p>No projects found.</p>
                  <Button 
                    onClick={() => navigate('/projects/new')}
                    variant="primary"
                  >
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <>
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Tender Name</th>
                        <th>Site Details</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Created By</th>
                        <th>Created Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project._id}>
                          <td>
                            <Link 
                              to={`/projects/${project._id}`}
                              className="text-decoration-none"
                            >
                              {project.nameOfAwardedTender}
                            </Link>
                          </td>
                          <td>{project.siteDetails}</td>
                          <td>{getStatusBadge(project.status)}</td>
                          <td>{getCompletionBadge(project)}</td>
                          <td>
                            {project.createdBy?.username || 'Unknown User'}
                          </td>
                          <td>
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <Button
                              onClick={() => navigate(`/projects/${project._id}`)}
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                            >
                              View
                            </Button>
                            {canEditProject(project, 'part1') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part1`)}
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                              >
                                Project
                              </Button>
                            )}
                            {canEditProject(project, 'part2') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part2`)}
                                variant="outline-warning"
                                size="sm"
                                className="me-1"
                              >
                                Finance
                              </Button>
                            )}
                            {canEditProject(project, 'part3') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/part3`)}
                                variant="outline-info"
                                size="sm"
                                className="me-1"
                              >
                                Team
                              </Button>
                            )}
                            {canEditProject(project, 'invoice_payment') && (
                              <Button
                                onClick={() => navigate(`/projects/${project._id}/edit/invoice_payment`)}
                                variant="outline-success"
                                size="sm"
                              >
                                Invoice
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  
                  {renderPagination()}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
