import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Project, ProjectFormData } from '../types';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState<Project | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { id, part } = useParams<{ id?: string; part?: string }>();
  
  const isEditing = Boolean(id);
  const editingPart = part || 'part1';

  // Role-based permission checks
  const canEditPart1 = () => user?.role === 'project_team';
  const canEditPart2 = () => user?.role === 'finance_team';
  const canEditPart3 = () => user?.role === 'project_team';
  const canEditInvoicePayment = () => user?.role === 'finance_team' || user?.role === 'project_team';
  
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
      invoice_payment: 'Finance Team'
    };
    
    return `Access Denied: Only ${requiredRoles[editingPart as keyof typeof requiredRoles]} members can edit the ${partNames[editingPart as keyof typeof partNames]} section.`;
  };

  useEffect(() => {
    if (isEditing && id) {
      fetchProject();
    }
  }, [isEditing, id]);

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
          setError('Access Denied: Only Project Team members can create new projects.');
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
    <>
      <Form.Group className="mb-3">
        <Form.Label>Name of Awarded Tender *</Form.Label>
        <Form.Control
          type="text"
          name="nameOfAwardedTender"
          value={formData.nameOfAwardedTender || ''}
          onChange={handleChange}
          required
          placeholder="Enter the name of awarded tender"
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Performance Bond Submission</Form.Label>
            <Form.Select
              name="performanceBondSubmission"
              value={formData.performanceBondSubmission || 'N/A'}
              onChange={handleChange}
            >
              <option value="N/A">N/A</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Agreement Signed</Form.Label>
            <Form.Select
              name="agreementSigned"
              value={formData.agreementSigned || 'N/A'}
              onChange={handleChange}
            >
              <option value="N/A">N/A</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Site Details *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="siteDetails"
          value={formData.siteDetails || ''}
          onChange={handleChange}
          required
          placeholder="Enter site details"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Create the Project in Dislio *</Form.Label>
        <Form.Select
          name="createProjectInDislio"
          value={formData.createProjectInDislio || ''}
          onChange={handleChange}
          required
        >
          <option value="">Select an option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part1"
          value={formData.noteForFinanceTeam_part1 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
        />
      </Form.Group>
    </>
  );

  const renderPart2Fields = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Check with Store Manager *</Form.Label>
            <Form.Select
              name="checkWithStoreManager"
              value={formData.checkWithStoreManager || 'No'}
              onChange={handleChange}
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Ready or Not *</Form.Label>
            <Form.Check
              type="checkbox"
              name="readyOrNot"
              label="Ready"
              checked={formData.readyOrNot || false}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Purchasing Note *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="purchasingNote"
          value={formData.purchasingNote || ''}
          onChange={handleChange}
          required
          placeholder="Enter purchasing note"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part2"
          value={formData.noteForFinanceTeam_part2 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
        />
      </Form.Group>
    </>
  );

  const renderPart3Fields = () => (
    <>
      <Form.Group className="mb-3">
        <Form.Label>Select Team *</Form.Label>
        <Form.Select
          name="selectTeam"
          value={formData.selectTeam || 'Company'}
          onChange={handleChange}
          required
        >
          <option value="Company">Company</option>
          <option value="Subcontractor">Subcontractor</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Structure Panel *</Form.Label>
        <Form.Control
          type="text"
          name="structurePanel"
          value={formData.structurePanel || ''}
          onChange={handleChange}
          required
          placeholder="Enter structure panel details"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Timeline *</Form.Label>
        <Form.Control
          type="text"
          name="timeline"
          value={formData.timeline || ''}
          onChange={handleChange}
          required
          placeholder="Enter timeline details"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Site Installation Note *</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="siteInstallationNote"
          value={formData.siteInstallationNote || ''}
          onChange={handleChange}
          required
          placeholder="Enter site installation note"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Note for Finance Team</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="noteForFinanceTeam_part3"
          value={formData.noteForFinanceTeam_part3 || ''}
          onChange={handleChange}
          placeholder="Optional note for finance team"
        />
      </Form.Group>
    </>
  );

  const renderInvoicePaymentFields = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Invoice Create *</Form.Label>
            <Form.Select
              name="invoiceCreate"
              value={formData.invoiceCreate || 'Not Yet'}
              onChange={handleChange}
              required
            >
              <option value="Not Yet">Not Yet</option>
              <option value="Done">Done</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Payment Status *</Form.Label>
            <Form.Select
              name="paymentStatus"
              value={formData.paymentStatus || 'None'}
              onChange={handleChange}
              required
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
    </>
  );

  const getFormTitle = () => {
    if (!isEditing) return 'Create New Project - Part 1';
    
    switch (editingPart) {
      case 'part2':
        return 'Edit Project - Finance Section';
      case 'part3':
        return 'Edit Project - Project Team Section';
      case 'invoice_payment':
        return 'Edit Project - Invoice & Payment';
      default:
        return 'Edit Project';
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

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Header>
              <h4>{getFormTitle()}</h4>
              {project && (
                <small className="text-muted">
                  Project: {project.nameOfAwardedTender}
                </small>
              )}
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {/* Access Control Warning */}
              {isEditing && !canEditCurrentPart() && (
                <Alert variant="warning">
                  <Alert.Heading>View Only Mode</Alert.Heading>
                  {getAccessDeniedMessage()}
                </Alert>
              )}
              
              {!isEditing && !canEditPart1() && (
                <Alert variant="warning">
                  <Alert.Heading>Access Denied</Alert.Heading>
                  Only Project Team members can create new projects.
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <fieldset disabled={isEditing ? !canEditCurrentPart() : !canEditPart1()}>
                  {renderFormFields()}
                </fieldset>
                
                <div className="d-flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    {isEditing && !canEditCurrentPart() ? 'Back to Dashboard' : 'Cancel'}
                  </Button>
                  {((isEditing && canEditCurrentPart()) || (!isEditing && canEditPart1())) && (
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save'}
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
