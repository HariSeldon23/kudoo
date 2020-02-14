import * as React from 'react';
import Grid from '@material-ui/core/Grid';
import { ErrorBoundary, Button } from '@kudoo/components';
import './index.scss';

interface IProps {
  history: any;
}

class ResetPasswordEmail extends React.Component<IProps, {}> {
  public render() {
    return (
      <ErrorBoundary>
        <div className='reset-password-email-page'>
          <div className='title'>Reset your password</div>
          <Grid container justify={'center'}>
            <Grid item xs={12}>
              <div className='middle-container'>
                <img
                  className='mail-sent-icon'
                  src={require('images/message-sent-icon.png')}
                />
                <div className='message-wrapper'>
                  <div className='message-title'>Your email is on it’s way</div>
                  <div className='message-desc'>
                    Check your emails. We have sent you a link to reset your
                    password.
                  </div>
                </div>
                <Button
                  href='/login'
                  classes={{ component: 'submit-btn' }}
                  isDisabled={false}
                  width='100%'
                  title='Back to sign in'
                  applyBorderRadius
                  target='_self'
                />
              </div>
            </Grid>
          </Grid>
        </div>
      </ErrorBoundary>
    );
  }
}

export default ResetPasswordEmail;
