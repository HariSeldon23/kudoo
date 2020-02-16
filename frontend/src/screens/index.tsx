import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { Route, Switch, Redirect, withRouter } from 'react-router';
import get from 'lodash/get';
import { ProfileActions, AppActions } from '@client/store/actions';
import URL from '@client/helpers/urls';
import Routes from '@client/screens/routes';
import {
  Product,
  IAvailability,
  LicensePlan,
} from '@client/store/types/security';
import idx from 'idx';
import {
  isFeatureAvailable,
  needsLicenseUpgrade,
} from '@client/helpers/security';
import * as SceneComponents from './LoadableComponents';
import UpgradeComponent from './common/UpgradeComponent';

const paramsOptions = { path: true };

class Screens extends Component<any> {
  public _renderPrivateRoutes() {
    const { actions, profile } = this.props;
    const isLoggedIn = get(this.props, 'profile.isLoggedIn');
    const pathname = this.props.location.pathname;

    const CommonRoutes = idx(Routes, x => x['common']) || [];
    const ManufacturingRoutes =
      idx(Routes, x => x[Product.manufacturing]) || [];
    const ProjectRoutes = idx(Routes, x => x[Product.projects]) || [];
    const HealthRoutes = idx(Routes, x => x[Product.health]) || [];
    const FinanceRoutes = idx(Routes, x => x[Product.finance]) || [];
    const InventoryRoutes = idx(Routes, x => x[Product.inventory]) || [];
    const routes = [
      ...CommonRoutes,
      ...ManufacturingRoutes,
      ...ProjectRoutes,
      ...HealthRoutes,
      ...FinanceRoutes,
      ...InventoryRoutes,
    ];
    return (
      <Switch>
        {!isLoggedIn && (
          <Redirect to={URL.LOGIN(paramsOptions) + `?redirect=${pathname}`} />
        )}
        {/*
         * https://github.com/ReactTraining/react-router/issues/5785
         * We can't use fragment under switch so we are just putting all routes here directly instead of separate components
         */}
        {routes.map(route => {
          const { path, component, ...rest } = route;
          const RouteComponent = component;
          const isAvailable = isFeatureAvailable(
            profile.selectedCompany,
            route.availability as IAvailability[]
          );
          const needsUpgrade = needsLicenseUpgrade(
            profile.selectedCompany,
            route.licenseRequired as LicensePlan[]
          );
          if (!isAvailable) {
            // if feature/route is not available to current selected company and current logged in user
            // then don't render the route
            return null;
          }
          return (
            <Route
              key={path}
              path={path}
              render={props => {
                if (needsUpgrade) {
                  // if user requires upgrade of his license plan then show Upgrade Message
                  return <UpgradeComponent />;
                } else {
                  return (
                    // @ts-ignore
                    <RouteComponent {...rest} actions={actions} {...props} />
                  );
                }
              }}
            />
          );
        })}
      </Switch>
    );
  }

  public render() {
    const { actions } = this.props;
    const isLoggedIn = get(this.props, 'profile.isLoggedIn');
    return (
      <Switch>
        <Route
          exact
          path={URL.HOME(paramsOptions)}
          render={props =>
            isLoggedIn ? (
              <Redirect to={URL.DASHBOARD(paramsOptions)} />
            ) : (
              <Redirect to={URL.LOGIN(paramsOptions)} />
            )
          }
        />
        <Route
          path={URL.LOGIN(paramsOptions)}
          component={SceneComponents.Login}
        />
        <Route
          path={URL.SIGNUP(paramsOptions)}
          component={SceneComponents.Login}
        />
        <Route
          path={URL.CONFIRM_EMAIL(paramsOptions)}
          component={SceneComponents.ConfirmEmail}
        />
        <Route
          path={URL.INVITE_EMAIL(paramsOptions)}
          render={routeProps => (
            <SceneComponents.InviteEmail {...routeProps} actions={actions} />
          )}
        />
        <Route
          path={URL.RESET_PASSWORD(paramsOptions)}
          render={props => (
            <SceneComponents.ForgotPassword {...props} actions={actions} />
          )}
        />
        <Route
          path={URL.RESET_PASSWORD_EMAIL(paramsOptions)}
          render={props => (
            <SceneComponents.ResetPasswordEmail {...props} actions={actions} />
          )}
        />
        <Route
          path={URL.NEW_PASSWORD(paramsOptions)}
          render={props => (
            <SceneComponents.NewPassword {...props} actions={actions} />
          )}
        />
        <Route
          path={URL.WELCOME_EMAIL_PREVIEW(paramsOptions)}
          render={props => <SceneComponents.WelcomeEmailPreview {...props} />}
        />
        <Route
          path={URL.CONFIRM_EMAIL_PREVIEW(paramsOptions)}
          render={props => <SceneComponents.ConfirmEmailPreview {...props} />}
        />
        <Route
          path={URL.REMEMBER_EMAIL_PREVIEW(paramsOptions)}
          render={props => <SceneComponents.RememberEmailPreview {...props} />}
        />
        <Route
          path={URL.INVITE_EMAIL_PREVIEW(paramsOptions)}
          render={props => <SceneComponents.InviteEmailPreview {...props} />}
        />
        {this._renderPrivateRoutes()}
        <Route component={SceneComponents.NotFound} />
      </Switch>
    );
  }
}

export default withRouter<any, any>(
  compose(
    connect(
      (state: any) => ({
        profile: state.profile,
      }),
      dispatch => ({
        actions: bindActionCreators(
          {
            ...ProfileActions,
            ...AppActions,
          },
          dispatch
        ),
      })
    )
  )(Screens)
);
