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
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Modal from 'react-modal';
import { getRosterHTML, getRosterSearchHTML } from '../utils/tournament-roster-utils';
import debounce from "lodash/debounce";
import classNames from 'classnames';

const noDataIndication = "There is no data for this event. Please check back another time! :)";

const parseTm = (tm) => {
  return tm.replace("GO_", "").replace("_", " ");
}

const columnsMatches = [{
  dataField: 'placement',
  text: '',
  sort: true,
  headerStyle: () => ({ width: '120px', textAlign: 'center' }),
}, {
  dataField: 'name',
  text: '',
  headerStyle: () => ({ textAlign: 'center' }),
}];

const customTotal = (from, to, size) => (
  <div className="react-bootstrap-table-pagination-total" style={{ marginTop: 20 }}>
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
  </div>
);

const options = {
  paginationSize: 4,
  pageStartIndex: 1,
  // alwaysShowAllBtns: true, // Always show next and previous button
  // withFirstAndLast: false, // Hide the going to First and Last page button
  // hideSizePerPage: true, // Hide the sizePerPage dropdown always
  // hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
  firstPageText: '<<',
  prePageText: '<',
  nextPageText: '>',
  lastPageText: '>>',
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
const playerDict = {};

function getColumns(width) {
  const isMobile = width < 1200;
  const newColumns = [{
    dataField: 'placement',
    text: 'Placement',
    sort: true,
    headerStyle: () => ({ width: '120px' }),
    sortFunc: (a, b, order) => {
      if (order === 'desc') {
        return b.props.value - a.props.value;
      }
      return a.props.value - b.props.value;
    },
  }, {
    dataField: 'name',
    text: 'Player Teams',
  }, {
    dataField: 'mw',
    text: 'MW',
    sort: true,
    hidden: isMobile,
    headerStyle: () => ({ width: '4.1rem' }),
  }, {
    dataField: 'gw',
    text: 'GW',
    sort: true,
    hidden: isMobile,
    headerStyle: () => ({ width: '3.8rem'  }),
  }, {
    dataField: 'gl',
    text: 'GL',
    sort: true,
    hidden: isMobile,
    headerStyle: () => ({ width: '4rem'  }),
  }];
  return newColumns;
}

function TournamentRoster({ tmName, showWorldsQualified }) {
  const [tm, setTm] = useState('e');
  const [products, setProducts] = useState([
    {
      name: '',
    }]);
  const [productMatches, setProductMatches] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [columns, setColumns] = useState(getColumns(window.innerWidth));
  const [isLoading, setIsLoading] = useState(true);

  const handleClick = (player, matches) => {
    const newProductsMatches = [];
    var player1RosterHtml = getRosterHTML(player);
    var matchesData = player.match_wins + " W - " + player.match_losses + " L (" + (player.match_wins + player.match_losses > 0 ? (100 * player.match_wins / (player.match_wins + player.match_losses)) : 0).toFixed(2) + "%)"
    var gamesData = player.game_wins + " W - " + player.game_losses + " L (" + (player.game_wins + player.game_losses > 0 ? (100 * player.game_wins / (player.game_wins + player.game_losses)) : 0).toFixed(2) + "%)"
    newProductsMatches.push({
      placement: (
        <label className="pill pill-black">#{player.final_rank}</label>
      ),
      name: (
        <section className="player-item-team-container">
          <label>{player.name}</label>
          <div className="player-item-row">{player1RosterHtml}</div>
          <label align="left">Matches: {matchesData}</label>
          <br/>
          <label align="left">Games: {gamesData}</label>
        </section>
      )
    })
    matches.forEach((match, index) => {
      const player1 = match.player1 === player.name ? match.player1 : match.player2;
      const player2 = match.player2 === player.name ? match.player1 : match.player2;
      const player1score = match.player1 === player.name ? match.player1score : match.player2score;
      const player2score = match.player2 === player.name ? match.player1score : match.player2score;
      const rosterHtml = getRosterHTML(playerDict[player2]);

           newProductsMatches.push({
            placement: (
              <div>
                <label>Match {index + 1}</label>
                <br/>
                <div className={classNames("pill", { "pill-green": player1score > player2score, "pill-red": player1score <= player2score })}>{player1score} - {player2score}</div>
              </div>
            ),
            name: (
              <div className="player-item-team-container">
                <label>{player2}</label>
                <div className="player-item-row">{rosterHtml}</div>
              </div>
              )
          })
    });
    setProductMatches(newProductsMatches);
    setIsOpen(true);
  };

  const closeModal = () => {
    setProductMatches([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize() {
      setIsLoading(true);
      setTimeout(() => {
        const newColumns = getColumns(window.innerWidth);
        setColumns(newColumns);
        setIsLoading(false);
      }, 1);
    }, 100);
    window.addEventListener('resize', debouncedHandleResize)
    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)   
    }
  }, [])

  useEffect(() => {
    const host = `${window.location.protocol}//${window.location.host}`;
    setIsLoading(true);
    Promise.all([
      axios.get(`${host}/api/tournament?tm=${tmName}`),
      showWorldsQualified ? axios.get(`${host}/api/matches?tm=${tmName}`) : undefined,
    ])
    .then((response) => {
      const [players, matches] = response;
      if (players == null || players.data.length <= 0) {
        setProducts([]);
        return;
      }
      const playerMatches = {}
      const newProducts = [];
      if (matches != null) {
        matches.data.forEach((match) => {
          playerMatches[match.player1] = playerMatches[match.player1] !== undefined ? playerMatches[match.player1] : [];
          playerMatches[match.player2] = playerMatches[match.player2] !== undefined ? playerMatches[match.player2] : [];
          playerMatches[match.player1].push(match);
          playerMatches[match.player2].push(match);
        });
      }
      players.data.forEach((player) => {
        playerDict[player.name] = player;
        const rosterHtml = getRosterHTML(player);
        const eventLabel = showWorldsQualified ? ` - (${parseTm(player.tournament)})` : ""
        newProducts.push({
          placement: (
            <div className="player-item-placement" value={player.final_rank}>
              <div className="pill pill-black">#{player.final_rank}</div>
              { showWorldsQualified ? null : (
                <button className="player-item-modal-link" onClick={() => handleClick(player, playerMatches[player.name])} type="button">See Games</button>
              )}
            </div>
          ),
          name: (
            <div className="player-item-team-container">
              {player.name}{eventLabel}
              <br />
              <div data-search={getRosterSearchHTML(player)} className="player-item-row">{rosterHtml}</div>
            </div>
          ),
          mw: player.match_wins,
          gw: player.game_wins,
          gl: player.game_losses,
        });
      });
      const playername = players.data[0].final_rank;
      setTm(playername);
      setProducts(newProducts);
      setIsLoading(false);
    })
    .catch(() => {
      setProducts([]);
      setIsLoading(false);
    });
  }, [tm]);

  return (
    <div className="roster-container use-bootstrap use-table">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Matches"
        style={{overlay: {zIndex: 1000}}}
      >
        <div className="matches-container use-bootstrap use-table is-layout-constrained">
          <ToolkitProvider
            bootstrap4
            data={productMatches}
            columns={columnsMatches}
            keyField="ignore"
            search
          >
            {(props) => (
              <div>
                <BootstrapTable
                  {...props.baseProps}
                  noDataIndication={noDataIndication}
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
      {
        isLoading ? 
        (<div className="player-table-loading">...Loading</div>)
        : (
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
              className="player-list-table"
              noDataIndication={noDataIndication}
              striped
              hover
              condensed
              defaultSorted={[{ dataField: 'placement' }]}
              pagination={paginationFactory(options)}
            />
          </div>
        )}
      </ToolkitProvider>
        )
      }
    </div>
  );
}

export default TournamentRoster;
