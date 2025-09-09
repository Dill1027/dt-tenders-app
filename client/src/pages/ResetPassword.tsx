import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiUser, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { PasswordResetData } from '../types';

const ResetPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetSuccessful, setResetSuccessful] = useState(false);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm<PasswordResetData>();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordResetData) => {
    try {
      setLoading(true);
      const response = await authAPI.resetPassword({
        username: data.username,
        resetCode: data.resetCode,
        newPassword: data.newPassword
      });
      
      setResetSuccessful(true);
      toast.success(response.message || 'Password reset successful');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please check your details and try again.');
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
              <h4 className="mb-0"><FiLock className="me-2" />Reset Password</h4>
            </Card.Header>
            <Card.Body className="p-4">
              {!resetSuccessful ? (
                <>
                  <p className="text-muted mb-4">
                    Enter your username, reset code, and new password to complete the reset process.
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
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Reset Code</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiFileText />
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="Enter the reset code"
                          {...register('resetCode', { 
                            required: 'Reset code is required' 
                          })}
                          isInvalid={!!errors.resetCode}
                        />
                      </div>
                      {errors.resetCode && (
                        <Form.Text className="text-danger">
                          {errors.resetCode.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiLock />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="Enter new password"
                          {...register('newPassword', { 
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                          isInvalid={!!errors.newPassword}
                        />
                      </div>
                      {errors.newPassword && (
                        <Form.Text className="text-danger">
                          {errors.newPassword.message}
                        </Form.Text>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FiLock />
                        </span>
                        <Form.Control
                          type="password"
                          placeholder="Confirm new password"
                          {...register('confirmNewPassword', { 
                            required: 'Please confirm your password',
                            validate: value => 
                              value === newPassword || 'Passwords do not match'
                          })}
                          isInvalid={!!errors.confirmNewPassword}
                        />
                      </div>
                      {errors.confirmNewPassword && (
                        <Form.Text className="text-danger">
                          {errors.confirmNewPassword.message}
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
                            Resetting Password...
                          </>
                        ) : 'Reset Password'}
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
                  <Alert variant="success" className="mb-4">
                    <h5 className="alert-heading">Password Reset Successful!</h5>
                    <p>
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                  </Alert>
                  
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/login')}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <FiArrowLeft className="me-2" /> Go to Login
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

export default ResetPassword;
