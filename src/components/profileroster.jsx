import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Modal from 'react-modal';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';
import { Link } from 'gatsby';
import { getRosterHTML, getRosterSearchHTML } from '../utils/profile-roster-utils';
import { linkifyEvent } from '../utils/url-utils';
import useWindowSize from '../utils/use-window-size';
import ProfileImage from './profileimage';

const noDataIndication = 'No data found for this player :)';

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

const playerDict = {};

function parseDateDDMMYY(dateString) {
  const [day, month, year] = dateString.split('/');
  const parsedDate = new Date(`20${year}`, month - 1, day);
  return parsedDate;
}

function getColumns(width) {
  const isMobile = width < 1200;
  const newColumns = [{
    dataField: 'date',
    text: 'Date',
    sort: true,
    headerStyle: () => ({ width: '65px' }),
    sortFunc: (a, b, order) => {
      if (order === 'desc') {
        return parseDateDDMMYY(b) - parseDateDDMMYY(a);
      }
      return parseDateDDMMYY(a) - parseDateDDMMYY(b);
    },
  }, {
    dataField: 'placement',
    text: 'Placement',
    sort: true,
    headerStyle: () => ({ width: '115px' }),
    sortFunc: (a, b, order) => {
      if (order === 'desc') {
        return b.props.value - a.props.value;
      }
      return a.props.value - b.props.value;
    },
  }, {
    dataField: 'name',
    text: 'Teams',
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
 tmName, showWorldsQualified, playerName, response,
}) {
  const [searchInput, setSearchInput] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered data

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const filterData = () => {
    if (searchInput === '') {
      setFilteredProducts(products); // Set filteredProducts to all products when searchInput is blank
      return;
    }

    // Use a regular expression to split the search input by commas or ampersands and trim spaces
    const searchTerms = searchInput.toLowerCase().split(/[,&]/).map((term) => term.trim());

    const filteredData = products.filter((product) => {
      const productSearch = (product && product.search) ? product.search.toLowerCase() : '';
      const productNames = productSearch.split(' ').map((name) => name.trim());
      return searchTerms.every((term) => productNames.some((name) => name.includes(term)));
    });
    setFilteredProducts(filteredData);
  };

  if (response == null || response?.tournaments == null) {
    return null; // Return early if there's no data
  }

  const [tm, setTm] = useState('e');
  const [products, setProducts] = useState([
    {
      name: '',
    }]);
  const [productMatches, setProductMatches] = useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [columns, setColumns] = useState(getColumns(window.innerWidth));
  const [isLoading, setIsLoading] = useState(true);
  const { width } = useWindowSize();

  useEffect(() => {
    filterData();
  }, [searchInput, products]);

  const seasons = [...new Set(response.tournaments.map((item) => {
    const isMatch = item.tournament.match(/(\d{4})-.*/);
    return isMatch ? isMatch[1] : null;
  }).filter((season) => season !== null))];
  seasons.sort((a, b) => {
    const seasonA = a.substring(0, 4);
    const seasonB = b.substring(0, 4);
    return seasonA.localeCompare(seasonB);
  });
  seasons.push('All');
  seasons.reverse();
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]); // Initialize with an empty string

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
  };

  const handleClick = (player, matches) => {
    const newProductsMatches = [];
    const player1RosterHtml = getRosterHTML(player);
    const matchesData = `${parseInt(player.match_wins)} W - ${parseInt(player.match_losses)} L (${(parseInt(player.match_wins) + parseInt(player.match_losses) > 0 ? (100 * parseInt(player.match_wins) / (parseInt(player.match_wins) + parseInt(player.match_losses))) : 0).toFixed(2)}%)`;
    const gamesData = `${parseInt(player.game_wins)} W - ${parseInt(player.game_losses)} L (${(parseInt(player.game_wins) + parseInt(player.game_losses) > 0 ? (100 * parseInt(player.game_wins) / (parseInt(player.game_wins) + parseInt(player.game_losses))) : 0).toFixed(2)}%)`;
    newProductsMatches.push({
      placement: (
        <label className="pill pill-black">
          #
          {parseInt(player.final_rank)}
        </label>
      ),
      name: (
        <section className="player-item-team-container">
          <label>{player.name}</label>
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
    const sortedMatches = matches.sort((a, b) => a.order - b.order); // Sort matches by match.order

    sortedMatches.forEach((match, index) => {
      // const player1 = match.player1 === player.name ? match.player1 : match.player2;
      const { opponent } = match;

      const rosterHtml = getRosterHTML(match);

           newProductsMatches.push({
            placement: (
              <div>
                <label>
                  Match
                  {' '}
                  {index + 1}
                </label>
                <br />
                <div className={classNames('pill', { 'pill-green': match.score > match.opponentScore, 'pill-red': match.score < match.opponentScore, 'pill-accent': match.score === match.opponentScore })}>
                  {parseInt(match.score)}
                  {' '}
                  -
                  {' '}
                  {parseInt(match.opponentScore)}
                </div>
              </div>
            ),
            name: (
              <div className="player-item-team-container">
                <Link to={`/profile/${opponent}`} onClick={() => redirect(`/profile/${opponent}`)} style={{ textDecoration: 'none' }}>
                  {opponent}
                  <svg style={{ marginLeft: 10, marginBottom: 2 }} width="7" height="10" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M9.06001 6.93997C9.34091 7.22122 9.49869 7.60247 9.49869 7.99997C9.49869 8.39747 9.34091 8.77872 9.06001 9.05997L3.40401 14.718C3.12262 14.9992 2.74102 15.1572 2.34316 15.1571C1.9453 15.157 1.56377 14.9989 1.28251 14.7175C1.00125 14.4361 0.84329 14.0545 0.843384 13.6566C0.843478 13.2588 1.00162 12.8772 1.28301 12.596L5.87901 7.99997L1.28301 3.40397C1.00964 3.1212 0.858265 2.74237 0.861496 2.34907C0.864727 1.95577 1.0223 1.57947 1.30028 1.30123C1.57827 1.02298 1.95441 0.865054 2.34771 0.861452C2.741 0.85785 3.11998 1.00887 3.40301 1.28197L9.06101 6.93897L9.06001 6.93997Z" fill="black" />
                  </svg>
                </Link>
                <div className="player-item-row">{rosterHtml}</div>
              </div>
              ),
          });
    });
    setProductMatches(newProductsMatches);
    setIsOpen(true);
  };

  const redirect = (url) => {
    window.location.href = url;
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
      const newColumns = getColumns(window.innerWidth);
      setColumns(newColumns);
      setIsLoading(false);
    }, 1);
  }, [width]);

  useEffect(() => {
    const newProducts = [];
    response.tournaments
    .filter((tournament) => (selectedSeason == 'All' || tournament.tournament.includes(selectedSeason))) // Filter by selected season
    .forEach((tournament) => {
      const rosterHtml = getRosterHTML(tournament);
      const eventLabel = ` - (${parseTm(tournament.tournament)})`;
      newProducts.push({
        placement: (
          <div key={tournament.tournament} className="player-item-placement" value={parseInt(tournament.final_rank)}>
            <div className="pill pill-black">
              #
              {parseInt(tournament.final_rank)}
            </div>
            { showWorldsQualified ? null : (
              <button className="player-item-modal-link" onClick={() => handleClick(tournament, tournament.matches)} type="button">See Games</button>
            )}
          </div>
        ),
        name: (
          <div key={tournament.tournament} className="player-item-team-container">
            {
              showWorldsQualified ? (
                <Link to={linkifyEvent(tournament.tournament)}>
                  {tournament.name}
                  {eventLabel}
                </Link>
              ) : (
                <div>
                  <a href={`/${tournament.tournament}`} style={{ textDecoration: 'none' }}>
                    {tournament.tournament.replaceAll('-', ' ').toLowerCase()
                      .replaceAll(' laic', ' LAIC')
                      .replaceAll(' euic', ' EUIC')
                      .replaceAll(' naic', ' NAIC')
                      .replaceAll(' ocic', ' OCIC')
                      .substring(selectedSeason.includes('All') ? 0 : 5)
                                        .split(' ')
                      .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                      .join(' ')}
                    <svg style={{ marginLeft: 10, marginBottom: 2 }} width="7" height="10" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M9.06001 6.93997C9.34091 7.22122 9.49869 7.60247 9.49869 7.99997C9.49869 8.39747 9.34091 8.77872 9.06001 9.05997L3.40401 14.718C3.12262 14.9992 2.74102 15.1572 2.34316 15.1571C1.9453 15.157 1.56377 14.9989 1.28251 14.7175C1.00125 14.4361 0.84329 14.0545 0.843384 13.6566C0.843478 13.2588 1.00162 12.8772 1.28301 12.596L5.87901 7.99997L1.28301 3.40397C1.00964 3.1212 0.858265 2.74237 0.861496 2.34907C0.864727 1.95577 1.0223 1.57947 1.30028 1.30123C1.57827 1.02298 1.95441 0.865054 2.34771 0.861452C2.741 0.85785 3.11998 1.00887 3.40301 1.28197L9.06101 6.93897L9.06001 6.93997Z" fill="black" />
                    </svg>
                  </a>
                </div>
              )
            }
            <div data-search={getRosterSearchHTML(tournament)} className="player-item-row">{rosterHtml}</div>
          </div>
        ),
        search: getRosterSearchHTML(tournament),
        date: tournament.date,
        mw: parseInt(tournament.match_wins),
        gw: parseInt(tournament.game_wins),
        gl: parseInt(tournament.game_losses),
      });
    });
    setTm(playerName);
    setProducts(newProducts);
    setFilteredProducts(newProducts);
    setIsLoading(false);
  }, [selectedSeason]); // Listen for changes to selectedSeason

  return (
    <div id="player-list" className="roster-container use-bootstrap use-table">
      <div>
        <select value={selectedSeason} onChange={handleSeasonChange} style={{ fontFamily: 'var(--fontFamily-sans)' }}>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season}
              {' '}
              Season{season.includes('All') ? 's' : ''}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search Pokémon"
          value={searchInput}
          onChange={handleSearchInputChange}
          style={{ marginLeft: '30px' }}
        />
      </div>
      <br />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Matches"
        style={{ overlay: { zIndex: 1000 } }}
      >
        <button onClick={closeModal} className="close-modal-btn">
          Close
        </button>
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
                  defaultSorted={[{ dataField: 'date', order: 'desc' }]}
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
        columns={columns.map((col) => {
          if (col.dataField === 'date') {
            return {
              ...col,
              formatter: (cell) => {
                // Format the date as "MM/YY" for display
                const date = parseDateDDMMYY(cell);
                const mm = date.getMonth() + 1;
                const yy = date.getFullYear() % 100;
                return `${mm.toString().padStart(2, '0')}/${yy.toString().padStart(2, '0')}`;
              },
            };
          }
          return col;
        })}
      >
        {(props) => {
          if (isLoading) {
            return <div className="player-table-loading">...Loading</div>;
          }
          return (
            <div style={{overflowX: 'hidden'}}>
              <BootstrapTable
                {...props.baseProps}
                className="player-list-table"
                noDataIndication={noDataIndication}
                striped
                hover
                condensed
                defaultSorted={[{ dataField: 'date', order: 'desc' }]}
                pagination={paginationFactory(options)}
              />

              <ProfileImage className="play-pokemon-image" seasons={seasons} profile={response} />
            </div>
          );
        }}
      </ToolkitProvider>
      <Tooltip id="pokemon-item" style={{ zIndex: 99999 }} />
    </div>
  );
}
export default TournamentRoster;
