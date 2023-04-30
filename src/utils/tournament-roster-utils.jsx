import React from 'react';
import BestBuddy from '../../content/assets/best_buddy_small.png';
import Purified from '../../content/assets/purified_small.png';
import Shadow from '../../content/assets/shadow_small.png';

function compare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
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
  return s && s[0].toUpperCase() + s.slice(1);
}

export function getRosterHTML(player) {
  if (player === undefined) {
    return null;
  }
  player.roster.sort(compare);
  return player.roster.map((pokemon) => {
    let pokemonName = pokemon.name.toLowerCase().replace('_', '-')
      .replace(' ', '-')
      .replace('.', '')
      .replace('&#39;', ''); // `
    // console.log(pokemonName)
    let formString = '';
    // default image is too big
    if (pokemonName === 'spinda') {
      pokemonName = 'spinda-01';
    } else if (pokemonName === 'meowstic') {
      pokemonName = 'meowstic-male';
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
        // console.log(pokemon)
        const split = pokemon.form.toLowerCase().split('[');
        formString = `-${split[split.length - 1].split('form')[0].replace(' ', '')}`;
      }
    }

    const title = `${
      capitalize(formString.replace('-', '') + (formString ? ' ' : '') + capitalize(pokemonName))} ${
      pokemon.cp} CP${
      pokemon.shadow ? ' Shadow' : ''
    }${pokemon.purified ? ' Purified' : ''
    }${pokemon.best_buddy ? ' Best Buddy' : ''
    }`;

    const getBestBuddy = () => {
      if (pokemon.best_buddy) {
        return (<img className="image2" width="69px" alt="Best Buddy" src={BestBuddy} />);
      }
      return null;
    };

    const getShadow = () => {
      if (pokemon.shadow) {
        return (<img className="image2" width="69px" alt="Shadow" height="69px" src={Shadow} />);
      }
      return null;
    };

    const getPurified = () => {
      if (pokemon.purified) {
        return (<img className="image2" width="69px" alt="Purified" height="69px" src={Purified} />);
      }
      return null;
    };

    return (
      <div data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" title={title} width="69px" height="69px" className="pokemon-image-wrapper">
        {getBestBuddy()}
        {getShadow()}
        {getPurified()}
        <img
          width="69px"
          height="69px"
          className="pokemon-image"
          alt={pokemonName}
          src={`https://img.pokemondb.net/sprites/go/normal/${
            pokemonName}${formString}.png`}
        />
      </div>
    );
  });
}
