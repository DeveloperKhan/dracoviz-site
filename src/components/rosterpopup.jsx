/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';

const products = [];

const columns = [{
  dataField: 'placement',
  text: '',
  sort: true,
  headerStyle: () => ({ width: '100px', textAlign: 'center' }),
}, {
  dataField: 'name',
  text: '',
  headerStyle: () => ({ width: '500px', textAlign: 'center' }),
}];

function RosterPopup() {
  return (

    <div className="roster-container">
      <ToolkitProvider
        bootstrap4
        keyField="name"
        data={products}
        columns={columns}
        search
      >
        {(props) => (
          <div>
            <BootstrapTable
              {...props.baseProps}
              noDataIndication="Nothing found :("
              striped
              hover
              condensed
              defaultSorted={[{ dataField: 'placement' }]}
            />
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
}

export default RosterPopup;
