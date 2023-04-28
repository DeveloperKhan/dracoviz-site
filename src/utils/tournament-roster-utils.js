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
  let rosterString = '';
  if (player === undefined) {
    return rosterString;
  }
  player.roster.sort(compare);
  player.roster.forEach((pokemon) => {
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

    rosterString = `${rosterString}<div data-bs-html="true" data-bs-toggle="tooltip" data-bs-placement="top" title="${
      capitalize(formString.replace('-', '') + (formString ? ' ' : '') + capitalize(pokemonName))} ${
      pokemon.cp} CP${
      pokemon.shadow ? ' Shadow' : ''
    }${pokemon.purified ? ' Purified' : ''
    }${pokemon.best_buddy ? ' Best Buddy' : ''
    }" width="69px" height="69px" class="parent">`;
    if (pokemon.best_buddy) {
      rosterString += '<img class="image2" width="69px" src="/images/best_buddy_small.png"></img>';
    }
    if (pokemon.shadow) {
      rosterString += '<img class="image2" width="69px" height="69px" src="/images/shadow_small.png"></img>';
    }
    if (pokemon.purified) {
      rosterString += '<img class="image2" width="69px" height="69px" src="/images/purified_small.png"></img>';
    }
    rosterString += (`<img width="69px" height="69px" class="image1" src="https://img.pokemondb.net/sprites/go/normal/${
      pokemonName}${formString}.png"></img></div>`);
  });
  return rosterString;
}
