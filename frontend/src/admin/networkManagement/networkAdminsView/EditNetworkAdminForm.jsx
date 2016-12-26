import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { FormValidationErrors } from '../../config/strings';
import { InputField } from '../../common/forms';
import { getSelectedNetworkAdmin, getIsCreating } from './reducers';

import {
  networkAdminUpdateRequested as update,
  networkAdminCreateRequested as create,
  finishEditNetworkAdmin,
} from './actions';

import validate from './networkAdminValidator';

const onSubmit = (data, dispatch) => (
  dispatch(data.id ? update(data) : create(data))
  .then(() => dispatch(finishEditNetworkAdmin()))
);

const required = value => (value ? undefined : FormValidationErrors.password.message);

export const EditNetworkAdminForm = ({ handleSubmit, isCreating, email }) => (
  <form onSubmit={handleSubmit}>
    <section className="form-container">
      <header className="details-header">
        <span className="title">Network Admin details</span>
        <span className="actions">
          <button className="save" type="submit">Save</button>
        </span>
      </header>
      {isCreating ?
        <Field component={InputField} id="email" name="email" label="Email" type="email" />
        : email
      }
      <Field component={InputField} id="name" name="name" label="Name" type="text" />
      <Field component={InputField} id="phoneNumber" name="phoneNumber" label="Contact number" type="text" />
      {!isCreating && <aside>Leave blank to keep existing password</aside>}

      <Field
        component={InputField}
        id="password"
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••••••"
        validate={isCreating && required}
      />
      <Field
        component={InputField}
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
      />
    </section>
  </form>
);

EditNetworkAdminForm.propTypes = {
  handleSubmit: React.PropTypes.func.isRequired,
  email: React.PropTypes.string,
  isCreating: React.PropTypes.bool,
};

const mapStateToProps = state => ({
  initialValues: getIsCreating(state) ? {} : getSelectedNetworkAdmin(state),
  email: getIsCreating(state) ? '' : getSelectedNetworkAdmin(state).email,
  isCreating: getIsCreating(state),
});
export default connect(mapStateToProps)(reduxForm({
  form: 'networkAdmin',
  validate,
  onSubmit,
})(EditNetworkAdminForm));
