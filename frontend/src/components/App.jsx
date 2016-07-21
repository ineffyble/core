import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducer from '../reducers';

import NewMemberForm from './NewMemberForm.jsx';
import '../stylesheets/style.scss';

const App = () => (
  <div className="container">
    <div id="form" className="form-container">
      <NewMemberForm />
    </div>
  </div>
);
const store = createStore(reducer);
render(
  <Provider store={store}>
    <App />
  </Provider>, document.getElementById('app'));
