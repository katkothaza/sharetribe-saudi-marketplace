import React from 'react';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import {
  Heading,
  FieldTextInput,
} from '../index';

import css from './SaudiStcPayForm.module.css';

/**
 * Saudi STC Pay Form Component
 * Handles STC Pay input fields for SaudiPaySim integration
 */
const SaudiStcPayForm = ({ formId, intl }) => {
  return (
    <div className={css.stcPayForm}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id="SaudiStcPayForm.stcPayHeading" />
      </Heading>

      <FieldTextInput
        className={css.field}
        type="tel"
        id={`${formId}-stcPhone`}
        name="stcPhone"
        label={intl.formatMessage({ id: 'SaudiStcPayForm.phoneLabel' })}
        placeholder="+966 5X XXX XXXX"
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiStcPayForm.phoneRequired' });
          }
          // Basic Saudi phone number validation
          const cleanPhone = value.replace(/\s/g, '');
          if (!/^(\+966|966|05)[0-9]{8,9}$/.test(cleanPhone)) {
            return intl.formatMessage({ id: 'SaudiStcPayForm.phoneInvalid' });
          }
        }}
      />

      <FieldTextInput
        className={css.field}
        type="text"
        id={`${formId}-name`}
        name="name"
        label={intl.formatMessage({ id: 'SaudiStcPayForm.nameLabel' })}
        placeholder={intl.formatMessage({ id: 'SaudiStcPayForm.namePlaceholder' })}
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiStcPayForm.nameRequired' });
          }
        }}
      />

      <FieldTextInput
        className={css.field}
        type="email"
        id={`${formId}-email`}
        name="email"
        label={intl.formatMessage({ id: 'SaudiStcPayForm.emailLabel' })}
        placeholder={intl.formatMessage({ id: 'SaudiStcPayForm.emailPlaceholder' })}
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiStcPayForm.emailRequired' });
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return intl.formatMessage({ id: 'SaudiStcPayForm.emailInvalid' });
          }
        }}
      />

      <div className={css.infoNote}>
        <FormattedMessage id="SaudiStcPayForm.infoNote" />
      </div>
    </div>
  );
};

SaudiStcPayForm.propTypes = {
  formId: propTypes.string.isRequired,
  intl: propTypes.intl.isRequired,
};

export default injectIntl(SaudiStcPayForm);
