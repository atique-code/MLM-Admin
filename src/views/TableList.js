import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Spinner,
  Alert
} from "react-bootstrap";
import { ref, onValue, update } from "firebase/database";
import { database } from "../components/firebaseConfig";
// import { database } from "../../firebaseConfig";
// import { database } from "../../FirebaseConfig";
// import { auth } from "../../FirebaseConfig";

const TableList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verificationInputs, setVerificationInputs] = useState({});

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = () => {
      try {
        const usersRef = ref(database, 'users');
        
        onValue(usersRef, (snapshot) => {
          const usersData = snapshot.val();
          const usersList = [];
          
          for (const uid in usersData) {
            const user = usersData[uid];
            usersList.push({
              uid,
              name: user.name || 'N/A',
              mobileNumber: user.mobileNumber,
              tid: user.tid?.tid || 'N/A',
              tidStatus: user.tid?.status || 'pending',
              verificationStatus: user.tid?.verified || false,
              registrationDate: new Date(user.createdAt).toLocaleDateString()
            });
          }
          
          setUsers(usersList);
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle TID verification
  const handleVerifyTID = async (uid, adminTID) => {
    try {
      const userRef = ref(database, `users/${uid}/tid`);
      
      await update(userRef, {
        adminTID,
        verified: adminTID === users.find(u => u.uid === uid)?.tid,
        lastVerified: Date.now()
      });
      
      setVerificationInputs(prev => ({...prev, [uid]: ''}));
    } catch (err) {
      setError("Verification failed");
    }
  };

  // Handle status change
  const handleStatusChange = async (uid, newStatus) => {
    try {
      const userRef = ref(database, `users/${uid}/tid`);
      await update(userRef, { status: newStatus }); // ✅ fix
    } catch (err) {
      setError("Status update failed");
    }
  };



  // Status badge component
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="warning" text="dark">Pending</Badge>;
    }
  };

  // Verification status component
  const VerificationStatus = ({ verified }) => (
    verified ? 
    <span className="text-success">✅ Verified</span> : 
    <span className="text-danger">❌ Not Verified</span>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xl="10">
          <Card className="shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 text-primary">User Verification Dashboard</h5>
              <small className="text-muted">Real-time TID Verification System</small>
            </Card.Header>

            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>User ID</th>
                    <th>Mobile Number</th>
                    <th>TID</th>
                    <th>Verification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="align-middle">
                        <small className="text-muted">#{user.uid.slice(0, 8)}</small>
                      </td>
                      <td className="align-middle">{user.mobileNumber}</td>
                      <td className="align-middle">
                        <code>{user.tid}</code>
                      </td>
                      <td className="align-middle">
                        <VerificationStatus verified={user.verificationStatus} />
                      </td>
                      <td className="align-middle">
                        <StatusBadge status={user.tidStatus} />
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="text"
                            placeholder="Enter TID to verify"
                            value={verificationInputs[user.uid] || ''}
                            onChange={(e) => setVerificationInputs(prev => ({
                              ...prev,
                              [user.uid]: e.target.value
                            }))}
                            size="sm"
                            style={{ width: '150px' }}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleVerifyTID(user.uid, verificationInputs[user.uid])}
                          >
                            Verify
                          </Button>
                          <Form.Select
                            value={user.tidStatus}
                            onChange={(e) => handleStatusChange(user.uid, e.target.value)}
                            size="sm"
                            style={{ width: '120px' }}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                          </Form.Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>

            <Card.Footer className="bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Total Users: {users.length}
                </small>
                <small className="text-muted">
                  Real-time Database Updates
                </small>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// Firebase Security Rules (Add in Firebase Console)
/*
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.token.isAdmin",
        ".write": "auth != null && auth.token.isAdmin",
        "tid": {
          ".validate": "newData.hasChildren(['tid', 'status', 'verified'])"
        }
      }
    }
  }
}
*/

export default TableList;