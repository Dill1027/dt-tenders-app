import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
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
    <Container>
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">DT TENDERS</h2>
              <h5 className="text-center mb-4 text-muted">Login</h5>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              
              <div className="mt-4">
                <Button 
                  variant="outline-info" 
                  size="sm" 
                  className="w-100 mb-3"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? 'Hide' : 'Show'} Available Credentials
                </Button>
                
                {showCredentials && (
                  <Card className="border-info">
                    <Card.Header className="bg-info text-white">
                      <small>Available User Credentials</small>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <Table size="sm" className="mb-0">
                        <thead>
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
                              <td>{user.role}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  Use your assigned credentials to log in
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
