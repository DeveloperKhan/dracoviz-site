import React from 'react';
import BestBuddy from '../../content/assets/best_buddy_small.png';
import Purified from '../../content/assets/purified_small.png';
import Shadow from '../../content/assets/shadow_small.png';
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
  // return s && s[0].toUpperCase() + s.slice(1);
}

export function getPokemonURLName(pokemon) {
  let pokemonName = pokemon.name.toLowerCase()
      .replace(' ', '-')
      .replace('.', '')
      .replace('&#39;', '')
      .replace("-", "_"); // `
      console.log(pokemon.name)
      console.log(pokemonName)
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

    console.log(pokemonName)
    return pokemonName + formString;
}

export function getRosterHTML(player) {
  console.log(player)
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
        // console.log(pokemon)
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

    
    console.log("test")
    console.log(pokemonName.replace("-", "_"))
    const pokemonJsonSid = pokemonJson[getPokemonURLName(pokemon)];
    console.log(pokemonName.replace("-", "_"))
    const sid = pokemonJsonSid != null && pokemonJsonSid.sid != null ? pokemonJsonSid.sid : 1000000000;
    console.log(pokemonName.replace("-", "_"))
    const imageUrl = `https://imagedelivery.net/2qzpDFW7Yl3NqBaOSqtWxQ/home_${sid}.png/public`;
    console.log(imageUrl)

    return (
      <div
        width="69px"
        height="69px"
        className="pokemon-image-wrapper"
        data-tooltip-id="pokemon-item"
        data-tooltip-content={title}
      >
        {getBestBuddy()}
        {getShadow()}
        {getPurified()}
        <img
          width="60px"
          height="60px"
          className="pokemon-image"
          alt={pokemonName}
          src={imageUrl}
          style={{objectFit: "contain"}}
        />
      </div>
    );
  });
}
