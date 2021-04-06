import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';

const useStyles = makeStyles({
  table: {
    minWidth: 200,
  },
});

export default function BlockchainMessagesTable(props) {
  const classes = useStyles();

  if (props.blockchainMessages !== undefined && props.blockchainMessages.length > 0){
    return (
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Blockchain Logs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.blockchainMessages.map((message) => (
              <TableRow key={message+Math.random()}>
                <TableCell component="th" scope="row">{message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  return (<div></div>);
}

BlockchainMessagesTable.propTypes = {
  blockchainMessages: PropTypes.array
}
