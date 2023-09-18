import React, { useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import Modal from 'react-modal';
import { getRosterHTML, getRosterSearchHTML } from '../utils/profile-roster-utils';
import classNames from 'classnames';
import { Tooltip } from 'react-tooltip';
import { Link } from 'gatsby';
import { linkifyEvent } from '../utils/url-utils';
import useWindowSize from '../utils/use-window-size';
import ProfileImage from '../components/profileimage';

const noDataIndication = "No data found for this player :)";

const parseTm = (tm) => {
  return tm.replaceAll("-", " ")
    .replace(/[a-z][a-z]ic/g, match => match.toUpperCase()) // all **ic
    .replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}

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

function parseDateMMYY(dateString) {
  const [month, year] = dateString.split('/');
  const parsedDate = new Date(`20${year}`, month - 1);
  return parsedDate;
}

function getColumns(width) {
  const isMobile = width < 1200;
  const newColumns = [{
    dataField: 'date',
    text: 'Date',
    sort: true,
    headerStyle: () => ({ width: '60px' }),
    sortFunc: (a, b, order) => {
      if (order === 'desc') {
        return parseDateMMYY(b) - parseDateMMYY(a);
      }
      return parseDateMMYY(a) - parseDateMMYY(b);
    },
  }, {
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

function TournamentRoster({ tmName, showWorldsQualified, playerName, response }) {
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
    const searchTerms = searchInput.toLowerCase().split(/[,&]/).map(term => term.trim());
  
    const filteredData = products.filter((product) => {
      const productSearch = (product && product.search) ? product.search.toLowerCase() : '';
      const productNames = productSearch.split(' ').map(name => name.trim());
      return searchTerms.every((term) =>
        productNames.some((name) => name.includes(term))
      );
    });
    setFilteredProducts(filteredData);
  };
  

  if (response.data.length <= 0 || response.data[0].tournaments === undefined) {
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

  const seasons = [...new Set(response.data[0].tournaments.map((item) => {
    const isMatch = item.tournament.match(/(\d{4})-.*/);
    return isMatch ? isMatch[1] : null;
  }).filter(season => season !== null))];
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]); // Initialize with an empty string

  const handleSeasonChange = (event) => {
    setSelectedSeason(event.target.value);
  };

  const handleClick = (player, matches) => {
    const newProductsMatches = [];
    var player1RosterHtml = getRosterHTML(player);
    var matchesData = parseInt(player.match_wins) + " W - " + parseInt(player.match_losses) + " L (" + (parseInt(player.match_wins) + parseInt(player.match_losses) > 0 ? (100 * parseInt(player.match_wins) / (parseInt(player.match_wins) + parseInt(player.match_losses))) : 0).toFixed(2) + "%)"
    var gamesData = parseInt(player.game_wins) + " W - " + parseInt(player.game_losses) + " L (" + (parseInt(player.game_wins) + parseInt(player.game_losses) > 0 ? (100 * parseInt(player.game_wins) / (parseInt(player.game_wins) + parseInt(player.game_losses))) : 0).toFixed(2) + "%)"
    newProductsMatches.push({
      placement: (
        <label className="pill pill-black">#{parseInt(player.final_rank)}</label>
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
    const sortedMatches = matches.sort((a, b) => a.order - b.order); // Sort matches by match.order


    sortedMatches.forEach((match, index) => {

      // const player1 = match.player1 === player.name ? match.player1 : match.player2;
      const opponent = match.opponent

      const rosterHtml = getRosterHTML(match);

           newProductsMatches.push({
            placement: (
              <div>
                <label>Match {index + 1}</label>
                <br/>
                <div className={classNames("pill", { "pill-green": match.score > match.opponentScore, "pill-red": match.score < match.opponentScore, "pill-accent": match.score === match.opponentScore})}>{parseInt(match.score)} - {parseInt(match.opponentScore)}</div>
              </div>
            ),
            name: (
              <div className="player-item-team-container">
                <label>{opponent}</label>
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
    Modal.setAppElement('#player-list');
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newColumns = getColumns(window.innerWidth);
      setColumns(newColumns);
      setIsLoading(false);
    }, 1);
  }, [width])

  useEffect(() => {
    const newProducts = [];
    response.data[0].tournaments
    .filter((tournament) => tournament.tournament.includes(selectedSeason)) // Filter by selected season
    .forEach((tournament) => {
      const rosterHtml = getRosterHTML(tournament);
      const eventLabel = ` - (${parseTm(tournament.tournament)})`
      newProducts.push({
        placement: (
          <div key={tournament.tournament} className="player-item-placement" value={parseInt(tournament.final_rank)}>
            <div className="pill pill-black">#{parseInt(tournament.final_rank)}</div>
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
                  {tournament.name}{eventLabel}
                </Link>
              ) : (
                <div>{tournament.tournament.replaceAll("-", " ").toLowerCase()
                  .replaceAll(" laic", " LAIC")
                  .replaceAll(" euic", " EUIC")
                  .replaceAll(" naic", " NAIC")
                  .replaceAll(" ocic", " OCIC").substring(5)
                  .split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')}</div>
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
    setFilteredProducts(newProducts)
    setIsLoading(false);
  }, [selectedSeason]); // Listen for changes to selectedSeason


  return (
    <div id="player-list" className="roster-container use-bootstrap use-table">
      <div>
        <select value={selectedSeason} onChange={handleSeasonChange} style={{ fontFamily: 'var(--fontFamily-sans)' }}>
          {seasons.map((season) => (
            <option key={season} value={season}>
              {season} Season
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
      <br/>
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
        columns={columns}
      >
        {(props) => {
          if (isLoading) {
            return <div className="player-table-loading">...Loading</div>;
          }
          return (
            <div>
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
              <ProfileImage className="play-pokemon-image" season={selectedSeason} profile={response.data[0]} />
            </div>
          );
        }}
      </ToolkitProvider>
      <Tooltip id="pokemon-item" style={{ zIndex: 99999 }} />
    </div>
  );

}
export default TournamentRoster;