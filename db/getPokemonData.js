import pokemonJSON from '../static/pokemon.json';
import jpI18n from '../static/jp/pokemon.json';

export default function getPokemonData(locale) {
  if (locale !== 'jp') {
    return pokemonJSON;
  }
  const pokemonData = {};
  Object.keys(pokemonJSON).forEach((key) => {
    const pokemon = pokemonJSON[key];
    const { speciesId } = pokemon;
    pokemonData[key] = {
      ...pokemon,
      speciesName: jpI18n[speciesId],
    };
  });
  return pokemonData;
}
