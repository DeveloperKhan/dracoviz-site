import React, { useCallback } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import { Link } from 'gatsby';
import countryCodeToFlagEmoji from '../utils/country-code-to-flag';

const options = {
  paginationSize: 4,
  pageStartIndex: 1,
  firstPageText: '<<',
  prePageText: '<',
  nextPageText: '>',
  lastPageText: '>>',
  nextPageTitle: 'First page',
  prePageTitle: 'Pre page',
  firstPageTitle: 'Next page',
  lastPageTitle: 'Last page',
  showTotal: true,
  disablePageTitle: true,
  sizePerPageList: [{
    text: '10', value: 10,
  }, {
    text: '25', value: 25,
  }, {
    text: '50', value: 50,
  }, {
    text: '100', value: 100,
  }, {
    text: 'All', value: 1000,
  }],
};

const rowStyle = {
  wordBreak: 'break-all',
};

const staticKeys = ['Name', 'Country', 'Region', 'Date', 'Event', 'Teams'];

function parseData(data) {
  const [head, ...body] = data.split(/\r?\n/g);
  const keys = head.split(',');
  const headers = keys.filter((h) => staticKeys.includes(h));
  const columns = headers.map((h) => ({
    dataField: h,
    text: h,
    headerStyle: () => ({ textAlign: 'center' }),
    sort: true,
  }));
  const content = body.map((c) => {
    const [name, champion, country, region, date, event, teams] = c.split(',');
    const rowObj = {
      [staticKeys[0]]: (
        <Link to={`/profile/${name}`}>
          {name}
          {champion?.toLowerCase() === 'true' ? ' 🏆' : ''}
        </Link>
      ),
      [staticKeys[1]]: `${countryCodeToFlagEmoji(country)} ${country}`,
      [staticKeys[2]]: region,
      [staticKeys[3]]: date,
      [staticKeys[4]]: event,
      [staticKeys[5]]: teams,
    };
    return rowObj;
  });
  return {
    columns,
    content,
  };
}

function QualTable({ data }) {
  const getData = useCallback(() => parseData(data), [data]);
  const { columns, content } = getData();

  return (
    <div className="use-bootstrap use-table">
      <ToolkitProvider
        bootstrap4
        data={content}
        columns={columns}
        keyField="ignore"
      >
        {(props) => (
          <BootstrapTable
            {...props.baseProps}
            className="player-list-table"
            noDataIndication="No data"
            striped
            hover
            condensed
            pagination={paginationFactory(options)}
            rowStyle={rowStyle}
          />
        )}
      </ToolkitProvider>
    </div>
  );
}

export default QualTable;
