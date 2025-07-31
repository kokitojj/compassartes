import axios from 'axios';
import {
  WELLNESS_ENTRY_CREATE_REQUEST,
  WELLNESS_ENTRY_CREATE_SUCCESS,
  WELLNESS_ENTRY_CREATE_FAIL,
  WELLNESS_ENTRY_LIST_MY_REQUEST,
  WELLNESS_ENTRY_LIST_MY_SUCCESS,
  WELLNESS_ENTRY_LIST_MY_FAIL,
} from '../constants/fisioloadConstants';

export const createWellnessEntry = (entry) => async (dispatch, getState) => {
  try {
    dispatch({ type: WELLNESS_ENTRY_CREATE_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post('/api/fisioload', entry, config);

    dispatch({ type: WELLNESS_ENTRY_CREATE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: WELLNESS_ENTRY_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listMyWellnessEntries = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WELLNESS_ENTRY_LIST_MY_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/fisioload', config);

    dispatch({ type: WELLNESS_ENTRY_LIST_MY_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: WELLNESS_ENTRY_LIST_MY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
