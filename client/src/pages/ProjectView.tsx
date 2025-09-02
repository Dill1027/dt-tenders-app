import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

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
    
    switch (section) {
      case 'part2':
        return (user.role === 'finance_team' || user.role === 'project_team') && !project.part2Completed;
      case 'part3':
        return user.role === 'project_team' && !project.part3Completed;
      case 'invoice_payment':
        return user.role === 'project_team' || user.role === 'finance_team';
      default:
        return false;
    }
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

  const renderField = (label: string, value: string | boolean, type: 'text' | 'boolean' = 'text') => {
    if (type === 'boolean') {
      return (
        <tr>
          <td><strong>{label}:</strong></td>
          <td>
            <Badge bg={value ? 'success' : 'secondary'}>
              {value ? 'Yes' : 'No'}
            </Badge>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td><strong>{label}:</strong></td>
        <td>{value || 'Not specified'}</td>
      </tr>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container>
        <div className="text-center">
          <h4>Project not found</h4>
          <Button onClick={() => navigate('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>{project.nameOfAwardedTender}</h1>
            <div>
              {getStatusBadge(project.status)}
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline-secondary"
                className="ms-2"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Project Overview */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Project Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Table>
                    <tbody>
                      {renderField('Created By', project.createdBy?.username || 'Unknown User')}
                      {renderField('Created Date', new Date(project.createdAt).toLocaleString())}
                      {renderField('Last Modified', new Date(project.updatedAt).toLocaleString())}
                      {project.lastModifiedBy && renderField('Last Modified By', project.lastModifiedBy?.username || 'Unknown User')}
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <Table>
                    <tbody>
                      {renderField('Part 1 Completed', project.part1Completed, 'boolean')}
                      {renderField('Part 2 Completed', project.part2Completed, 'boolean')}
                      {renderField('Part 3 Completed', project.part3Completed, 'boolean')}
                      {renderField('Overall Status', project.status)}
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Part 1 - Project Creation */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Part 1 - Project Creation</h5>
              <Badge bg={project.part1Completed ? 'success' : 'warning'}>
                {project.part1Completed ? 'Completed' : 'Pending'}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                  {renderField('Name of Awarded Tender', project.nameOfAwardedTender)}
                  {renderField('Performance Bond Submission', project.performanceBondSubmission)}
                  {renderField('Agreement Signed', project.agreementSigned)}
                  {renderField('Site Details', project.siteDetails)}
                  {renderField('Create Project in Dislio', project.createProjectInDislio)}
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part1)}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Part 2 - Finance Section */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Part 2 - Finance Section</h5>
              <div>
                <Badge bg={project.part2Completed ? 'success' : 'warning'} className="me-2">
                  {project.part2Completed ? 'Completed' : 'Pending'}
                </Badge>
                {canEditSection('part2') && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/projects/${project._id}/edit/part2`)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                  {renderField('Check with Store Manager', project.checkWithStoreManager)}
                  {renderField('Ready or Not', project.readyOrNot, 'boolean')}
                  {renderField('Purchasing Note', project.purchasingNote)}
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part2)}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Part 3 - Project Team Section */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Part 3 - Project Team Section</h5>
              <div>
                <Badge bg={project.part3Completed ? 'success' : 'warning'} className="me-2">
                  {project.part3Completed ? 'Completed' : 'Pending'}
                </Badge>
                {canEditSection('part3') && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/projects/${project._id}/edit/part3`)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                  {renderField('Select Team', project.selectTeam)}
                  {renderField('Structure Panel', project.structurePanel)}
                  {renderField('Timeline', project.timeline)}
                  {renderField('Site Installation Note', project.siteInstallationNote)}
                  {renderField('Note for Finance Team', project.noteForFinanceTeam_part3)}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Invoice & Payment Section */}
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>Invoice & Payment</h5>
              {canEditSection('invoice_payment') && (
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => navigate(`/projects/${project._id}/edit/invoice_payment`)}
                >
                  Edit
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Table>
                <tbody>
                  {renderField('Invoice Create', project.invoiceCreate)}
                  {renderField('Payment Status', project.paymentStatus)}
                </tbody>
              </Table>
              {!canEditSection('invoice_payment') && (
                <small className="text-muted">
                  * This section can only be edited by Project Team and Finance Team members
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectView;
