import React from 'react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';

const GenericButton = (props) => {
  return (
    <Box display="flex" justifyContent="space-between" m={1}>
      <Button variant="contained" color="primary" size="medium" onClick={props.onClick}>
        {props.label}
      </Button>
    </Box>
  );
}

GenericButton.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string
}

export default GenericButton;
