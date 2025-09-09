import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiUser, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { PasswordResetRequestData } from '../types';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordResetRequestData>();

  const onSubmit = async (data: PasswordResetRequestData) => {
    try {
      setLoading(true);
      const response = await authAPI.forgotPassword(data.username);
      
      // In development, we'll get the reset code directly
      if (response.resetCode) {
        setResetCode(response.resetCode);
      }
      
      setResetRequested(true);
      toast.success(response.message || 'Password reset requested successfully');
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to request password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0"><FiLock className="me-2" />Forgot Password</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {!resetRequested ? (
                <>
                  <p className="text-muted mb-4">
                    Enter your username and we'll send you a code to reset your password.
                  </p>
                  
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiUser />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Enter your username"
                          {...register('username', { 
                            required: 'Username is required' 
                          })}
                          isInvalid={!!errors.username}
                        />
                      </div>
                      {errors.username && (
                        <Form.Text className="text-danger">
                          {errors.username.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <div className="d-grid gap-2">
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
                            Requesting Reset...
                          </>
                        ) : 'Request Password Reset'}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => navigate('/login')}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FiArrowLeft className="me-2" /> Back to Login
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <Alert variant="success" className="mb-3">
                    <h5 className="alert-heading">Reset Code Sent!</h5>
                    <p>
                      If an account exists with the username you provided, a password reset code has been sent.
                    </p>
                    {resetCode && (
                      <Alert variant="info" className="mt-3 mb-0">
                        <strong>Development Mode:</strong> Your reset code is: <code>{resetCode}</code>
                      </Alert>
                    )}
                  </Alert>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/reset-password')}
                    >
                      Continue to Reset Password
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate('/login')}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <FiArrowLeft className="me-2" /> Back to Login
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
