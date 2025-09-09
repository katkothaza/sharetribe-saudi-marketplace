import React from 'react';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import {
  Heading,
  FieldTextInput,
  FieldSelect,
} from '../index';

import css from './SaudiTabbyForm.module.css';

/**
 * Saudi Tabby Form Component  
 * Handles Tabby (Buy Now Pay Later) input fields for SaudiPaySim integration
 */
const SaudiTabbyForm = ({ formId, totalPrice, intl }) => {
  const installmentOptions = [
    { key: '4', label: intl.formatMessage({ id: 'SaudiTabbyForm.installments4' }) },
    { key: '6', label: intl.formatMessage({ id: 'SaudiTabbyForm.installments6' }) },
    { key: '12', label: intl.formatMessage({ id: 'SaudiTabbyForm.installments12' }) },
  ];

  return (
    <div className={css.tabbyForm}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id="SaudiTabbyForm.tabbyHeading" />
      </Heading>

      <div className={css.installmentInfo}>
        <FormattedMessage 
          id="SaudiTabbyForm.installmentDescription" 
          values={{ totalPrice }} 
        />
      </div>

      <FieldSelect
        className={css.field}
        id={`${formId}-tabbyInstallments`}
        name="tabbyInstallments"
        label={intl.formatMessage({ id: 'SaudiTabbyForm.installmentLabel' })}
        options={installmentOptions}
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.installmentRequired' });
          }
        }}
      />

      <FieldTextInput
        className={css.field}
        type="text"
        id={`${formId}-name`}
        name="name"
        label={intl.formatMessage({ id: 'SaudiTabbyForm.nameLabel' })}
        placeholder={intl.formatMessage({ id: 'SaudiTabbyForm.namePlaceholder' })}
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.nameRequired' });
          }
        }}
      />

      <FieldTextInput
        className={css.field}
        type="email"
        id={`${formId}-email`}
        name="email"
        label={intl.formatMessage({ id: 'SaudiTabbyForm.emailLabel' })}
        placeholder={intl.formatMessage({ id: 'SaudiTabbyForm.emailPlaceholder' })}
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.emailRequired' });
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.emailInvalid' });
          }
        }}
      />

      <FieldTextInput
        className={css.field}
        type="tel"
        id={`${formId}-phone`}
        name="phone"
        label={intl.formatMessage({ id: 'SaudiTabbyForm.phoneLabel' })}
        placeholder="+966 5X XXX XXXX"
        validate={value => {
          if (!value) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.phoneRequired' });
          }
          // Basic Saudi phone number validation
          const cleanPhone = value.replace(/\s/g, '');
          if (!/^(\+966|966|05)[0-9]{8,9}$/.test(cleanPhone)) {
            return intl.formatMessage({ id: 'SaudiTabbyForm.phoneInvalid' });
          }
        }}
      />

      <div className={css.termsNote}>
        <FormattedMessage id="SaudiTabbyForm.termsNote" />
      </div>
    </div>
  );
};

SaudiTabbyForm.propTypes = {
  formId: propTypes.string.isRequired,
  totalPrice: propTypes.string.isRequired,
  intl: propTypes.intl.isRequired,
};

export default injectIntl(SaudiTabbyForm);
