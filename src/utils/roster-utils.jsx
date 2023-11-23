import React from 'react';
import BestBuddy from '../../content/assets/buddy_icon.png';
import Purified from '../../content/assets/purified_icon.png';
import Shadow from '../../content/assets/shadow_icon.png';
import pokemonJson from '../../static/pokemon.json';
import movesJson from '../../static/moves.json';

function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function capitalize(s) {
  return s.split(' ').map((sp) => sp.charAt(0).toUpperCase() + sp.substring(1)).join(' ');
}

function transformPokemonName(pokemonName, form) {
  let transformedName = pokemonName.toLowerCase()
    .replace('_', '-')
    .replace(' ', '-')
    .replace('.', '')
    .replace('&#39;', '')
    .replace('-', '_');

  if (transformedName === 'spinda') {
    transformedName = 'spinda_01';
  } else if (transformedName === 'meowstic') {
    transformedName = 'meowstic';
  } else if (transformedName === 'tapufini') {
    transformedName = 'tapu_fini';
  } else if (transformedName === 'oricorio') {
    transformedName = 'oricorio_pom_pom';
  } else if (transformedName === 'gourgeist') {
    transformedName = 'gourgeist_super';
  } 

  if (form !== '') {
    if (pokemonName === 'Pikachu') {
      const formMap = {
        '[Pikachu Vs 2019*]': 'pikachu_libre',
        '[Pikachu Costume 2020*]': 'pikachu_balloon4',
        '[Pikachu Flying 5Th Anniv*]': 'pikachu_balloon5',
        '[Pikachu Flying Okinawa*]': 'pikachu_okinawa_balloon',
        '[Pikachu Kariyushi*]': 'pikachu_kariyushi',
        '[Pikachu Pop star*]': 'pikachu_popstar',
        '[Pikachu Rock Star*]': 'pikachu_rockstar',
      };
      transformedName = formMap[form] || transformedName;
    } else if (pokemonName === 'Castform') {
      transformedName += `_${form.toLowerCase().split(' ')[1].split(']')[0].replace('*', '')}`;
    } else if (pokemonName === 'Mr. Mime') {
      if (form.includes('galar')) {
        transformedName += '_galarian';
      }
    } else if (pokemonName === 'Meowstic') {
      if (form.includes('female')) {
        transformedName += '_female';
      }
    } else if (pokemonName === 'Oricorio') {
        if (form.includes('Baile')) {
          transformedName += '_baile';
        } else if (form.includes('Pa')) {
            transformedName += '_pau';
        } else if (form.includes('Pom')) {
            transformedName += '_pom_pom';
        } else if (form.includes('Sensi')) {
            transformedName += '_sensu';
        } else {
            transformedName += '_pom_pom';
        }
      } else if (form.includes(' ')) {
      const split = form.toLowerCase().split('[');
      transformedName += `_${split[split.length - 1].split('form')[0].replace(' ', '')}`;
    }
  }

  return transformedName;
}

export function getPokemonURLName(pokemon) {
  return transformPokemonName(pokemon.name, pokemon.form);
}

export function getRosterSearchMovesHTML(player) {
  let rosterString = '';

  if (player.roster == null) {
    return rosterString;
  }

  player.roster.forEach((pokemon) => {
    rosterString = `${rosterString + pokemon.fast + " " + pokemon.charge1 + " " + pokemon.charge2 + " "} `;
  });
  return rosterString;
}

export function getRosterSearchHTML(player) {
  let rosterString = '';

  if (player.roster == null) {
    return rosterString;
  }

  player.roster.forEach((pokemon) => {
    rosterString = `${rosterString + transformPokemonName(pokemon.name, pokemon.form)} `;
  });
  return rosterString;
}

function getMovesURL(move) {
  if (move == null || movesJson[move] == null) {
    // print if move icon is missing
    // console.log(move)
    return "";
  }
  return "https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Images/Types/POKEMON_TYPE_" + movesJson[move].type.toUpperCase() + ".png";
}

export function getRosterHTML(tournament) {
  if (tournament === undefined || tournament.roster === undefined) {
    return null;
  }
  tournament.roster.sort(compare);
  return tournament.roster.map((pokemon) => {
    const pokemonName = transformPokemonName(pokemon.name, pokemon.form);
    const forms = ['galarian', 'alolan', 'hisuian', 'paldean', 'defense'];

    const isNameSwap = forms.map(form =>
      pokemonName.includes(`_${form}`)
        ? `${capitalize(form)} `
        : ''
    ).join('');
    
    let title = `${isNameSwap}${capitalize(pokemonName.replace(new RegExp(`_${forms.join('|')}`, 'g'), '').replaceAll('_', ' '))} 
    ${"<br />" + pokemon.cp + ' CP'}
    ${pokemon.shadow ? '<br />Shadow' : ''}
    ${pokemon.purified ? '<br />Purified' : ''}
    ${pokemon.best_buddy ? '<br />Best Buddy' : ''}
    ${pokemon.fast ? '<br /><br /><img height="20px" width="20px" src="' + getMovesURL(pokemon.fast) + '"> ' + pokemon.fast : ''}
    ${pokemon.charge1 ? '<br /><img height="20px" width="20px" src="' + getMovesURL(pokemon.charge1) + '"> ' + pokemon.charge1 : ''}
    ${pokemon.charge2 ? '<br /><img height="20px" width="20px" src="' + getMovesURL(pokemon.charge2) + '"> ' + pokemon.charge2 : ''}`;

    const buddyStyle = {
      position: 'absolute',
      width: '25px',
      height: '25px',
      marginTop: '40px',
    };

    const shadowStyle = {
      position: 'absolute',
      width: '25px',
      height: '25px',
      marginTop: '40px',
      marginLeft: '40px',
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
    let imageUrl = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/2da163c6-167f-4b7d-5e3d-bbc5cf178b00/public';
    // if (pokemon.name.includes("a")) {
    if (pokemonJsonSid != null && pokemonJsonSid.sid != null) {
      imageUrl = `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${pokemonJsonSid.sid}.png/public`;
    }

    return (
      <div
        width="69px"
        height="69px"
        className="pokemon-image-wrapper"
        data-tooltip-id="pokemon-item"
        data-tooltip-html={title}
        data-html="true"
        style={{ whiteSpace: 'pre-line' }}
      >
        <img
          width="60px"
          height="60px"
          className="pokemon-image"
          alt={pokemonName}
          src={imageUrl}
          style={{ objectFit: 'contain' }}
        />
        {getBestBuddy()}
        {getShadow()}
        {getPurified()}
      </div>
    );
  });
}