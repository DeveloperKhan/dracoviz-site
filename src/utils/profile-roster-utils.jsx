import React from 'react';
import BestBuddy from '../../content/assets/buddy_icon.png';
import Purified from '../../content/assets/purified_icon.png';
import Shadow from '../../content/assets/shadow_icon.png';
import pokemonJson from '../../static/pokemon.json';

function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export function getPokemonURLName(pokemon) {
  let pokemonName = pokemon.name.toLowerCase()
      .replace(' ', '-')
      .replace('.', '')
      .replace('&#39;', '')
      .replace("-", "_"); // `
    let formString = '';
    // default image is too big
    if (pokemonName === 'spinda') {
      pokemonName = 'spinda_01';
    } else if (pokemonName === 'meowstic') {
      pokemonName = 'meowstic_male';
    } else if (pokemonName === 'tapufini') {
      pokemonName = 'tapu_fini';
    }
    if (pokemon.form !== '') {
      if (pokemon.name === 'Pikachu') { // yes, people have ran this lol
        if (pokemon.form === '[Pikachu Vs 2019*]') {
          pokemonName = 'pikachu_libre';
        } else if (pokemon.form === '[Pikachu Costume 2020*]') {
          pokemonName = 'pikachu_balloon4';
        } else if (pokemon.form === '[Pikachu Flying 5Th Anniv*]') {
          pokemonName = 'pikachu_balloon5';
        } else if (pokemon.form === '[Pikachu Flying Okinawa*]') {
          pokemonName = 'pikachu_okinawa-balloon';
        } else if (pokemon.form === '[Pikachu Kariyushi*]') {
          pokemonName = 'pikachu_kariyushi';
        } else if (pokemon.form === '[Pikachu Pop star*]') {
          pokemonName = 'pikachu_popstar';
        } else if (pokemon.form === '[Pikachu Rock Star*]') {
          pokemonName = 'pikachu_rockstar';
        }
      } else if (pokemon.name === 'Castform') {
        formString = `-${pokemon.form.toLowerCase().split(' ')[1].split(']')[0].replace('*', '')}`;
      } else if (pokemon.name === 'Mr. Mime') {
        if (pokemon.form.includes('galar')) {
          formString = '_galarian';
        }
      } else if (pokemon.form.includes(' ')) {
        const split = pokemon.form.toLowerCase().split('[');
        formString = `_${split[split.length - 1].split('form')[0].replace(' ', '')}`;
      }
    }

    return pokemonName + formString;
}

export function getRosterSearchHTML(player) {
  let rosterString = '';

  player.roster.forEach((pokemon) => {
    const pokemonName = pokemon.name.toLowerCase().replace('_', '-')
      .replace(' ', '-')
      .replace('.', '')
      .replace('&#39;', '');
    rosterString = `${rosterString + pokemonName} `;
  });
  return rosterString;
}

function capitalize(s) {
  return s.split(' ').map((sp) => sp.charAt(0).toUpperCase() + sp.substring(1)).join(' ');
}

export function getRosterHTML(tournament) {
  if (tournament === undefined || tournament.roster === undefined) {
    return null;
  }
  tournament.roster.sort(compare);
  return tournament.roster.map((pokemon) => {
    let pokemonName = pokemon.name.toLowerCase().replace('_', '-')
      .replace(' ', '-')
      .replace('.', '')
      .replace('&#39;', ''); // `
    let formString = '';
    // default image is too big
    if (pokemonName === 'spinda') {
      pokemonName = 'spinda-01';
    } else if (pokemonName === 'meowstic') {
      pokemonName = 'meowstic-male';
    } else if (pokemonName === 'tapufini') {
      pokemonName = 'tapu-fini';
    }
    if (pokemon.form !== '') {
      if (pokemon.name === 'Pikachu') { // yes, people have ran this lol
        if (pokemon.form === '[Pikachu Vs 2019*]') {
          pokemonName = 'pikachu-libre';
        } else if (pokemon.form === '[Pikachu Costume 2020*]') {
          pokemonName = 'pikachu-balloon4';
        } else if (pokemon.form === '[Pikachu Flying 5Th Anniv*]') {
          pokemonName = 'pikachu-balloon5';
        } else if (pokemon.form === '[Pikachu Flying Okinawa*]') {
          pokemonName = 'pikachu-okinawa-balloon';
        } else if (pokemon.form === '[Pikachu Kariyushi*]') {
          pokemonName = 'pikachu-kariyushi';
        } else if (pokemon.form === '[Pikachu Pop star*]') {
          pokemonName = 'pikachu-popstar';
        } else if (pokemon.form === '[Pikachu Rock Star*]') {
          pokemonName = 'pikachu-rockstar';
        }
      } else if (pokemon.name === 'Castform') {
        formString = `-${pokemon.form.toLowerCase().split(' ')[1].split(']')[0].replace('*', '')}`;
      } else if (pokemon.name === 'Mr. Mime') {
        if (pokemon.form.includes('galar')) {
          formString = '-galarian';
        }
      } else if (pokemon.form.includes(' ')) {
        const split = pokemon.form.toLowerCase().split('[');
        formString = `-${split[split.length - 1].split('form')[0].replace(' ', '')}`;
      }
    }

    const title = `${
      capitalize(formString.replace('-', '') + (formString ? ' ' : '') + capitalize(pokemonName.replace('-', ' ')))} ${
      pokemon.cp} CP${
      pokemon.shadow ? ' Shadow' : ''
    }${pokemon.purified ? ' Purified' : ''
    }${pokemon.best_buddy ? ' Best Buddy' : ''
    }`;

    const buddyStyle = {
      position: 'absolute', // Use position absolute to position shadow image
      width: '25px', // Adjust the desired width for the shadow
      height: '25px', // Adjust the desired height for the shadow
      marginTop: '40px',
      //marginLeft: '40px'
    };

    const shadowStyle = {
      position: 'absolute', // Use position absolute to position shadow image
      width: '25px', // Adjust the desired width for the shadow
      height: '25px', // Adjust the desired height for the shadow
      marginTop: '40px',
      marginLeft: '40px'
    };

    const getBestBuddy = () => {
      if (pokemon.best_buddy) {
        return (
          <img
            className="image2"
            alt="Best Buddy"
            src={BestBuddy}
            style={buddyStyle}
            />
        );
      }
      return null;
    };

    const getShadow = () => {
      if (pokemon.shadow) {
        return (
          <img
            className="image2"
            alt="Shadow"
            src={Shadow}
            style={shadowStyle}
            />
        );
      }
      return null;
    };

    const getPurified = () => {
      if (pokemon.purified) {
        return (
          <img
            className="image2"
            alt="Purified"
            src={Purified}
            style={shadowStyle}
            />
        );
      }
      return null;
    };

        
    const pokemonJsonSid = pokemonJson[getPokemonURLName(pokemon)];
    const sid = pokemonJsonSid != null && pokemonJsonSid.sid != null ? pokemonJsonSid.sid : 1000000000;
    const imageUrl = `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${sid}.png/public`;

    return (
      <div
        className="pokemon-image-wrapper"
        data-tooltip-id="pokemon-item"
        data-tooltip-content={title}

      >
          <img
            width="60px"
            height="60px"
            className="pokemon-image"
            alt={pokemonName}
            src={imageUrl}
            style={{objectFit: "contain"}}
          />
          {getShadow()}
          {getBestBuddy()}
          {getPurified()}
      </div>
    );
  });
}
