import axios from 'axios';
import {
  WELLNESS_STATS_REQUEST,
  WELLNESS_STATS_SUCCESS,
  WELLNESS_STATS_FAIL,
} from '../constants/wellnessStatsConstants';

export const getWellnessStats = () => async (dispatch, getState) => {
  try {
    dispatch({ type: WELLNESS_STATS_REQUEST });

    const { userLogin: { userInfo } } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get('/api/admin/wellness-entries', config);

    dispatch({ type: WELLNESS_STATS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: WELLNESS_STATS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
