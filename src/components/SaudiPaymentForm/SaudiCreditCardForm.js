import React from 'react';
import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { propTypes } from '../../util/types';

import {
  Heading,
  FieldTextInput,
} from '../index';

import css from './SaudiCreditCardForm.module.css';

/**
 * Saudi Credit Card Form Component
 * Handles credit card input fields for SaudiPaySim integration
 */
const SaudiCreditCardForm = ({ formId, intl }) => {
  return (
    <div className={css.creditCardForm}>
      <Heading as="h3" rootClassName={css.heading}>
        <FormattedMessage id="SaudiCreditCardForm.cardDetailsHeading" />
      </Heading>

      <div className={css.cardFields}>
        <FieldTextInput
          className={css.field}
          type="text"
          id={`${formId}-cardNumber`}
          name="cardNumber"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.cardNumberLabel' })}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
          validate={value => {
            if (!value) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.cardNumberRequired' });
            }
            // Basic card number validation (remove spaces and check length)
            const cleanNumber = value.replace(/\s/g, '');
            if (!/^[0-9]{13,19}$/.test(cleanNumber)) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.cardNumberInvalid' });
            }
          }}
          format={value => {
            // Format card number with spaces every 4 digits
            if (!value) return value;
            const cleaned = value.replace(/\s/g, '');
            const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
            return formatted;
          }}
        />

        <FieldTextInput
          className={css.field}
          type="text"
          id={`${formId}-cardholderName`}
          name="cardholderName"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.cardholderNameLabel' })}
          placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.cardholderNamePlaceholder' })}
          validate={value => {
            if (!value) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.cardholderNameRequired' });
            }
            if (value.length < 2) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.cardholderNameTooShort' });
            }
          }}
        />

        <div className={css.cardExpiryRow}>
          <FieldTextInput
            className={css.expiryField}
            type="text"
            id={`${formId}-expiryMonth`}
            name="expiryMonth"
            label={intl.formatMessage({ id: 'SaudiCreditCardForm.expiryMonthLabel' })}
            placeholder="MM"
            maxLength="2"
            validate={value => {
              if (!value) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.expiryMonthRequired' });
              }
              const month = parseInt(value, 10);
              if (month < 1 || month > 12) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.expiryMonthInvalid' });
              }
            }}
            format={value => {
              // Pad with zero if single digit
              if (value && value.length === 1 && parseInt(value, 10) > 0) {
                return value.padStart(2, '0');
              }
              return value;
            }}
          />

          <FieldTextInput
            className={css.expiryField}
            type="text"
            id={`${formId}-expiryYear`}
            name="expiryYear"
            label={intl.formatMessage({ id: 'SaudiCreditCardForm.expiryYearLabel' })}
            placeholder="YY"
            maxLength="2"
            validate={value => {
              if (!value) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.expiryYearRequired' });
              }
              const currentYear = new Date().getFullYear() % 100;
              const year = parseInt(value, 10);
              if (year < currentYear || year > currentYear + 20) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.expiryYearInvalid' });
              }
            }}
          />

          <FieldTextInput
            className={css.cvcField}
            type="text"
            id={`${formId}-cvc`}
            name="cvc"
            label={intl.formatMessage({ id: 'SaudiCreditCardForm.cvcLabel' })}
            placeholder="123"
            maxLength="4"
            validate={value => {
              if (!value) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.cvcRequired' });
              }
              if (!/^[0-9]{3,4}$/.test(value)) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.cvcInvalid' });
              }
            }}
          />
        </div>
      </div>

      <div className={css.billingDetails}>
        <Heading as="h4" rootClassName={css.subheading}>
          <FormattedMessage id="SaudiCreditCardForm.billingDetailsHeading" />
        </Heading>

        <FieldTextInput
          className={css.field}
          type="text"
          id={`${formId}-name`}
          name="name"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.nameLabel' })}
          placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.namePlaceholder' })}
          validate={value => {
            if (!value) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.nameRequired' });
            }
          }}
        />

        <FieldTextInput
          className={css.field}
          type="email"
          id={`${formId}-email`}
          name="email"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.emailLabel' })}
          placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.emailPlaceholder' })}
          validate={value => {
            if (!value) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.emailRequired' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.emailInvalid' });
            }
          }}
        />

        <FieldTextInput
          className={css.field}
          type="text"
          id={`${formId}-addressLine1`}
          name="addressLine1"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.addressLine1Label' })}
          placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.addressLine1Placeholder' })}
          validate={value => {
            if (!value) {
              return intl.formatMessage({ id: 'SaudiCreditCardForm.addressLine1Required' });
            }
          }}
        />

        <FieldTextInput
          className={css.field}
          type="text"
          id={`${formId}-addressLine2`}
          name="addressLine2"
          label={intl.formatMessage({ id: 'SaudiCreditCardForm.addressLine2Label' })}
          placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.addressLine2Placeholder' })}
        />

        <div className={css.addressRow}>
          <FieldTextInput
            className={css.cityField}
            type="text"
            id={`${formId}-city`}
            name="city"
            label={intl.formatMessage({ id: 'SaudiCreditCardForm.cityLabel' })}
            placeholder={intl.formatMessage({ id: 'SaudiCreditCardForm.cityPlaceholder' })}
            validate={value => {
              if (!value) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.cityRequired' });
              }
            }}
          />

          <FieldTextInput
            className={css.postalField}
            type="text"
            id={`${formId}-postal`}
            name="postal"
            label={intl.formatMessage({ id: 'SaudiCreditCardForm.postalLabel' })}
            placeholder="12345"
            maxLength="10"
            validate={value => {
              if (!value) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.postalRequired' });
              }
              if (!/^[0-9]{5,10}$/.test(value)) {
                return intl.formatMessage({ id: 'SaudiCreditCardForm.postalInvalid' });
              }
            }}
          />
        </div>
      </div>

      <div className={css.securityNote}>
        <FormattedMessage id="SaudiCreditCardForm.securityNote" />
      </div>
    </div>
  );
};

SaudiCreditCardForm.propTypes = {
  formId: propTypes.string.isRequired,
  intl: propTypes.intl.isRequired,
};

export default injectIntl(SaudiCreditCardForm);
