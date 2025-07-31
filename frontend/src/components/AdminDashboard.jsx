import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';

import WellnessStats from './WellnessStats';

const AdminDashboard = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1 className="my-3">Admin Dashboard</h1>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <Card.Text>
                Manage all users in the system.
              </Card.Text>
              <Link to="/admin/users" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">Go to Users</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Sections</Card.Title>
              <Card.Text>
                Manage all sections in the system.
              </Card.Text>
              <Link to="/admin/sections" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">Go to Sections</Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <WellnessStats />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
