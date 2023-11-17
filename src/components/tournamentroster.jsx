/* eslint-disable no-mixed-operators */
/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable max-len */
/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import { debounce } from 'lodash';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Modal from 'react-modal';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';
import { Link } from 'gatsby';
import emojione from 'emojione';
import { getRosterHTML, getRosterSearchHTML } from '../utils/roster-utils';
import { linkifyEvent } from '../utils/url-utils';
import useWindowSize from '../utils/use-window-size';
// import 'emojione/assets/sprites/emojione.sprites.css'; // Import the Emojione CSS

const noDataIndication = 'There is no data for this event. Please check back another time! :)';
const noSearchIndication = 'No search data found :)';

const parseTm = (tm) => tm.replaceAll('-', ' ')
  .replace(/[a-z][a-z]ic/g, (match) => match.toUpperCase()) // all **ic
  .replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());

const columnsMatches = [{
  dataField: 'placement',
  text: '',
  sort: true,
  headerStyle: () => ({ width: '90px', textAlign: 'center' }),
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
    headerStyle: () => ({ width: '3.8rem' }),
  }, {
    dataField: 'gl',
    text: 'GL',
    sort: true,
    hidden: isMobile,
    headerStyle: () => ({ width: '4rem' }),
  }];
  return newColumns;
}

function TournamentRoster({
  tmName, showWorldsQualified, playerName, year,
}) {
  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered data

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const filterData = () => {
    if (searchInput === '' || searchInput == null) {
      setFilteredProducts(products); // Set filteredProducts to all products when searchInput is blank
      return;
    }

    // Use a regular expression to split the search input by commas or ampersands and trim spaces
    const searchTerms = searchInput.toLowerCase().split(/[,&]/).map((term) => term.trim());

    const filteredData = products.filter((product) => {
      if (product?.searchName?.toLowerCase().includes(searchInput.toLowerCase())) {
        return true;
      }
      const productSearch = (product && product.search) ? product.search.toLowerCase() : '';
      const productNames = productSearch.split(' ').map((name) => name.trim());
      return searchTerms.every((term) => productNames.some((name) => name.includes(term)));
    });
    setFilteredProducts(filteredData);
  };

  const [tm, setTm] = useState('e');
  const [products, setProducts] = useState([
    {
      name: '',
    }]);
  const { width } = useWindowSize();
  const [productMatches, setProductMatches] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [columns, setColumns] = useState(getColumns(width));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const debounceFunction = debounce(() => {
      filterData();
    }, 500);
    debounceFunction();
  }, [searchInput, products]);

  const handleClick = (player, matches) => {
    const newProductsMatches = [];
    const player1RosterHtml = getRosterHTML(player);
    const matchesData = `${player.match_wins} W - ${player.match_losses} L (${(player.match_wins + player.match_losses > 0 ? (100 * player.match_wins / (player.match_wins + player.match_losses)) : 0).toFixed(2)}%)`;
    const gamesData = `${player.game_wins} W - ${player.game_losses} L (${(player.game_wins + player.game_losses > 0 ? (100 * player.game_wins / (player.game_wins + player.game_losses)) : 0).toFixed(2)}%)`;
    newProductsMatches.push({
      placement: (
        <label className="pill pill-black">
          #
          {player.final_rank}
        </label>
      ),
      name: (
        <section className="player-item-team-container">
          <a href={`/profile/${player.name}`} style={{ textDecoration: 'none' }}>
            {player.name}
            <svg style={{ marginLeft: 10, marginBottom: 2 }} width="7" height="10" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.06001 6.93997C9.34091 7.22122 9.49869 7.60247 9.49869 7.99997C9.49869 8.39747 9.34091 8.77872 9.06001 9.05997L3.40401 14.718C3.12262 14.9992 2.74102 15.1572 2.34316 15.1571C1.9453 15.157 1.56377 14.9989 1.28251 14.7175C1.00125 14.4361 0.84329 14.0545 0.843384 13.6566C0.843478 13.2588 1.00162 12.8772 1.28301 12.596L5.87901 7.99997L1.28301 3.40397C1.00964 3.1212 0.858265 2.74237 0.861496 2.34907C0.864727 1.95577 1.0223 1.57947 1.30028 1.30123C1.57827 1.02298 1.95441 0.865054 2.34771 0.861452C2.741 0.85785 3.11998 1.00887 3.40301 1.28197L9.06101 6.93897L9.06001 6.93997Z" fill="black" />
            </svg>
          </a>
          <div className="player-item-row">{player1RosterHtml}</div>
          <label align="left">
            Matches:
            {' '}
            {matchesData}
          </label>
          <br />
          <label align="left">
            Games:
            {' '}
            {gamesData}
          </label>
        </section>
      ),
    });
    matches.forEach((match, index) => {
      // const player1 = match.player1 === player.name ? match.player1 : match.player2;
      const player2 = match.player2 === player.name ? match.player1 : match.player2;
      const player1score = match.player1 === player.name ? match.player1score : match.player2score;
      const player2score = match.player2 === player.name ? match.player1score : match.player2score;
      const rosterHtml = getRosterHTML(playerDict[player2]);

      newProductsMatches.push({
        placement: (
          <div>
            <label>
              Match
              {' '}
              {index + 1}
            </label>
            <br />
            <div className={classNames('pill', { 'pill-green': player1score > player2score, 'pill-red': player1score < player2score, 'pill-accent': player1score === player2score })}>
              {player1score}
              {' '}
              -
              {' '}
              {player2score}
            </div>
          </div>
        ),
        name: (
          <div className="player-item-team-container">

            <a href={`/profile/${player2}`} style={{ textDecoration: 'none' }}>
              {player2}
              <svg style={{ marginLeft: 10, marginBottom: 2 }} width="7" height="10" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.06001 6.93997C9.34091 7.22122 9.49869 7.60247 9.49869 7.99997C9.49869 8.39747 9.34091 8.77872 9.06001 9.05997L3.40401 14.718C3.12262 14.9992 2.74102 15.1572 2.34316 15.1571C1.9453 15.157 1.56377 14.9989 1.28251 14.7175C1.00125 14.4361 0.84329 14.0545 0.843384 13.6566C0.843478 13.2588 1.00162 12.8772 1.28301 12.596L5.87901 7.99997L1.28301 3.40397C1.00964 3.1212 0.858265 2.74237 0.861496 2.34907C0.864727 1.95577 1.0223 1.57947 1.30028 1.30123C1.57827 1.02298 1.95441 0.865054 2.34771 0.861452C2.741 0.85785 3.11998 1.00887 3.40301 1.28197L9.06101 6.93897L9.06001 6.93997Z" fill="black" />
              </svg>
            </a>
            <div className="player-item-row">{rosterHtml}</div>
          </div>
        ),
      });
    });
    setProductMatches(newProductsMatches);
    setIsOpen(true);
  };

  const closeModal = () => {
    setProductMatches([]);
    setIsOpen(false);
  };

  useEffect(() => {
    Modal.setAppElement('#player-list');
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newColumns = getColumns(width);
      setColumns(newColumns);
      setIsLoading(false);
    }, 1);
  }, [width]);

  useEffect(() => {
    setIsLoading(true);
    const host = `${window.location.protocol}//${window.location.host}`;
    const tmUrl = (
      // eslint-disable-next-line no-nested-ternary
      showWorldsQualified
        ? `${host}/api/tournament?searchType=qualified&year=${year}`
        : (playerName !== undefined
          ? `${host}/api/tournament?searchType=profile&name=${playerName}`
          : `${host}/api/tournament?searchType=tm&tm=${tmName}`));
    Promise.all([
      axios.get(tmUrl, {
        headers: {
          x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
        },
      }),
      !showWorldsQualified ? axios.get(`${host}/api/matches?tm=${tmName}`, {
        headers: {
          x_authorization: `Basic ${process.env.GATSBY_SECRET_KEY}`,
        },
      }) : undefined,
    ])
      .then((response) => {
        const [players, matches] = response;
        if (players == null || players.data.length <= 0) {
          setProducts([]);
          setIsLoading(false);
          return;
        }
        const playerMatches = {};
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
          const eventLabel = ` - (${parseTm(player.tournament)})`;
          
          let countryFlagEmoji = "";

          try {
            let country = player.country.toLowerCase();
            if (country == 'uk') {
              country = 'gb';
            }
            const flag = emojione.toImage(":" + country + ":");
            const div = document.createElement('div');
            div.innerHTML = flag;
  
            // Extract the src attribute from the img element
            const imgElement = div.querySelector('img');
            const altAttribute = imgElement.getAttribute('alt');
            const titleAttribute = imgElement.getAttribute('title');
            const srcAttribute = imgElement.getAttribute('src');
  
            countryFlagEmoji = (
              <img
                className="emojione"
                alt={altAttribute}
                title={titleAttribute}
                src={srcAttribute}
                style={{ width: '32px', height: '32px' }}
              />
            );
          } catch (e) {
            console.log(player.country)
          }

          newProducts.push({
            placement: (
              <div className="player-item-placement" value={player.final_rank}>
                <div className="pill pill-black">
                  #
                  {player.final_rank}
                </div>
                { showWorldsQualified ? null : (
                  <button className="player-item-modal-link" onClick={() => handleClick(player, playerMatches[player.name])} type="button">See Games</button>
                )}
              </div>
            ),
            name: (
              <div className="player-item-team-container">
                {
                showWorldsQualified ? (
                  <Link to={linkifyEvent(player.tournament)}>
                    {player.name}
                    {eventLabel}
                  </Link>
                ) : (
                  <div>
                    <a href={`/profile/${player.name}`} style={{ textDecoration: 'none' }}>
                      {player.name}
                      {"  "}{countryFlagEmoji} 
                      <svg style={{ marginLeft: 10, marginBottom: 2 }} width="7" height="10" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M9.06001 6.93997C9.34091 7.22122 9.49869 7.60247 9.49869 7.99997C9.49869 8.39747 9.34091 8.77872 9.06001 9.05997L3.40401 14.718C3.12262 14.9992 2.74102 15.1572 2.34316 15.1571C1.9453 15.157 1.56377 14.9989 1.28251 14.7175C1.00125 14.4361 0.84329 14.0545 0.843384 13.6566C0.843478 13.2588 1.00162 12.8772 1.28301 12.596L5.87901 7.99997L1.28301 3.40397C1.00964 3.1212 0.858265 2.74237 0.861496 2.34907C0.864727 1.95577 1.0223 1.57947 1.30028 1.30123C1.57827 1.02298 1.95441 0.865054 2.34771 0.861452C2.741 0.85785 3.11998 1.00887 3.40301 1.28197L9.06101 6.93897L9.06001 6.93997Z" fill="black" />
                      </svg>
                    </a>
                  </div>
                )
              }
                <div data-search={getRosterSearchHTML(player)} className="player-item-row">{rosterHtml}</div>
              </div>
            ),
            searchName: player.name,
            search: getRosterSearchHTML(player),
            mw: player.match_wins,
            gw: player.game_wins,
            gl: player.game_losses,
          });
        });
        const playername = players.data[0].final_rank;
        setTm(playername);
        setProducts(newProducts);
        setFilteredProducts(newProducts);
        setIsLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setIsLoading(false);
      });
  }, [tm]);

  return (
    <div id="player-list" className="roster-container use-bootstrap use-table">
      <div>
        <input
          type="text"
          placeholder="Search Pokémon/Player"
          value={searchInput}
          onChange={handleSearchInputChange}
        />
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Matches"
        style={{ overlay: { zIndex: 1000 } }}
      >
        <button onClick={closeModal} className="close-modal-btn" type="button">Close</button>
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
      <ToolkitProvider
        bootstrap4
        keyField="ignore"
        data={filteredProducts}
        columns={columns}
      >
        {
          (props) => {
            if (isLoading) {
              return (<div className="player-table-loading">Loading...</div>);
            }
            return (
              <div>
                <BootstrapTable
                  {...props.baseProps}
                  className="player-list-table"
                  noDataIndication={products.length > 0 ? noSearchIndication : noDataIndication}
                  striped
                  hover
                  condensed
                  defaultSorted={[{ dataField: 'placement' }]}
                  pagination={paginationFactory(options)}
                />
              </div>
            );
          }
        }
      </ToolkitProvider>
      <Tooltip id="pokemon-item" style={{ zIndex: 99999 }} />
    </div>
  );
}

export default TournamentRoster;
