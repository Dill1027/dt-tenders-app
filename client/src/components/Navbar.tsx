import React from 'react';
import { Navbar as BsNavbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'project_team':
        return 'Project Team';
      case 'finance_team':
        return 'Finance Team';
      case 'all_users':
        return 'General User';
      default:
        return role;
    }
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="navbar-custom">
      <Container fluid>
        <BsNavbar.Brand as={Link} to="/dashboard">
          DT TENDERS
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">
              Dashboard
            </Nav.Link>
            {user?.role === 'project_team' && (
              <Nav.Link as={Link} to="/projects/new">
                New Project
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <NavDropdown 
              title={`${user.username} (${getRoleDisplayName(user.role)})`} 
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item>
                <small className="text-muted">Role: {getRoleDisplayName(user.role)}</small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
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
