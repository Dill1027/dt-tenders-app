import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Nav } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, ProjectFormData } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiSave, 
  FiArrowLeft, 
  FiFileText, 
  FiDollarSign, 
  FiUsers, 
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiEye
} from 'react-icons/fi';
import './ProjectStyles.css'; // Using a different CSS file name to avoid case sensitivity issues

const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [activeSection, setActiveSection] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();
  const { id, part } = useParams<{ id?: string; part?: string }>();
  
  const isEditing = Boolean(id);
  const editingPart = part || 'part1';

  // Role-based permission checks
  const canEditPart1 = () => {
    if (user?.permissions) {
      return user.permissions.canEditPart1;
    }
    return user?.role === 'project_team' || user?.role === 'admin';
  };
  
  const canEditPart2 = () => {
    if (user?.permissions) {
      return user.permissions.canEditPart2;
    }
    return user?.role === 'finance_team' || user?.role === 'admin';
  };
  
  const canEditPart3 = () => {
    if (user?.permissions) {
      return user.permissions.canEditPart3;
    }
    return user?.role === 'project_team' || user?.role === 'admin';
  };
  
  const canEditInvoicePayment = () => {
    if (user?.permissions) {
      return user.permissions.canEditInvoicePayment;
    }
    return user?.role === 'finance_team' || user?.role === 'project_team' || user?.role === 'admin';
  };
  
  const canEditCurrentPart = () => {
    switch (editingPart) {
      case 'part1':
        return canEditPart1();
      case 'part2':
        return canEditPart2();
      case 'part3':
        return canEditPart3();
      case 'invoice_payment':
        return canEditInvoicePayment();
      default:
        return false;
    }
  };

  const getAccessDeniedMessage = () => {
    const partNames = {
      part1: 'Project Creation',
      part2: 'Finance Section',
      part3: 'Project Team Section',
      invoice_payment: 'Invoice & Payment'
    };
    
    const requiredRoles = {
      part1: 'Project Team',
      part2: 'Finance Team',
      part3: 'Project Team',
      invoice_payment: 'Finance Team or Project Team'
    };
    
    return `Only ${requiredRoles[editingPart as keyof typeof requiredRoles]} members can edit the ${partNames[editingPart as keyof typeof partNames]} section.`;
  };

  useEffect(() => {
    if (isEditing && id) {
      fetchProject();
    }
    setActiveSection(editingPart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, id, editingPart]);

  const fetchProject = async () => {
    try {
      const projectData = await projectsAPI.getProject(id!);
      setProject(projectData);
      setFormData(projectData);
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast.error('Failed to fetch project details');
      navigate('/dashboard');
    }
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validation functions for each part
  const validatePart1 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.nameOfAwardedTender?.trim()) {
      errors.push('Name of Awarded Tender is required');
    }
    if (!formData.siteDetails?.trim()) {
      errors.push('Site Details is required');
    }
    if (!formData.createProjectInDislio) {
      errors.push('Create the Project in Dislio selection is required');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const validatePart2 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.checkWithStoreManager) {
      errors.push('Check with Store Manager selection is required');
    }
    if (!formData.purchasingNote?.trim()) {
      errors.push('Purchasing Note is required');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const validatePart3 = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.selectTeam) {
      errors.push('Select Team is required');
    }
    if (!formData.structurePanel?.trim()) {
      errors.push('Structure Panel is required');
    }
    if (!formData.timeline?.trim()) {
      errors.push('Timeline is required');
    }
    if (!formData.siteInstallationNote?.trim()) {
      errors.push('Site Installation Note is required');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const validateInvoicePayment = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.invoiceCreate) {
      errors.push('Invoice Create status is required');
    }
    if (!formData.paymentStatus) {
      errors.push('Payment Status is required');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const validateCurrentPart = (): { isValid: boolean; errors: string[] } => {
    if (!isEditing) {
      return validatePart1();
    }
    
    switch (editingPart) {
      case 'part1':
        return validatePart1();
      case 'part2':
        return validatePart2();
      case 'part3':
        return validatePart3();
      case 'invoice_payment':
        return validateInvoicePayment();
      default:
        return { isValid: false, errors: ['Invalid part specified'] };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check permissions before submitting
    if (isEditing && !canEditCurrentPart()) {
      setError(getAccessDeniedMessage());
      return;
    }

    // Validate all required fields for the current part
    const validation = validateCurrentPart();
    if (!validation.isValid) {
      setError(`Please fill in all required fields:\n${validation.errors.join('\n')}`);
      return;
    }

    setLoading(true);

    try {
      if (isEditing && id) {
        // Update existing project
        switch (editingPart) {
          case 'part1':
            await projectsAPI.updateProjectPart1(id, formData);
            break;
          case 'part2':
            await projectsAPI.updateProjectPart2(id, formData);
            break;
          case 'part3':
            await projectsAPI.updateProjectPart3(id, formData);
            break;
          case 'invoice_payment':
            await projectsAPI.updateInvoicePayment(id, formData);
            break;
          default:
            throw new Error('Invalid part specified');
        }
        toast.success(`${editingPart} updated successfully!`);
      } else {
        // Create new project (only project team can create)
        if (!canEditPart1()) {
          setError('Only Project Team members can create new projects.');
          return;
        }
        await projectsAPI.createProject(formData);
        toast.success('Project created successfully!');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPart1Fields = () => (
    <div className="form-section">
      <h5 className="section-title">
        <FiFileText className="me-2" />
        Project Information
      </h5>
      
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Name of Awarded Tender <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="nameOfAwardedTender"
          value={formData.nameOfAwardedTender || ''}
          onChange={handleChange}
          required
          placeholder="Enter the name of awarded tender"
          className="form-control-lg"
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Performance Bond Submission</Form.Label>
            <Form.Select
              name="performanceBondSubmission"
              value={formData.performanceBondSubmission || 'N/A'}
              onChange={handleChange}
              className="form-select-lg"
            >
              <option value="N/A">N/A</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Agreement Signed</Form.Label>
            <Form.Select
              name="agreementSigned"
              value={formData.agreementSigned || 'N/A'}
              onChange={handleChange}
              className="form-select-lg"
            >
              <option value="N/A">N/A</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Site Details <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="siteDetails"
          value={formData.siteDetails || ''}
          onChange={handleChange}
          required
          placeholder="Enter site details"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Create the Project in Dislio <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="createProjectInDislio"
          value={formData.createProjectInDislio || ''}
          onChange={handleChange}
          required
          className="form-select-lg"
        >
          <option value="">Select an option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part1"
          value={formData.noteForFinanceTeam_part1 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
          className="form-control-lg"
        />
      </Form.Group>
    </div>
  );

  const renderPart2Fields = () => (
    <div className="form-section">
      <h5 className="section-title">
        <FiDollarSign className="me-2" />
        Finance Details
      </h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Check with Store Manager <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="checkWithStoreManager"
              value={formData.checkWithStoreManager || 'No'}
              onChange={handleChange}
              required
              className="form-select-lg"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Ready or Not</Form.Label>
            <div className="mt-2">
              <Form.Check
                type="switch"
                id="readyOrNotSwitch"
                name="readyOrNot"
                label={formData.readyOrNot ? "Ready" : "Not Ready"}
                checked={formData.readyOrNot || false}
                onChange={handleChange}
              />
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Purchasing Note <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="purchasingNote"
          value={formData.purchasingNote || ''}
          onChange={handleChange}
          required
          placeholder="Enter purchasing note"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part2"
          value={formData.noteForFinanceTeam_part2 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
          className="form-control-lg"
        />
      </Form.Group>
    </div>
  );

  const renderPart3Fields = () => (
    <div className="form-section">
      <h5 className="section-title">
        <FiUsers className="me-2" />
        Team Details
      </h5>
      
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Select Team <span className="text-danger">*</span></Form.Label>
        <Form.Select
          name="selectTeam"
          value={formData.selectTeam || 'Company'}
          onChange={handleChange}
          required
          className="form-select-lg"
        >
          <option value="Company">Company</option>
          <option value="Subcontractor">Subcontractor</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Structure Panel <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="structurePanel"
          value={formData.structurePanel || ''}
          onChange={handleChange}
          required
          placeholder="Enter structure panel details"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Timeline <span className="text-danger">*</span></Form.Label>
        <Form.Control
          type="text"
          name="timeline"
          value={formData.timeline || ''}
          onChange={handleChange}
          required
          placeholder="Enter timeline details"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Site Installation Note <span className="text-danger">*</span></Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="siteInstallationNote"
          value={formData.siteInstallationNote || ''}
          onChange={handleChange}
          required
          placeholder="Enter site installation note"
          className="form-control-lg"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part3"
          value={formData.noteForFinanceTeam_part3 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
          className="form-control-lg"
        />
      </Form.Group>
    </div>
  );

  const renderInvoicePaymentFields = () => (
    <div className="form-section">
      <h5 className="section-title">
        <FiCreditCard className="me-2" />
        Invoice & Payment
      </h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Invoice Create <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="invoiceCreate"
              value={formData.invoiceCreate || 'Not Yet'}
              onChange={handleChange}
              required
              className="form-select-lg"
            >
              <option value="Not Yet">Not Yet</option>
              <option value="Done">Done</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Payment Status <span className="text-danger">*</span></Form.Label>
            <Form.Select
              name="paymentStatus"
              value={formData.paymentStatus || 'None'}
              onChange={handleChange}
              required
              className="form-select-lg"
            >
              <option value="None">None</option>
              <option value="20%">20%</option>
              <option value="Half">Half</option>
              <option value="80%">80%</option>
              <option value="Done">Done</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
    </div>
  );

  const getFormTitle = () => {
    if (!isEditing) return 'Create New Project';
    
    switch (editingPart) {
      case 'part2':
        return 'Finance Details';
      case 'part3':
        return 'Team Details';
      case 'invoice_payment':
        return 'Invoice & Payment';
      default:
        return 'Project Information';
    }
  };

  const renderFormFields = () => {
    if (!isEditing) return renderPart1Fields();
    
    switch (editingPart) {
      case 'part2':
        return renderPart2Fields();
      case 'part3':
        return renderPart3Fields();
      case 'invoice_payment':
        return renderInvoicePaymentFields();
      default:
        return renderPart1Fields();
    }
  };

  const getPartStatus = (partName: string) => {
    if (!project) return 'pending';
    
    switch (partName) {
      case 'part1':
        return project.part1Completed ? 'completed' : 'pending';
      case 'part2':
        return project.part2Completed ? 'completed' : 'pending';
      case 'part3':
        return project.part3Completed ? 'completed' : 'pending';
      default:
        return 'pending';
    }
  };

  const renderPartNavigation = () => {
    if (!isEditing) return null;
    
    return (
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Project Sections</h6>
        </Card.Header>
        <Card.Body className="py-2">
          <Nav variant="pills" className="flex-row flex-md-column">
            <Nav.Item className="me-2 me-md-0 mb-1">
              <Nav.Link 
                active={activeSection === 'part1'}
                onClick={() => navigate(`/projects/${id}/edit/part1`)}
                className="d-flex align-items-center justify-content-between"
              >
                <span>
                  <FiFileText className="me-2" />
                  Project Info
                </span>
                {getPartStatus('part1') === 'completed' && 
                  <FiCheckCircle size={16} className="text-success" />
                }
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="me-2 me-md-0 mb-1">
              <Nav.Link 
                active={activeSection === 'part2'}
                onClick={() => navigate(`/projects/${id}/edit/part2`)}
                className="d-flex align-items-center justify-content-between"
              >
                <span>
                  <FiDollarSign className="me-2" />
                  Finance
                </span>
                {getPartStatus('part2') === 'completed' && 
                  <FiCheckCircle size={16} className="text-success" />
                }
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="me-2 me-md-0 mb-1">
              <Nav.Link 
                active={activeSection === 'part3'}
                onClick={() => navigate(`/projects/${id}/edit/part3`)}
                className="d-flex align-items-center justify-content-between"
              >
                <span>
                  <FiUsers className="me-2" />
                  Team
                </span>
                {getPartStatus('part3') === 'completed' && 
                  <FiCheckCircle size={16} className="text-success" />
                }
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="me-2 me-md-0">
              <Nav.Link 
                active={activeSection === 'invoice_payment'}
                onClick={() => navigate(`/projects/${id}/edit/invoice_payment`)}
                className="d-flex align-items-center justify-content-between"
              >
                <span>
                  <FiCreditCard className="me-2" />
                  Invoice & Payment
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid="lg" className="py-4">
      <Row>
        <Col lg={3} className="d-none d-lg-block">
          {renderPartNavigation()}
          
          {/* Permissions Info Card */}
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Your Permissions</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center">
                  {canEditPart1() ? 
                    <FiCheckCircle className="text-success me-2" /> : 
                    <FiLock className="text-muted me-2" />
                  }
                  <span>Edit Project Info</span>
                </div>
                <div className="d-flex align-items-center">
                  {canEditPart2() ? 
                    <FiCheckCircle className="text-success me-2" /> : 
                    <FiLock className="text-muted me-2" />
                  }
                  <span>Edit Finance Details</span>
                </div>
                <div className="d-flex align-items-center">
                  {canEditPart3() ? 
                    <FiCheckCircle className="text-success me-2" /> : 
                    <FiLock className="text-muted me-2" />
                  }
                  <span>Edit Team Details</span>
                </div>
                <div className="d-flex align-items-center">
                  {canEditInvoicePayment() ? 
                    <FiCheckCircle className="text-success me-2" /> : 
                    <FiLock className="text-muted me-2" />
                  }
                  <span>Edit Invoice & Payment</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={9}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">{getFormTitle()}</h4>
                  {project && (
                    <p className="text-muted mb-0 mt-1">
                      Project: {project.nameOfAwardedTender}
                    </p>
                  )}
                </div>
                <Badge bg={isEditing ? "info" : "primary"}>
                  {isEditing ? "Editing" : "Creating New"}
                </Badge>
              </div>
            </Card.Header>
            
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FiAlertCircle className="me-2" size={20} />
                  {error}
                </Alert>
              )}
              
              {/* Access Control Warning */}
              {isEditing && !canEditCurrentPart() && (
                <Alert variant="warning" className="d-flex align-items-center">
                  <FiEye className="me-2" size={20} />
                  <div>
                    <h6 className="alert-heading">View Only Mode</h6>
                    {getAccessDeniedMessage()}
                  </div>
                </Alert>
              )}
              
              {!isEditing && !canEditPart1() && (
                <Alert variant="warning" className="d-flex align-items-center">
                  <FiLock className="me-2" size={20} />
                  <div>
                    <h6 className="alert-heading">Access Denied</h6>
                    Only Project Team members can create new projects.
                  </div>
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <fieldset disabled={isEditing ? !canEditCurrentPart() : !canEditPart1()}>
                  {renderFormFields()}
                </fieldset>
                
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard')}
                    className="d-flex align-items-center"
                  >
                    <FiArrowLeft className="me-2" />
                    {isEditing && !canEditCurrentPart() ? 'Back to Dashboard' : 'Cancel'}
                  </Button>
                  
                  {((isEditing && canEditCurrentPart()) || (!isEditing && canEditPart1())) && (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="d-flex align-items-center"
                    >
                      {loading ? (
                        <>
                          <output className="spinner-border spinner-border-sm me-2" aria-label="Saving">
                            <span className="visually-hidden">Saving...</span>
                          </output>
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProjectForm;