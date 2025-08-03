import axios from 'axios';
import {
  SECTION_LIST_REQUEST,
  SECTION_LIST_SUCCESS,
  SECTION_LIST_FAIL,
  SECTION_DETAILS_REQUEST,
  SECTION_DETAILS_SUCCESS,
  SECTION_DETAILS_FAIL,
  SECTION_CREATE_REQUEST,
  SECTION_CREATE_SUCCESS,
  SECTION_CREATE_FAIL,
  SECTION_UPDATE_REQUEST,
  SECTION_UPDATE_SUCCESS,
  SECTION_UPDATE_FAIL,
  SECTION_DELETE_REQUEST,
  SECTION_DELETE_SUCCESS,
  SECTION_DELETE_FAIL,
} from '../constants/sectionConstants';

export const listSections = () => async (dispatch) => {
  try {
    dispatch({ type: SECTION_LIST_REQUEST });

    const { data } = await axios.get('/api/public/all-secciones');

    dispatch({ type: SECTION_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SECTION_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const getSectionDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: SECTION_DETAILS_REQUEST });

    const { data } = await axios.get(`/api/sections/${id}`);

    dispatch({ type: SECTION_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SECTION_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const createSection = (section) => async (dispatch, getState) => {
  try {
    dispatch({ type: SECTION_CREATE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/sections', section, config);

    dispatch({ type: SECTION_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SECTION_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateSection = (section) => async (dispatch, getState) => {
  try {
    dispatch({ type: SECTION_UPDATE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`/api/sections/${section._id}`, section, config);

    dispatch({ type: SECTION_UPDATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: SECTION_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const deleteSection = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: SECTION_DELETE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`/api/sections/${id}`, config);

    dispatch({ type: SECTION_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: SECTION_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
