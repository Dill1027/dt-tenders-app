import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, ProgressBar, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiCheckCircle, 
  FiClock, 
  FiUser, 
  FiCalendar,
  FiFileText,
  FiInfo,
  FiLock
} from 'react-icons/fi';
import './projectView.css'; // Make sure filename matches exactly with lowercase p

const ProjectView: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const projectData = await projectsAPI.getProject(id!);
      setProject(projectData);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const canEditSection = (section: string) => {
    if (!user || !project) return false;
    
    // Check explicit permissions first
    if (user.permissions) {
      switch (section) {
        case 'part1':
          return user.permissions.canEditPart1 && !project.part1Completed;
        case 'part2':
          return user.permissions.canEditPart2 && !project.part2Completed;
        case 'part3':
          return user.permissions.canEditPart3 && !project.part3Completed;
        case 'invoice_payment':
          return user.permissions.canEditInvoicePayment;
        default:
          return false;
      }
    }
    
    // Fallback to role-based permissions
    switch (section) {
      case 'part1':
        return (user.role === 'project_team' || user.role === 'admin') && !project.part1Completed;
      case 'part2':
        return (user.role === 'finance_team' || user.role === 'admin') && !project.part2Completed;
      case 'part3':
        return (user.role === 'project_team' || user.role === 'admin') && !project.part3Completed;
      case 'invoice_payment':
        return user.role === 'finance_team' || user.role === 'project_team' || user.role === 'admin';
      default:
        return false;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary', text: 'Draft', icon: <FiFileText className="me-1" /> },
      in_progress: { variant: 'warning', text: 'In Progress', icon: <FiClock className="me-1" /> },
      completed: { variant: 'success', text: 'Completed', icon: <FiCheckCircle className="me-1" /> },
      cancelled: { variant: 'danger', text: 'Cancelled', icon: <FiInfo className="me-1" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge bg={config.variant} className="d-flex align-items-center px-3 py-2">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const getCompletionProgress = () => {
    if (!project) return 0;
    const completedParts = [project.part1Completed, project.part2Completed, project.part3Completed].filter(Boolean).length;
    return Math.round((completedParts / 3) * 100);
  };

  const renderField = (label: string, value: string | boolean | undefined, type: 'text' | 'boolean' | 'note' = 'text') => {
    if (value === undefined || value === null || value === '') {
      return (
        <div className="detail-item">
          <dt className="detail-label">{label}:</dt>
          <dd className="detail-value text-muted">Not specified</dd>
        </div>
      );
    }

    if (type === 'boolean') {
      return (
        <div className="detail-item">
          <dt className="detail-label">{label}:</dt>
          <dd className="detail-value">
            <Badge bg={value ? 'success' : 'secondary'} className="px-2 py-1">
              {value ? 'Yes' : 'No'}
            </Badge>
          </dd>
        </div>
      );
    }

    if (type === 'note') {
      return (
        <div className="detail-item">
          <dt className="detail-label">{label}:</dt>
          <dd className="detail-value">
            <Card className="bg-light border-0">
              <Card.Body className="py-2">
                <p className="mb-0">{value}</p>
              </Card.Body>
            </Card>
          </dd>
        </div>
      );
    }

    return (
      <div className="detail-item">
        <dt className="detail-label">{label}:</dt>
        <dd className="detail-value">{value}</dd>
      </div>
    );
  };

  const renderSectionHeader = (title: string, completed: boolean, section: string) => {
    return (
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <div className="d-flex align-items-center">
          <Badge bg={completed ? 'success' : 'warning'} className="me-2 px-3 py-2">
            {completed ? (
              <span className="d-flex align-items-center">
                <FiCheckCircle className="me-1" />
                Completed
              </span>
            ) : (
              <span className="d-flex align-items-center">
                <FiClock className="me-1" />
                Pending
              </span>
            )}
          </Badge>
          {canEditSection(section) && (
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => navigate(`/projects/${project!._id}/edit/${section}`)}
              className="d-flex align-items-center"
            >
              <FiEdit className="me-1" />
              Edit
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container fluid="lg" className="py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading project details...</p>
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container fluid="lg" className="py-4">
        <div className="text-center py-5">
          <FiInfo size={48} className="text-muted mb-3" />
          <h4>Project not found</h4>
          <p className="text-muted mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/dashboard')} variant="primary" className="d-flex align-items-center mx-auto">
            <FiArrowLeft className="me-2" />
            Back to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline-secondary"
                className="d-flex align-items-center mb-3"
              >
                <FiArrowLeft className="me-2" />
                Back to Dashboard
              </Button>
              <h1 className="h2 mb-2">{project.nameOfAwardedTender}</h1>
              <p className="text-muted mb-0">{project.siteDetails}</p>
            </div>
            <div className="text-end">
              {getStatusBadge(project.status)}
              <div className="mt-2">
                <small className="text-muted">Project ID: {project._id}</small>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Progress Bar */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="py-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Project Completion</h6>
                <span className="text-muted">{getCompletionProgress()}%</span>
              </div>
              <ProgressBar 
                now={getCompletionProgress()} 
                variant={getCompletionProgress() === 100 ? 'success' : 'primary'}
                className="mb-2"
                style={{ height: '8px' }}
              />
              <div className="d-flex justify-content-between">
                <small className="text-muted">
                  Part 1: {project.part1Completed ? '✅' : '⏳'}
                </small>
                <small className="text-muted">
                  Part 2: {project.part2Completed ? '✅' : '⏳'}
                </small>
                <small className="text-muted">
                  Part 3: {project.part3Completed ? '✅' : '⏳'}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={4} className="mb-4">
          {/* Project Metadata Card */}
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Project Overview</h6>
            </Card.Header>
            <Card.Body>
              <div className="detail-list">
                <div className="detail-item">
                  <dt className="detail-label">Created By</dt>
                  <dd className="detail-value d-flex align-items-center">
                    <FiUser className="me-2 text-muted" />
                    {project.createdBy?.username || 'Unknown User'}
                  </dd>
                </div>
                <div className="detail-item">
                  <dt className="detail-label">Created Date</dt>
                  <dd className="detail-value d-flex align-items-center">
                    <FiCalendar className="me-2 text-muted" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="detail-item">
                  <dt className="detail-label">Last Modified</dt>
                  <dd className="detail-value d-flex align-items-center">
                    <FiCalendar className="me-2 text-muted" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
                {project.lastModifiedBy && (
                  <div className="detail-item">
                    <dt className="detail-label">Last Modified By</dt>
                    <dd className="detail-value d-flex align-items-center">
                      <FiUser className="me-2 text-muted" />
                      {project.lastModifiedBy.username}
                    </dd>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {/* Part 1 - Project Creation */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              {renderSectionHeader('Project Information', project.part1Completed, 'part1')}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Name of Awarded Tender', project.nameOfAwardedTender)}
                    {renderField('Performance Bond Submission', project.performanceBondSubmission)}
                    {renderField('Agreement Signed', project.agreementSigned)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Create Project in Dislio', project.createProjectInDislio)}
                    {renderField('Site Details', project.siteDetails, 'note')}
                  </div>
                </Col>
              </Row>
              {project.noteForFinanceTeam_part1 && (
                <div className="mt-3">
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part1, 'note')}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Part 2 - Finance Section */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              {renderSectionHeader('Finance Details', project.part2Completed, 'part2')}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Check with Store Manager', project.checkWithStoreManager)}
                    {renderField('Ready or Not', project.readyOrNot, 'boolean')}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Purchasing Note', project.purchasingNote, 'note')}
                  </div>
                </Col>
              </Row>
              {project.noteForFinanceTeam_part2 && (
                <div className="mt-3">
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part2, 'note')}
                </div>
              )}
              {!canEditSection('part2') && project.part2Completed && (
                <Alert variant="info" className="mt-3 d-flex align-items-center">
                  <FiCheckCircle className="me-2" />
                  This section has been completed and can no longer be edited.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Part 3 - Project Team Section */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              {renderSectionHeader('Team Details', project.part3Completed, 'part3')}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Select Team', project.selectTeam)}
                    {renderField('Structure Panel', project.structurePanel)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Timeline', project.timeline)}
                    {renderField('Site Installation Note', project.siteInstallationNote, 'note')}
                  </div>
                </Col>
              </Row>
              {project.noteForFinanceTeam_part3 && (
                <div className="mt-3">
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part3, 'note')}
                </div>
              )}
              {!canEditSection('part3') && project.part3Completed && (
                <Alert variant="info" className="mt-3 d-flex align-items-center">
                  <FiCheckCircle className="me-2" />
                  This section has been completed and can no longer be edited.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Invoice & Payment Section */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Invoice & Payment</h5>
                {canEditSection('invoice_payment') && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/projects/${project._id}/edit/invoice_payment`)}
                    className="d-flex align-items-center"
                  >
                    <FiEdit className="me-1" />
                    Edit
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Invoice Create', project.invoiceCreate)}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-list">
                    {renderField('Payment Status', project.paymentStatus)}
                  </div>
                </Col>
              </Row>
              {!canEditSection('invoice_payment') && (
                <Alert variant="info" className="mt-3 d-flex align-items-center">
                  <FiLock className="me-2" />
                  Only Finance Team and Project Team members can edit this section.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectView;