import React, { useState, useEffect } from 'react';
import iconsDb from './iconsDb';

function Social({ links, buttonStyle, iconStyle, openNewTab }) {
  const buttonDefaultStyle = {
    display: 'inline-block',
    position: 'relative',
    width: '50px',
    height: '50px',
  };

  const defaultStyleContainer = {
    width: 'fit-content',
  };

  if (openNewTab) openNewTab = '_blank';

  const finalButtonStyle = Object.assign(buttonDefaultStyle, buttonStyle);

  const [buttonStyleState, setButtonStyleState] = useState(finalButtonStyle);

  useEffect(() => {
    setButtonStyleState(finalButtonStyle);
  }, [links, buttonStyle, iconStyle]);

  return (
    <div className="social" style={defaultStyleContainer}>
      {links.map(link => {
        let extractedDomain = returnDomainUrl(link);
        if (iconsDb[extractedDomain]) {
          return (
            <a href={link} target={openNewTab} style={buttonStyleState}>
              <svg viewBox="0 0 64 64" style={iconStyle}>
                <g fill={iconStyle.color}>
                  <path d={iconsDb[extractedDomain].icon}></path>
                </g>
              </svg>
            </a>
          );
        }
      })}
    </div>
  );
}

function returnDomainUrl(url) {
  const domains = Object.keys(iconsDb);

  const finalRegex = new RegExp(/^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9]*)/);
  let extractedDomain = url.match(finalRegex)[1];

  return domains.includes(extractedDomain) ? extractedDomain : null;
}

export default Social;
