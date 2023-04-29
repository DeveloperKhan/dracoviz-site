/* eslint-disable max-len */
/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import parse from 'html-react-parser';
import Modal from 'react-modal';
import { getRosterHTML, getRosterSearchHTML } from '../utils/tournament-roster-utils';

const columns = [{
  dataField: 'placement',
  text: 'Placement',
  sort: true,
  headerStyle: () => ({ width: '100px', textAlign: 'center' }),
  sortFunc: (a, b, order) => {
    if (order === 'desc') {
      return b.props.children[0] - a.props.children[0];
    }
    return a.props.children[0] - b.props.children[0];
  },
}, {
  dataField: 'name',
  text: 'Player Name',
  sort: true,
  headerStyle: () => ({ width: '500px', textAlign: 'center' }),
  sortFunc: (a, b, order) => {
    if (order === 'desc') {
      return (`${b.props.children[0]}`).localeCompare(a.props.children[0]);
    }
    return (`${a.props.children[0]}`).localeCompare(b.props.children[0]);
  },
}, {
  dataField: 'mw',
  text: 'MW',
  sort: true,
  headerStyle: () => ({ width: '50px', textAlign: 'center' }),
}, {
  dataField: 'gw',
  text: 'GW',
  sort: true,
  headerStyle: () => ({ width: '50px', textAlign: 'center' }),
}, {
  dataField: 'gl',
  text: 'GL',
  sort: true,
  headerStyle: () => ({ width: '50px', textAlign: 'center' }),
}, {
  dataField: 'gwr',
  text: 'GWR',
  sort: true,
  headerStyle: () => ({ width: '50px', textAlign: 'center' }),
}];

let productsMatches = [];

const columnsMatches = [{
  dataField: 'placement',
  text: '',
  sort: true,
  headerStyle: () => ({ width: '100px', textAlign: 'center' }),
}, {
  dataField: 'name',
  text: '',
  headerStyle: () => ({ width: '500px', textAlign: 'center' }),
}];

const customTotal = (from, to, size) => (
  <span className="react-bootstrap-table-pagination-total">
    Showing
    {' '}
    { from }
    {' '}
    to
    {' '}
    { to }
    {' '}
    of
    {' '}
    { size }
    {' '}
    Results
  </span>
);

const options = {
  paginationSize: 4,
  pageStartIndex: 1,
  // alwaysShowAllBtns: true, // Always show next and previous button
  // withFirstAndLast: false, // Hide the going to First and Last page button
  // hideSizePerPage: true, // Hide the sizePerPage dropdown always
  // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
  firstPageText: 'First',
  prePageText: 'Back',
  nextPageText: 'Next',
  lastPageText: 'Last',
  nextPageTitle: 'First page',
  prePageTitle: 'Pre page',
  firstPageTitle: 'Next page',
  lastPageTitle: 'Last page',
  showTotal: true,
  paginationTotalRenderer: customTotal,
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
  }], // A numeric array is also available. the purpose of above example is custom the text
};

/**
<SearchBar
                {...props.searchProps}
                style={{ width: "400px", height: "40px" }}
              />
              * */

const playerMatches = {};
const playerDict = {};

function TournamentRoster() {
  const tmName = '2023_GO_Orlando';
  const [tm, setTm] = useState('e');
  const [products, setProducts] = useState([
    {
      name: '',
    }]);
  const [modalIsOpen, setIsOpen] = React.useState(false);

  const handleClick = (player) => {
    const matches = playerMatches[player.name];
    productsMatches = [];
    matches.forEach((match) => {
      // const player1 = match.player1 === player.name ? match.player1 : match.player2;
      const player2 = match.player2 === player.name ? match.player1 : match.player2;
      // const player1score = match.player1 === player.name ? match.player1score : match.player2score;
      // const player2score = match.player2 === player.name ? match.player1score : match.player2score;
      const rosterHtml = parse(getRosterHTML(playerDict[player2]));

      productsMatches.push({
        placement: 1,
        name: (
          <div>
            <a href="/"><b>{player2}</b></a>
            <div className="d-flex flex-row">{rosterHtml}</div>
          </div>
        ),
      });
      // formatString.push('<div style="width: 40%; float: left; height: 100px; text-align: left;"><b>Match ' +
      //  i + ' </b>  ' + '  <button class="btn p-0 btn-' + (player1score >= player2score ? 'success' : 'danger') + ' active" disabled><b>' +
      //   player1score + ' - ' + player2score + '</b></button> </div>' +
      //     ' <div style="margin-left: 10%; width: 50%; height: 100px; text-align: left;"><a><b>' + player2 + '</b></a><div class="d-flex flex-row">' +
      //    getRosterHTML(playerDict[player2]) + "</div></div>")
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    axios.get(`http://24.241.43.229:3001/api/tournament/get?tm=${tmName}`)
      .then((players) => {
        axios.get(`http://24.241.43.229:3001/api/tournament/matches/get?tm=${tmName}`)
          .then((matches) => {
            const newProducts = [];
            matches.data.forEach((match) => {
              playerMatches[match.player1] = playerMatches[match.player1] !== undefined ? playerMatches[match.player1] : [];
              playerMatches[match.player2] = playerMatches[match.player2] !== undefined ? playerMatches[match.player2] : [];
              playerMatches[match.player1].push(match);
              playerMatches[match.player2].push(match);
            });

            players.data.forEach((player) => {
              playerDict[player.name] = player;
              const rosterHtml = parse(getRosterHTML(player));
              newProducts.push({
                placement: (
                  <div>
                    {player.final_rank}
                    <br />
                    <button onClick={() => handleClick(player, playerMatches[player])} type="button">See Games</button>
                  </div>
                ),
                name: (
                  <div>
                    {player.name}
                    <br />
                    <div data-search={getRosterSearchHTML(player)} className="d-flex flex-row">{rosterHtml}</div>
                  </div>
                ),
                mw: player.match_wins,
                gw: player.game_wins,
                gl: player.game_losses,
                gwr: (player.game_losses > 0 ? (player.game_wins / player.game_losses) : 0).toFixed(2),
              });
            });
            const playername = players.data[0].final_rank;
            setTm(playername);
            setProducts(newProducts);
          });
      });
  }, [tm]);

  return (

    <div className="roster-container">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Matches"
      >
        <div className="matches-container">
          <ToolkitProvider
            bootstrap4
            data={productsMatches}
            columns={columnsMatches}
            keyField="ignore"
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
      </Modal>
      <ToolkitProvider
        bootstrap4
        keyField="ignore"
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
              pagination={paginationFactory(options)}
            />
          </div>
        )}
      </ToolkitProvider>
    </div>
  );
}

export default TournamentRoster;
