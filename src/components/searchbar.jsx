/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';

function SearchBar(props) {
  const { allSuggestions } = props;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    if (inputValue === '') {
      setSuggestions([]);
      return;
    }
    const filteredSuggestions = allSuggestions.filter(
      (suggestion) => suggestion.toLowerCase().includes(inputValue.toLowerCase()),
    ).slice(0, 10);

    setSuggestions(filteredSuggestions);

    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      handleSuggestionClick(filteredSuggestions[0]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);

    window.location.href = `/profile/${suggestion}`;
  };

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <input
        type="text"
        placeholder="Search Players"
        value={query}
        onChange={handleInputChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
          }
        }}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {suggestions.length > 0 && (
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '0',
          width: '100%',
          background: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          zIndex: '1',
        }}
      >
        {suggestions.map((suggestion) => (
          <div
            role="presentation"
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {suggestion}
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default SearchBar;
