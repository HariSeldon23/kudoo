import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import uuid from 'uuid/v4';
import {
  withStyles,
  withRouterProps,
  withStylesProps,
} from '@kudoo/components';
import Grid from '@material-ui/core/Grid';
import SelectedCompany from '@client/helpers/SelectedCompany';
import styles from './styles';
import Widget from './Widget';

interface IProps {
  actions: any;
  profile: any;
  classes: any;
}
interface IState {
  contentHash: any;
}

class Dashboard extends Component<IProps, IState> {
  public state = {
    contentHash: uuid(), // this is used to refresh all widget when company change from sidebar
  };

  public componentDidMount() {
    this.props.actions.updateHeaderTitle('Dashboard');
  }

  public render() {
    const { classes } = this.props;
    const { contentHash } = this.state;
    return (
      <div>
        <SelectedCompany
          onChange={() => {
            this.setState({
              contentHash: uuid(),
            });
          }}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <div className={classes.page}>
                <Widget type='purchase-order' contentHash={contentHash} />
              </div>
            </Grid>
          </Grid>
        </SelectedCompany>
      </div>
    );
  }
}

export default compose<any, any>(
  withStyles(styles),
  connect((state: any) => ({
    profile: state.profile,
  }))
)(Dashboard);
