import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import { userLoginReducer, userRegisterReducer } from '@/reducers/userReducers.js';
import { 
    sectionListReducer, 
    sectionDetailsReducer, 
    sectionCreateReducer, 
    sectionUpdateReducer, 
    sectionDeleteReducer 
} from '@/reducers/sectionReducers.js';
import {
    wellnessEntryCreateReducer,
    wellnessEntryListMyReducer,
} from '@/reducers/fisioloadReducers.js';

import { wellnessStatsReducer } from '@/reducers/wellnessStatsReducers.js';

const reducer = combineReducers({
    userLogin: userLoginReducer,
    userRegister: userRegisterReducer,
    sectionList: sectionListReducer,
    sectionDetails: sectionDetailsReducer,
    sectionCreate: sectionCreateReducer,
    sectionUpdate: sectionUpdateReducer,
    sectionDelete: sectionDeleteReducer,
    wellnessEntryCreate: wellnessEntryCreateReducer,
    wellnessEntryListMy: wellnessEntryListMyReducer,
    wellnessStats: wellnessStatsReducer,
});

const userInfoFromStorage =
  typeof window !== 'undefined' && localStorage.getItem('angelbfisio-user')
    ? JSON.parse(localStorage.getItem('angelbfisio-user'))
    : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

// Determinar si estamos en un entorno de desarrollo (ej. en el navegador)
const isDevelopment = typeof window !== 'undefined' && process.env.NODE_ENV !== 'production';

// Usar Redux DevTools solo en desarrollo
const composeEnhancers = isDevelopment && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(applyMiddleware(...middleware))
);

export default store;