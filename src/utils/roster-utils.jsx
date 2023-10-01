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

export function getRosterSearchHTML(player) {
  let rosterString = '';

  player.roster.forEach((pokemon) => {
    rosterString = `${rosterString + transformPokemonName(pokemon.name, pokemon.form)} `;
  });
  return rosterString;
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
    
    const title = `${isNameSwap}${capitalize(pokemonName.replace(new RegExp(`_${forms.join('|')}`, 'g'), '').replaceAll('_', ' '))} ${pokemon.cp}${
      pokemon.shadow ? ' Shadow' : ''
    }${pokemon.purified ? ' Purified' : ''}${pokemon.best_buddy ? ' Best Buddy' : ''}`;

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
    let imageUrl = 'https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/02ef0811-df6c-45e4-1da3-9bf377260100/public';
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
        data-tooltip-content={title}
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