import React, { useState, useEffect } from 'react';
import { Navbar as BsNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MobileNavbar.css'; // Import mobile-specific styles

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'project_team':
        return 'Project Team';
      case 'finance_team':
        return 'Finance Team';
      case 'view_only':
        return 'View Only';
      default:
        return role;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <BsNavbar bg="light" expand="lg" className="navbar-custom">
      <Container>
        <BsNavbar.Brand as={Link} to="/dashboard" className={isMobile ? "small-brand" : ""}>
          DT TENDERS
        </BsNavbar.Brand>
        <BsNavbar.Toggle 
          aria-controls="basic-navbar-nav" 
          className={isMobile ? "navbar-toggler-mobile" : ""}
        />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/dashboard"
              className={isMobile ? "nav-link-mobile" : ""}
            >
              Dashboard
            </Nav.Link>
            {(user.role === 'admin' || user.role === 'project_team') && (
              <Nav.Link 
                as={Link} 
                to="/project/new"
                className={isMobile ? "nav-link-mobile" : ""}
              >
                New Project
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown 
              title={isMobile 
                ? user.username 
                : `${user.username} (${getRoleDisplayName(user.role)})`
              } 
              id="user-nav-dropdown"
              align="end"
              className={isMobile ? "nav-dropdown-mobile" : ""}
            >
              <NavDropdown.Item>
                <small className="text-muted">Role: {getRoleDisplayName(user.role)}</small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/profile">
                My Profile
              </NavDropdown.Item>
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
