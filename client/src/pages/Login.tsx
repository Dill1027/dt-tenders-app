import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff, FiUser, FiLock, FiInfo, FiArrowRight } from 'react-icons/fi';
import './login.css'; // We'll create this for custom styles

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const predefinedUsers = [
    { username: 'project', password: 'project@123', role: 'Project Team' },
    { username: 'finance', password: 'finance@321', role: 'Finance Team' },
    { username: 'deeptec', password: 'deeptec', role: 'All Users' },
  ];

  return (
    <Container fluid className="login-container">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={10} lg={8} xl={6}>
          <div className="d-flex justify-content-center">
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="logo-container mb-3">
                    <div className="logo-icon">
                      <FiArrowRight size={28} />
                    </div>
                  </div>
                  <h2 className="fw-bold text-primary">DT TENDERS</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <FiInfo className="me-2" size={18} />
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Username</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FiUser className="text-muted" />
                      </span>
                      <Form.Control
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        className="border-start-0"
                      />
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Password</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <FiLock className="text-muted" />
                      </span>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="border-start-0 pe-5"
                      />
                      <span 
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </span>
                    </div>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 fw-medium"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Sign In <FiArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>
                
                <div className="mt-4 pt-3 border-top">
                  <Button 
                    variant="outline-info" 
                    className="w-100 d-flex align-items-center justify-content-center"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    <FiInfo className="me-2" />
                    {showCredentials ? 'Hide' : 'Show'} Available Credentials
                  </Button>
                  
                  {showCredentials && (
                    <Card className="mt-3 border-info">
                      <Card.Header className="bg-info text-white d-flex align-items-center">
                        <FiInfo className="me-2" />
                        <span>Available User Credentials</span>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <Table size="sm" className="mb-0">
                          <thead className="bg-light">
                            <tr>
                              <th>Username</th>
                              <th>Password</th>
                              <th>Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {predefinedUsers.map((user, index) => (
                              <tr key={index}>
                                <td><code>{user.username}</code></td>
                                <td><code>{user.password}</code></td>
                                <td>
                                  <span className="badge bg-secondary">{user.role}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  )}
                </div>
                
                <div className="text-center mt-4 pt-3">
                  <small className="text-muted">
                    Use your assigned credentials to access the DT TENDERS system
                  </small>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;