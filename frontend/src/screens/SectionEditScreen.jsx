import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getSectionDetails, updateSection } from '../actions/sectionActions';
import { SECTION_UPDATE_RESET } from '../constants/sectionConstants';

const SectionEditScreen = ({ match, history }) => {
  const sectionId = match.params.id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const dispatch = useDispatch();

  const sectionDetails = useSelector((state) => state.sectionDetails);
  const { loading, error, section } = sectionDetails;

  const sectionUpdate = useSelector((state) => state.sectionUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = sectionUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: SECTION_UPDATE_RESET });
      history.push('/admin/sections');
    } else {
      if (!section.name || section.id !== sectionId) {
        dispatch(getSectionDetails(sectionId));
      } else {
        setName(section.name);
        setDescription(section.description);
        setImage(section.image);
      }
    }
  }, [dispatch, history, sectionId, section, successUpdate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateSection({ _id: sectionId, name, description, image }));
  };

  return (
    <Container>
      <Link to='/admin/sections' className='btn btn-light my-3'>
        Go Back
      </Link>
      <h1>Edit Section</h1>
      {loadingUpdate && <p>Loading...</p>}
      {errorUpdate && <p style={{ color: 'red' }}>{errorUpdate}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='name'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='description'>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              placeholder='Enter description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></Form.Control>
          </.Form.Group>

          <Form.Group controlId='image'>
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter image URL'
              value={image}
              onChange={(e) => setImage(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary'>
            Update
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default SectionEditScreen;
