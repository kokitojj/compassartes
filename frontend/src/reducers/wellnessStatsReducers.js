import {
  WELLNESS_STATS_REQUEST,
  WELLNESS_STATS_SUCCESS,
  WELLNESS_STATS_FAIL,
} from '../constants/wellnessStatsConstants';

export const wellnessStatsReducer = (state = { stats: [] }, action) => {
  switch (action.type) {
    case WELLNESS_STATS_REQUEST:
      return { loading: true, stats: [] };
    case WELLNESS_STATS_SUCCESS:
      return { loading: false, stats: action.payload };
    case WELLNESS_STATS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};
