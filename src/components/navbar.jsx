/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'gatsby';
import Logo from './logo';

export default function NavBar() {
  return (
    <header className="global-header use-bootstrap">
      <Navbar expand="lg" bg="light" style={{ width: '100%' }}>
        <div className="global-header-content">
          <Navbar.Brand href="/"><Logo /></Navbar.Brand>
          <div style={{ display: 'flex', flex: 1 }}>
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
              <Nav className="global-header-items">
                <NavDropdown title="Play! Championship Series" className="nav-button">
                  <NavDropdown.Item
                    href="/"
                    className="nav-button"
                  >
                    2024 Season
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    href="/play-pokemon-go-championship-series-2023"
                    className="nav-button"
                  >
                    2023 Season
                  </NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="/blog/1" className="nav-button">Blog Posts</Nav.Link>
                <Link
                  to="https://dracoviz.gg"
                  className="tournaments-button"
                  style={{ color: 'white', textDecoration: 'none' }}
                >
                  Tournaments
                </Link>
              </Nav>
            </Navbar.Collapse>
          </div>
        </div>
      </Navbar>
    </header>
  );
}