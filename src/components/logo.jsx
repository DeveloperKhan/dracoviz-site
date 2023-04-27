import React from 'react';
import DracovizLogo from '../../content/assets/dracoviz_logo.svg';

function Logo({ style }) {
  return (
    <div className="logo-wrapper" style={style}>
      <img src={DracovizLogo} alt="Dracoviz Logo" className="logo" />
    </div>
  );
}

export default Logo;
