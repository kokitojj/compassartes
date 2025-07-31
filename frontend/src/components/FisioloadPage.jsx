import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';
import Fisioload from './Fisioload.jsx';

const FisioloadPage = () => {
  return (
    <Provider store={store}>
      <Fisioload />
    </Provider>
  );
};

export default FisioloadPage;