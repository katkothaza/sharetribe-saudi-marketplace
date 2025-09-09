import React, { useState, useEffect } from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, injectIntl } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { 
  getAvailablePaymentMethods, 
  getPaymentMethodById, 
  PAYMENT_TYPES 
} from '../../config/configSaudiPayments';
import { 
  processCreditCardPayment, 
  processStcPayPayment, 
  processTabbyPayment,
  getPaymentErrorMessage,
  formatSaudiAmount,
  convertToSmallestUnit,
  isPaymentMethodAvailable
} from '../../util/saudiPaymentHelpers';

import {
  Heading,
  Form,
  PrimaryButton,
  FieldCheckbox,
  FieldTextInput,
  FieldRadioButton,
  IconSpinner,
} from '../index';

import SaudiCreditCardForm from './SaudiCreditCardForm';
import SaudiStcPayForm from './SaudiStcPayForm';
import SaudiTabbyForm from './SaudiTabbyForm';

import css from './SaudiPaymentForm.module.css';

const initialState = {
  selectedPaymentMethod: null,
  processing: false,
  error: null,
  paymentComplete: false,
};

/**
 * Saudi Payment Form Component
 * Handles credit card, STC Pay, and Tabby payment methods through SaudiPaySim
 */
const SaudiPaymentForm = ({ 
  className,
  rootClassName,
  inProgress,
  onSubmit,
  formId,
  authorDisplayName,
  showInitialMessageInput,
  totalPrice,
  intl,
  ...rest
}) => {
  const [state, setState] = useState(initialState);
  const availablePaymentMethods = getAvailablePaymentMethods();

  // Set default payment method if only one is available
  useEffect(() => {
    if (availablePaymentMethods.length === 1 && !state.selectedPaymentMethod) {
      setState(prev => ({
        ...prev,
        selectedPaymentMethod: availablePaymentMethods[0].id
      }));
    }
  }, [availablePaymentMethods, state.selectedPaymentMethod]);

  const handlePaymentMethodChange = (paymentMethodId) => {
    setState(prev => ({
      ...prev,
      selectedPaymentMethod: paymentMethodId,
      error: null,
    }));
  };

  const processPayment = async (values, paymentMethodId) => {
    const paymentMethod = getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Invalid payment method selected');
    }

    // Convert total price to smallest unit (halalas for SAR)
    const amount = convertToSmallestUnit(parseFloat(totalPrice.replace(/[^\d.]/g, '')));
    const currency = 'SAR'; // Default to SAR for Saudi market

    try {
      let paymentResult;
      
      switch (paymentMethodId) {
        case PAYMENT_TYPES.CREDIT_CARD:
          paymentResult = await processCreditCardPayment({
            amount,
            currency,
            cardDetails: {
              number: values.cardNumber,
              expiry_month: values.expiryMonth,
              expiry_year: values.expiryYear,
              cvc: values.cvc,
              name: values.cardholderName,
            },
            billingDetails: {
              name: values.name || values.cardholderName,
              email: values.email,
              address: {
                line1: values.addressLine1,
                line2: values.addressLine2,
                city: values.city,
                state: values.state,
                postal_code: values.postal,
                country: values.country || 'SA',
              },
            },
            apiKey: paymentMethod.apiKey,
          });
          break;

        case PAYMENT_TYPES.STC_PAY:
          paymentResult = await processStcPayPayment({
            amount,
            currency,
            phone: values.stcPhone,
            billingDetails: {
              name: values.name,
              email: values.email,
            },
            apiKey: paymentMethod.apiKey,
          });
          break;

        case PAYMENT_TYPES.TABBY:
          paymentResult = await processTabbyPayment({
            amount,
            currency,
            customerDetails: {
              name: values.name,
              email: values.email,
              phone: values.phone,
            },
            installmentPlan: values.tabbyInstallments || 4,
            apiKey: paymentMethod.apiKey,
          });
          break;

        default:
          throw new Error('Unsupported payment method');
      }

      return paymentResult;
    } catch (error) {
      const errorMessage = getPaymentErrorMessage(paymentMethodId, error.code || 'generic_error');
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (values) => {
    if (state.processing) return;

    setState(prev => ({ ...prev, processing: true, error: null }));

    try {
      if (!state.selectedPaymentMethod) {
        throw new Error('Please select a payment method');
      }

      const paymentResult = await processPayment(values, state.selectedPaymentMethod);
      
      setState(prev => ({ ...prev, processing: false, paymentComplete: true }));

      // Call parent onSubmit with payment result
      if (onSubmit) {
        onSubmit({
          ...values,
          paymentMethod: state.selectedPaymentMethod,
          paymentResult,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        processing: false,
        error: error.message,
      }));
    }
  };

  const renderPaymentMethodSelector = () => {
    if (availablePaymentMethods.length <= 1) return null;

    return (
      <div className={css.paymentMethodSelector}>
        <Heading as="h3" rootClassName={css.heading}>
          <FormattedMessage id="SaudiPaymentForm.selectPaymentMethod" />
        </Heading>
        
        {availablePaymentMethods.map(method => {
          // Check if payment method is available for this amount
          const totalAmount = parseFloat(totalPrice.replace(/[^\d.]/g, ''));
          const isAvailable = isPaymentMethodAvailable(method.id, totalAmount);
          
          return (
            <div 
              key={method.id} 
              className={classNames(css.paymentMethodOption, {
                [css.paymentMethodDisabled]: !isAvailable
              })}
            >
              <FieldRadioButton
                id={method.id}
                name="paymentMethod"
                value={method.id}
                label={method.name}
                checked={state.selectedPaymentMethod === method.id}
                onChange={() => isAvailable && handlePaymentMethodChange(method.id)}
                disabled={!isAvailable}
              />
              <p className={css.paymentMethodDescription}>
                {method.description}
                {!isAvailable && (
                  <span className={css.unavailableReason}>
                    <FormattedMessage 
                      id="SaudiPaymentForm.paymentMethodUnavailable" 
                      values={{ amount: formatSaudiAmount(convertToSmallestUnit(totalAmount)) }}
                    />
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPaymentForm = () => {
    if (!state.selectedPaymentMethod) return null;

    switch (state.selectedPaymentMethod) {
      case PAYMENT_TYPES.CREDIT_CARD:
        return <SaudiCreditCardForm formId={formId} />;
      case PAYMENT_TYPES.STC_PAY:
        return <SaudiStcPayForm formId={formId} />;
      case PAYMENT_TYPES.TABBY:
        return <SaudiTabbyForm formId={formId} totalPrice={totalPrice} />;
      default:
        return null;
    }
  };

  const paymentForm = (formRenderProps) => {
    const {
      handleSubmit,
      invalid,
      values,
    } = formRenderProps;

    const classes = classNames(rootClassName || css.root, className);
    const submitDisabled = invalid || state.processing || !state.selectedPaymentMethod;

    return (
      <Form className={classes} onSubmit={handleSubmit}>
        {renderPaymentMethodSelector()}
        {renderPaymentForm()}

        {showInitialMessageInput && (
          <div className={css.messageSection}>
            <Heading as="h3" rootClassName={css.heading}>
              <FormattedMessage id="SaudiPaymentForm.messageHeading" />
            </Heading>
            <FieldTextInput
              type="textarea"
              id={`${formId}-message`}
              name="initialMessage"
              label={intl.formatMessage(
                { id: 'SaudiPaymentForm.messageLabel' },
                { name: authorDisplayName }
              )}
              placeholder={intl.formatMessage(
                { id: 'SaudiPaymentForm.messagePlaceholder' },
                { name: authorDisplayName }
              )}
              className={css.message}
            />
          </div>
        )}

        {state.error && (
          <div className={css.errorContainer}>
            <span className={css.errorMessage}>{state.error}</span>
          </div>
        )}

        <div className={css.submitContainer}>
          <PrimaryButton
            className={css.submitButton}
            type="submit"
            inProgress={state.processing}
            disabled={submitDisabled}
          >
            {state.processing ? (
              <FormattedMessage id="SaudiPaymentForm.processing" />
            ) : (
              <FormattedMessage
                id="SaudiPaymentForm.submitPayment"
                values={{ totalPrice }}
              />
            )}
          </PrimaryButton>
          
          <p className={css.paymentInfo}>
            <FormattedMessage
              id="SaudiPaymentForm.securePaymentInfo"
              values={{ name: authorDisplayName }}
            />
          </p>
        </div>
      </Form>
    );
  };

  if (availablePaymentMethods.length === 0) {
    return (
      <div className={css.noPaymentMethods}>
        <FormattedMessage id="SaudiPaymentForm.noPaymentMethodsAvailable" />
      </div>
    );
  }

  return (
    <FinalForm
      onSubmit={handleSubmit}
      initialValues={{
        paymentMethod: state.selectedPaymentMethod,
        country: 'SA', // Default to Saudi Arabia
      }}
      render={paymentForm}
      {...rest}
    />
  );
};

SaudiPaymentForm.defaultProps = {
  className: null,
  rootClassName: null,
  inProgress: false,
  showInitialMessageInput: true,
};

SaudiPaymentForm.propTypes = {
  className: propTypes.string,
  rootClassName: propTypes.string,
  inProgress: propTypes.bool,
  onSubmit: propTypes.func.isRequired,
  formId: propTypes.string.isRequired,
  authorDisplayName: propTypes.string,
  showInitialMessageInput: propTypes.bool,
  totalPrice: propTypes.string.isRequired,
  intl: propTypes.intl.isRequired,
};

export default injectIntl(SaudiPaymentForm);
