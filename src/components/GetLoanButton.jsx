import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';

const GetLoanButton = (props) => {
  return (
    <Button variant="contained" color="primary" onClick={props.deposit}>
      Get 100 TUSD Loan
    </Button>
  );
}

GetLoanButton.propTypes = {
  deposit: PropTypes.func
}

export default GetLoanButton;
