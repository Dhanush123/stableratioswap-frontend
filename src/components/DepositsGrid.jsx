import * as React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import PropTypes from 'prop-types';
import Utils from '../Utils';

const columns = [
  { field: 'coin', headerName: 'Coin', width: 100 },
  { field: 'depositAmount', headerName: 'Deposit Amount ($)', width: 250 },
];

const ERR_MSG = "No stablecoin deposits on Aave yet!";

export default function DepositsGrid(props) {
  if (props.deposits !== undefined) {
    let transformedData = new Utils(undefined,undefined).convertRawToGridData(props.deposits);
    console.log("props.deposits transformedData",transformedData);
    return (
      transformedData.length > 0 ?
        (
          <div style={{ autoHeight: true, width: '40%' }}>
            <DataGrid rows={transformedData} columns={columns} autoHeight={true} autoPageSize={true} />
          </div>
        )
      : <div>{ERR_MSG}</div>
    );
  }
  return <div>{ERR_MSG}</div>;
}

DepositsGrid.propTypes = {
  deposits: PropTypes.any
}
