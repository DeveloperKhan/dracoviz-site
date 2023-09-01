import pokemonJSON from '../static/pokemon.json';
import rulesJSON from '../static/rules.json';

const validateTeam = (pokemon, cp, fastMoves, chargedMoves, format, teamSize) => {
  const rules = rulesJSON[format];
  const pokemon_list = [];

  pokemon.forEach((p) => {
    pokemon_list.push(pokemonJSON[p]);
  });

  // include
  let generic_error;
  if (rules.include != null) {
    pokemon.forEach((p) => {
      let includeList = [];
      if (rules.include) {
        includeList = rules.include;
      }
      if (includeList.length) {
        let included = false;

        includeList.every((tag) => {
          included = doesSelectorDescribePokémon(tag, pokemonJSON[p]);
          if (included) {
            return false;
          }
          return true;
        });

        if (!included) {
          generic_error = 'api_team_validation_generic';
          return false;
        }
      }
      return true;
    });
    if (generic_error != null) {
      return generic_error;
    }
  }

  // exclude
  if (rules.exclude != null) {
    pokemon.forEach((p) => {
      let excludeList = [];
      if (rules.exclude) {
        excludeList = rules.exclude;
      }
      if (excludeList.length) {
        let excluded = false;

        excludeList.every((tag) => {
          excluded = doesSelectorDescribePokémon(tag, pokemonJSON[p]);
          if (excluded) {
            return false;
          }
          return true;
        });

        if (excluded) {
          generic_error = 'api_team_validation_generic';
          return false;
        }
      }
      return true;
    });
    if (generic_error != null) {
      return generic_error;
    }
  }

  // length check
  if (pokemon?.length !== teamSize
    || (cp != null && cp?.length !== teamSize)
    || (fastMoves != null && fastMoves?.length !== teamSize)
    || (chargedMoves != null && chargedMoves?.length !== teamSize)
    || pokemon_list?.length !== teamSize
  ) {
    return 'api_team_validation_generic';
  }

  // cp check
  if (cp != null) {
    let cp_error;
    cp.every((c) => {
      if (c > rules.maxCP) {
        cp_error = 'api_team_validation_cp';
        return false;
      }
      return true;
    });
    if (cp_error != null) {
      return cp_error;
    }
  }

  // points check
  let sum_points = 0;
  let num_priced_pokemon = 0;
  const prices = rules.pointLimitOptions?.prices;
  if (prices != null) {
    const default_price = rules.pointLimitOptions?.defaultPrice;
    prices?.forEach((pr) => {
      pokemon.forEach((p) => {
        if (pr.pokemonIds.includes(p)) {
          sum_points += pr.price;
          num_priced_pokemon += 1;
        }
      });
    });
    sum_points += default_price * (teamSize - num_priced_pokemon);
    if (rules.pointLimitOptions?.maxPoints != null
      && sum_points > rules.pointLimitOptions?.maxPoints) {
      return 'api_team_validation_points_max';
    }
    if (rules.pointLimitOptions?.minPoints != null
      && sum_points < rules.pointLimitOptions?.minPoints) {
      return 'api_team_validation_points_min';
    }
  }

  // unreleased check
  let unreleased_error;
  pokemon.every((p) => {
    if (pokemonJSON[p].tags?.includes('unreleased')) {
      unreleased_error = 'api_team_validation_unreleased';
      return false;
    }
    return true;
  });
  if (unreleased_error != null) {
    return unreleased_error;
  }

  // moveset check
  if (fastMoves != null || chargedMoves != null) {
    let moveset_error;
    pokemon.every((p, index) => {
      if (!pokemonJSON[p].fastMoves.includes(fastMoves[index])) {
        moveset_error = 'api_team_validation_moveset';
        return false;
      }
      if (chargedMoves[index][0] === chargedMoves[index][1]) {
        moveset_error = 'api_team_validation_moveset';
        return false;
      }
      if (!pokemonJSON[p].chargedMoves.includes(chargedMoves[index][0])
          || !pokemonJSON[p].chargedMoves.includes(chargedMoves[index][1])
      ) {
        moveset_error = 'api_team_validation_moveset';
        return false;
      }
      return true;
    });
    if (moveset_error != null) {
      return moveset_error;
    }
  }

  // mega check
  if (rules.maxMega != null) {
    let megaCount = 0;
    pokemon_list.forEach((p) => {
      if (p?.tags?.includes('mega')) {
        megaCount += 1;
      }
    });
    if (megaCount > rules.maxMega) {
      return 'api_team_validation_mega';
    }
  }

  // duplicate check
  // if speciesClauseByDex == true
  // can have different forms if typing is different
  // ex. Kanto and Alolan Ninetales can be on the same team
  // if speciesClauseByForm == true
  // cannot have different forms if typing is different
  // ex. Kanto and Alolan Ninetales cannot be on the same team
  if (rules.flags?.speciesClauseByDex != null && rules.flags.speciesClauseByDex === 'true') {
    let duplicate_error;
    pokemon_list.every((p1, index1) => {
      pokemon_list.every((p2, index2) => {
        if (index2 > index1) {
          if (p1.dex === p2.dex && p1.types.sort().join(',') === p2.types.sort().join(',')) {
            duplicate_error = 'api_team_validation_duplicate';
            return false;
          }
          return true;
        }
        return true;
      });
      if (duplicate_error != null) {
        return false;
      }
      return true;
    });
    if (duplicate_error != null) {
      return duplicate_error;
    }
  }

  if (rules.flags?.speciesClauseByForm != null && rules.flags.speciesClauseByForm === 'true') {
    let duplicate_error;
    pokemon_list.every((p1, index1) => {
      pokemon_list.every((p2, index2) => {
        if (index2 > index1) {
          if (p1.dex === p2.dex) {
            duplicate_error = 'api_team_validation_duplicate';
            return false;
          }
          return true;
        }
        return true;
      });
      if (duplicate_error != null) {
        return false;
      }
      return true;
    });
    if (duplicate_error != null) {
      return duplicate_error;
    }
  }

  // slot check include
  let slot_error;
  if (rules.teamPattern != null) {
    pokemon.every((p, position) => {
      let includeList = [];
      if (rules.include) {
        includeList = rules.include;
      }
      if (rules.teamPattern && rules.teamPattern[position] && rules.teamPattern[position].include) {
        includeList = includeList.concat(rules.teamPattern[position].include);
      }
      if (includeList.length) {
        let included = false;

        includeList.every((tag) => {
          included = doesSelectorDescribePokémon(tag, pokemonJSON[p]);
          if (included) {
            return false;
          }
          return true;
        });

        if (!included) {
          slot_error = 'api_team_validation_slot';
          return false;
        }
      }
      return true;
    });
    if (slot_error != null) {
      return slot_error;
    }
  }

  // slot check exclude
  if (rules.teamPattern != null) {
    pokemon.every((p, position) => {
      let excludeList = [];
      if (rules.exclude) {
        excludeList = rules.exclude;
      }
      if (rules.teamPattern && rules.teamPattern[position] && rules.teamPattern[position].exclude) {
        excludeList = excludeList.concat(rules.teamPattern[position].exclude);
      }
      if (excludeList.length) {
        let excluded = false;

        excludeList.every((tag) => {
          excluded = doesSelectorDescribePokémon(tag, pokemonJSON[p]);
          if (excluded) {
            return false;
          }
          return true;
        });

        if (excluded) {
          slot_error = 'api_team_validation_slot';
          return false;
        }
      }
      return true;
    });
    if (slot_error != null) {
      return slot_error;
    }
  }

  // shadow check
  if (rules.shadowAllowed != null && rules.shadowAllowed === 0) {
    let shadow_error;
    pokemon.every((p) => {
      if (pokemonJSON[p].tags?.includes('shadow')) {
        shadow_error = 'api_team_validation_shadow';
        return false;
      }
      return true;
    });
    if (shadow_error != null) {
      return shadow_error;
    }
  }

  return null;
};

const doesSelectorDescribePokémon = (tag, poke) => {
  if (!poke) {
    return false;
  }
  if (tag.filterType === 'tag') {
    return !!poke.tags && tag.values.some((value) => poke.tags?.includes(value));
  } if (tag.filterType === 'id') {
    return tag.values.includes(poke.speciesId);
  } if (tag.filterType === 'type') {
    return tag.values.some((value) => poke.types.includes(value));
  } if (tag.filterType === 'dex') {
    return tag.values.some((value) => {
      const [start, end] = value.split('-');
      const startInt = parseInt(start, 10);
      const endInt = parseInt(end, 10);
      return startInt <= poke.dex && poke.dex <= endInt;
    });
  }
  return false;
};

export default validateTeam;