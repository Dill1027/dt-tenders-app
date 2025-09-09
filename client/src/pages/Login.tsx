import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiEye, FiEyeOff, FiUser, FiLock, FiInfo, FiArrowRight } from 'react-icons/fi';
import './login.css'; // We'll create this for custom styles

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
                      <button 
                        type="button"
                        className="password-toggle bg-transparent border-0"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                    <div className="d-flex justify-content-end mt-1">
                      <Link to="/forgot-password" className="text-primary text-decoration-none small">
                        Forgot Password?
                      </Link>
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
                        <div className="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
                        Logging in...
                      </>
                    ) : (
                      <>
                        Sign In <FiArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </Form>
                
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