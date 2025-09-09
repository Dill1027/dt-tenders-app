import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiLock, FiSave, FiUser, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, adminAPI } from '../services/api';
import { PasswordChangeData } from '../types';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userCredentials, setUserCredentials] = useState<Array<{ username: string; password: string; role: string }>>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordChangeData>();

  // Fetch user credentials if user is admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUserCredentials();
    }
  }, [user]);

  const fetchUserCredentials = async () => {
    try {
      setLoadingCredentials(true);
      const credentials = await adminAPI.getUsersCredentials();
      setUserCredentials(credentials);
    } catch (error) {
      console.error('Error fetching user credentials:', error);
      toast.error('Failed to fetch user credentials');
    } finally {
      setLoadingCredentials(false);
    }
  };

  const onSubmit = async (data: PasswordChangeData) => {
    try {
      setLoading(true);
      setSuccess(false);
      
      // Send only the required fields to the API
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Password changed successfully');
      setSuccess(true);
      reset(); // Clear the form
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0"><FiUser className="me-2" />User Profile</h4>
            </Card.Header>
            <Card.Body>
              <div className="user-info mb-4">
                <h5>Account Information</h5>
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Role:</strong> {user?.role.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}</p>
              </div>
              
              <hr />
              
              <div className="password-change-section">
                <h5 className="d-flex align-items-center">
                  <FiLock className="me-2" />
                  Change Password
                </h5>
                
                {success && (
                  <Alert variant="success" className="mt-3">
                    Your password has been changed successfully.
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit(onSubmit)} className="mt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your current password"
                      {...register('currentPassword', { 
                        required: 'Current password is required' 
                      })}
                      isInvalid={!!errors.currentPassword}
                    />
                    {errors.currentPassword && (
                      <Form.Control.Feedback type="invalid">
                        {errors.currentPassword.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your new password"
                      {...register('newPassword', { 
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      isInvalid={!!errors.newPassword}
                    />
                    {errors.newPassword && (
                      <Form.Control.Feedback type="invalid">
                        {errors.newPassword.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your new password"
                      {...register('confirmNewPassword', { 
                        required: 'Please confirm your new password',
                        validate: (value) => 
                          value === watch('newPassword') || 'The passwords do not match'
                      })}
                      isInvalid={!!errors.confirmNewPassword}
                    />
                    {errors.confirmNewPassword && (
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmNewPassword.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                      className="d-flex align-items-center justify-content-center"
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" aria-hidden="true"></div>
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" /> Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </Card.Body>
          </Card>
          
          {/* Admin Only: User Credentials */}
          {user?.role === 'admin' && (
            <Card className="shadow-sm">
              <Card.Header className="bg-info text-white">
                <h4 className="mb-0"><FiUsers className="me-2" />User Credentials (Admin Only)</h4>
              </Card.Header>
              <Card.Body>
                {loadingCredentials ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading user credentials...</p>
                  </div>
                ) : (
                  <>
                    <Alert variant="warning">
                      <strong>Note:</strong> This information is visible only to administrators.
                    </Alert>
                    
                    <Table bordered hover responsive className="mt-3">
                      <thead className="table-light">
                        <tr>
                          <th>Username</th>
                          <th>Password</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userCredentials.map((credential, index) => (
                          <tr key={index}>
                            <td>{credential.username}</td>
                            <td>
                              <code>{credential.password}</code>
                            </td>
                            <td>
                              {credential.role.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
