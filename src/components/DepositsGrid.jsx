import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import PropTypes from 'prop-types';
import Utils from '../Utils';

const columns = [
  { field: 'coin', headerName: 'Coin', width: 130 },
  { field: 'depositAmount', headerName: 'Deposit Amount ($)', width: 130 },
];

export default function DepositsGrid(props) {
  if (props.deposits !== undefined) {
    let transformedData = new Utils(undefined,undefined).convertRawToGridData(props.deposits);
    console.log("props.deposits transformedData",transformedData);
    return (
      props.deposits && transformedData.length > 0 ?
        (
          <div style={{ height: 400, width: '50%' }}>
            <DataGrid rows={transformedData} columns={columns} pageSize={5} />
          </div>
        )
      : <div>No deposits yet!</div>
    );
  }
  return <div>No deposits yet!</div>;
}

DepositsGrid.propTypes = {
  deposits: PropTypes.any
}
