import React from 'react';
import { Card, Badge, Button, ProgressBar } from 'react-bootstrap';
import { Project } from '../types';
import { 
  FiEye, 
  FiEdit, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle,
  FiFileText,
  FiCalendar
} from 'react-icons/fi';

interface ProjectCardProps {
  project: Project;
  canEditPart1: boolean;
  canEditPart2: boolean;
}

const ProjectCardMobile: React.FC<ProjectCardProps> = ({ project, canEditPart1, canEditPart2 }) => {
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'primary';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'in_review': return 'warning';
      case 'on_hold': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'in_review': return 'In Review';
      case 'on_hold': return 'On Hold';
      default: return status;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'draft': return <FiFileText className="me-1" size={12} />;
      case 'submitted': return <FiClock className="me-1" size={12} />;
      case 'approved': return <FiCheckCircle className="me-1" size={12} />;
      case 'rejected': return <FiAlertCircle className="me-1" size={12} />;
      case 'in_review': return <FiClock className="me-1" size={12} />;
      case 'on_hold': return <FiClock className="me-1" size={12} />;
      default: return <FiFileText className="me-1" size={12} />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card className="mobile-card-view">
      <div className="mobile-card-header">
        <Card.Title>{project.nameOfAwardedTender}</Card.Title>
        <Badge 
          bg={getStatusBadgeVariant(project.status)} 
          className="mobile-status-badge"
        >
          {getStatusIcon(project.status)}
          {getStatusLabel(project.status)}
        </Badge>
      </div>
      <Card.Body>
        <div className="card-details">
          <div className="card-details-row">
            <span className="card-details-label">Site Details:</span>
            <span className="card-details-value">{project.siteDetails?.substring(0, 30) || 'N/A'}</span>
          </div>
          
          <div className="card-details-row">
            <span className="card-details-label">Agreement Signed:</span>
            <span className="card-details-value">{project.agreementSigned}</span>
          </div>
          
          <div className="card-details-row">
            <span className="card-details-label">Created Date:</span>
            <span className="card-details-value">{formatDate(project.createdAt)}</span>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mobile-progress-wrapper">
          <div className="mobile-progress-bar-outer">
            <div 
              className={`mobile-progress-bar-inner progress-width-${Math.round((project.completionPercentage || 0) / 5) * 5}`}
            ></div>
          </div>
          <div className="mobile-progress-text">
            <span>Progress</span>
            <span>{project.completionPercentage || 0}%</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="mobile-card-actions">
          <Button 
            onClick={() => window.location.href = `/projects/${project._id}`}
            variant="outline-primary" 
            className="mobile-action-button"
          >
            <FiEye size={16} /> View
          </Button>
          
          {(canEditPart1 || canEditPart2) && (
            <Button 
              onClick={() => window.location.href = `/projects/${project._id}/edit/${canEditPart1 ? 'part1' : 'part2'}`}
              variant="outline-secondary" 
              className="mobile-action-button"
            >
              <FiEdit size={16} /> Edit
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCardMobile;
