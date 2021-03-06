import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withI18n } from '@lingui/react';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { compose } from 'react-apollo';
import {
  Button,
  ErrorBoundary,
  LedgerPostingForm,
  SectionHeader,
  withRouterProps,
  withStyles,
  withStylesProps,
  Loading,
  Dropdown,
} from '@kudoo/components';
import URL from '@client/helpers/urls';
import idx from 'idx';
import isEqual from 'lodash/isEqual';
import SelectedCompany from '@client/helpers/SelectedCompany';
import {
  withCreateLedgerPosting,
  withLedgerPosting,
  withMainAccounts,
  withUpdateLedgerPosting,
} from '@kudoo/graphql';
import { showToast } from '@client/helpers/toast';
import styles from './styles';
import { POSTING_TYPES } from './postingTypes';

interface IProps {
  actions: any;
  profile: any;
  mainAccounts: any;
  createLedgerPosting: (data: any) => any;
  updateLedgerPosting: (data: any) => any;
  initialData: any;
  i18n: any;
  history: any;
  classes: any;
  theme: any;
}
interface IState {
  isEditMode: boolean;
  mainAccountsList: any;
}

class CreateNewLedgerPosting extends Component<IProps, IState> {
  public state = {
    isEditMode: false,
    mainAccountsList: [],
  };

  public _submitForm = async (values, actions) => {
    try {
      const { initialData } = this.props;
      const { isEditMode } = this.state;

      const dataToSend = {
        postingType: values.postingType,
        mainAccount: {
          connect: {
            id: values.mainAccount_id,
          },
        },
      };

      if (!isEditMode) {
        const res = await this.props.createLedgerPosting({ data: dataToSend });
        if (res.success) {
          showToast(null, 'Ledger Posting created successfully');
          actions.setSubmitting(false);
          this.props.history.push(URL.LEDGER_POSTINGS());
        } else {
          res.error.map(err => showToast(err));
          actions.setSubmitting(false);
        }
      } else {
        const res = await this.props.updateLedgerPosting({
          data: dataToSend,
          where: { id: initialData.id },
        });
        if (res.success) {
          showToast(null, 'Ledger Posting updated successfully');
          actions.setSubmitting(false);
          this.props.history.push(URL.LEDGER_POSTINGS());
        } else {
          res.error.map(err => showToast(err));
          actions.setSubmitting(false);
        }
      }
    } catch (e) {
      actions.setSubmitting(false);
    }
  };

  public componentDidMount() {
    this.props.actions.updateHeaderTitle('Ledger Posting');
    this.setState({
      isEditMode: Boolean(idx(this.props, _ => _.initialData)),
    });
  }

  public componentDidUpdate(prevProps, prevState) {
    const {
      mainAccounts: { data },
    } = this.props;
    const { mainAccountsList }: any = this.state;
    if (data.length && !isEqual(data, prevProps.mainAccounts.data)) {
      data.forEach((rec: any) => {
        mainAccountsList.push({ value: rec.id, label: rec.name });
      });
      this.setState({ mainAccountsList });
    }
    if (!isEqual(this.props.initialData, prevProps.initialData)) {
      this.setState({
        isEditMode: Boolean(idx(this.props, _ => _.initialData)),
      });
    }
  }

  public _renderSectionHeading() {
    const { isEditMode } = this.state;
    const { classes } = this.props;
    return (
      <SectionHeader
        title={`${isEditMode ? 'Update' : 'Create new'} Ledger Posting`}
        subtitle={`${isEditMode ? 'Update' : 'Create a new'} ledger posting ${
          isEditMode
            ? 'to update information in your account. '
            : 'to add to your account. '
        }`}
        classes={{ component: classes.sectionHeader }}
      />
    );
  }

  public _renderLedgerPostingForm({
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
  }) {
    const keys = {
      postingType: 'postingType',
      mainAccount_id: 'mainAccount_id',
    };
    const labels = {
      postingType: 'Posting Type',
      mainAccount_id: 'Main Account',
    };
    const { classes } = this.props;
    const { mainAccountsList } = this.state;
    return (
      <ErrorBoundary>
        <div className={classes.component}>
          <Grid container spacing={16}>
            <Grid item xs={12}>
              <Dropdown
                label={labels.postingType}
                placeholder={'Select Type'}
                name={keys.postingType}
                id={keys.postingType}
                items={POSTING_TYPES}
                value={values[keys.postingType]}
                onChange={e => setFieldValue(keys.postingType, e.value)}
                onClose={() => setFieldTouched(keys.postingType)}
                error={touched[keys.postingType] && errors[keys.postingType]}
              />
            </Grid>
            <Grid item xs={12}>
              <Dropdown
                label={labels.mainAccount_id}
                placeholder={'Select Type'}
                name={keys.mainAccount_id}
                id={keys.mainAccount_id}
                items={
                  mainAccountsList.length
                    ? mainAccountsList
                    : [
                        {
                          value: '',
                          label:
                            'No account found for this company. Please create Main Account first',
                        },
                      ]
                }
                value={values[keys.mainAccount_id]}
                onChange={e => setFieldValue(keys.mainAccount_id, e.value)}
                onClose={() => setFieldTouched(keys.mainAccount_id)}
                error={
                  touched[keys.mainAccount_id] && errors[keys.mainAccount_id]
                }
              />
            </Grid>
          </Grid>
        </div>
      </ErrorBoundary>
    );
  }

  public _renderForm() {
    const { initialData, classes, theme, mainAccounts } = this.props;
    const { isEditMode } = this.state;
    return (
      <Formik
        initialValues={{
          postingType: idx(initialData, _ => _.postingType) || '',
          mainAccount_id: idx(initialData, _ => _.mainAccount.id) || '',
        }}
        enableReinitialize
        validationSchema={Yup.object().shape({
          postingType: Yup.string().required('Type is required'),
          mainAccount_id: Yup.string().required('Select Main Account'),
        })}
        onSubmit={this._submitForm}>
        {({
          values,
          errors,
          touched,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          setFieldTouched,
          dirty,
        }) => {
          const isFormDirty = dirty;
          return (
            <form className={classes.form} onSubmit={handleSubmit}>
              <Grid container classes={{ container: classes.formFields }}>
                <Grid item xs={12} sm={6}>
                  {!mainAccounts.loading ? (
                    this._renderLedgerPostingForm({
                      values,
                      errors,
                      touched,
                      setFieldValue,
                      setFieldTouched,
                    })
                  ) : (
                    <Loading />
                  )}
                </Grid>
              </Grid>
              <Grid container spacing={0}>
                <Grid item xs={12} sm={isFormDirty ? 6 : 12}>
                  <Button
                    title={
                      isEditMode ? 'Back to Ledger Posting list' : 'Cancel'
                    }
                    onClick={() => {
                      this.props.history.replace(URL.LEDGER_POSTINGS());
                    }}
                    buttonColor={theme.palette.grey['200']}
                    classes={{ text: classes.cancelButtonText }}
                  />
                </Grid>
                {isFormDirty && (
                  <Grid item xs={12} sm={6}>
                    <Button
                      loading={isSubmitting}
                      title={`${
                        isEditMode ? 'Update' : 'Create new'
                      } Ledger Posting`}
                      id='submit-ledgerPosting'
                      buttonColor={theme.palette.primary.color2}
                      type='submit'
                    />
                  </Grid>
                )}
              </Grid>
            </form>
          );
        }}
      </Formik>
    );
  }

  public render() {
    const { classes } = this.props;
    return (
      <ErrorBoundary>
        <SelectedCompany
          onChange={() => {
            this.props.history.push(URL.LEDGER_POSTINGS());
          }}>
          <div className={classes.page}>
            {this._renderSectionHeading()}
            {this._renderForm()}
          </div>
        </SelectedCompany>
      </ErrorBoundary>
    );
  }
}

export default compose(
  withI18n(),
  withCreateLedgerPosting(),
  withUpdateLedgerPosting(),
  withMainAccounts(({ profile, type }) => {
    let isArchived = false;
    if (type === 'archived-mainAccounts') {
      isArchived = true;
    }
    return {
      variables: {
        where: {
          isArchived,
        },
        orderBy: 'name_ASC',
      },
    };
  }),
  withLedgerPosting(
    props => {
      const ledgerPostingId = idx(props, _ => _.match.params.id);
      return {
        id: ledgerPostingId,
      };
    },
    ({ data }) => ({
      initialData: idx(data, _ => _.ledgerPosting) || {},
    })
  ),
  connect((state: any) => ({
    profile: state.profile,
  })),
  withStyles(styles)
)(CreateNewLedgerPosting);
