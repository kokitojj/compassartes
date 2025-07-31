import {
  WELLNESS_ENTRY_CREATE_REQUEST,
  WELLNESS_ENTRY_CREATE_SUCCESS,
  WELLNESS_ENTRY_CREATE_FAIL,
  WELLNESS_ENTRY_CREATE_RESET,
  WELLNESS_ENTRY_LIST_MY_REQUEST,
  WELLNESS_ENTRY_LIST_MY_SUCCESS,
  WELLNESS_ENTRY_LIST_MY_FAIL,
  WELLNESS_ENTRY_LIST_MY_RESET,
} from '../constants/fisioloadConstants';

export const wellnessEntryCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case WELLNESS_ENTRY_CREATE_REQUEST:
      return { loading: true };
    case WELLNESS_ENTRY_CREATE_SUCCESS:
      return { loading: false, success: true, entry: action.payload };
    case WELLNESS_ENTRY_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case WELLNESS_ENTRY_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const wellnessEntryListMyReducer = (state = { entries: [] }, action) => {
  switch (action.type) {
    case WELLNESS_ENTRY_LIST_MY_REQUEST:
      return { loading: true };
    case WELLNESS_ENTRY_LIST_MY_SUCCESS:
      return { loading: false, entries: action.payload };
    case WELLNESS_ENTRY_LIST_MY_FAIL:
      return { loading: false, error: action.payload };
    case WELLNESS_ENTRY_LIST_MY_RESET:
      return { entries: [] };
    default:
      return state;
  }
};
