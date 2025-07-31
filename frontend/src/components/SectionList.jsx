import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const SectionList = ({ history }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const { data } = await axios.get('/api/admin/secciones');
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };
    fetchSections();
  }, []);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await axios.delete(`/api/admin/secciones/${id}`);
        setSections(sections.filter((section) => section.id !== id));
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const createSectionHandler = () => {
    history.push('/admin/section/create');
  };

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Sections</h1>
        </Col>
        <Col className='text-right'>
          <Button className='my-3' onClick={createSectionHandler}>
            <i className='fas fa-plus'></i> Create Section
          </Button>
        </Col>
      </Row>
      <Table striped bordered hover responsive className='table-sm'>
        <thead>
          <tr>
            <th>ID</th>
            <th>NAME</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <tr key={section.id}>
              <td>{section.id}</td>
              <td>{section.nombre_seccion}</td>
              <td>
                <LinkContainer to={`/admin/section/${section.id}/edit`}>
                  <Button variant='light' className='btn-sm'>
                    <i className='fas fa-edit'></i>
                  </Button>
                </LinkContainer>
                <Button
                  variant='danger'
                  className='btn-sm'
                  onClick={() => deleteHandler(section.id)}
                >
                  <i className='fas fa-trash'></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default SectionList;
