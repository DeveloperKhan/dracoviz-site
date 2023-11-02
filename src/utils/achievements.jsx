import dracoviz_badges_gblELO3500 from '../../static/achievements/dracoviz_badges_gblELO3500.png';
import dracoviz_badges_gblELO3750 from '../../static/achievements/dracoviz_badges_gblELO3750.png';
import dracoviz_badges_gblELO4000 from '../../static/achievements/dracoviz_badges_gblELO4000.png';
import dracoviz_badges_gblLB1 from '../../static/achievements/dracoviz_badges_gblLB1.png';
import dracoviz_badges_gblLB5 from '../../static/achievements/dracoviz_badges_gblLB5.png';
import dracoviz_badges_gblLB10 from '../../static/achievements/dracoviz_badges_gblLB10.png';
import dracoviz_badges_gblLB50 from '../../static/achievements/dracoviz_badges_gblLB50.png';
import dracoviz_badges_gblLB100 from '../../static/achievements/dracoviz_badges_gblLB100.png';
import dracoviz_badges_gblLB500 from '../../static/achievements/dracoviz_badges_gblLB500.png';
import dracoviz_badges_int1 from '../../static/achievements/dracoviz_badges_int1.png';
import dracoviz_badges_int2 from '../../static/achievements/dracoviz_badges_int2.png';
import dracoviz_badges_int3 from '../../static/achievements/dracoviz_badges_int3.png';
import dracoviz_badges_int4 from '../../static/achievements/dracoviz_badges_int4.png';
import dracoviz_badges_int8 from '../../static/achievements/dracoviz_badges_int8.png';
import dracoviz_badges_int16 from '../../static/achievements/dracoviz_badges_int16.png';
import dracoviz_badges_intchamp from '../../static/achievements/dracoviz_badges_intchamp.png';
import dracoviz_badges_quest_8x3 from '../../static/achievements/dracoviz_badges_quest_8x3.png';
import dracoviz_badges_quest_8x4 from '../../static/achievements/dracoviz_badges_quest_8x4.png';
import dracoviz_badges_quest_8x5 from '../../static/achievements/dracoviz_badges_quest_8x5.png';
import dracoviz_badges_quest_80 from '../../static/achievements/dracoviz_badges_quest_80.png';
import dracoviz_badges_quest_90 from '../../static/achievements/dracoviz_badges_quest_90.png';
import dracoviz_badges_quest_100 from '../../static/achievements/dracoviz_badges_quest_100.png';
import dracoviz_badges_reg1 from '../../static/achievements/dracoviz_badges_reg1.png';
import dracoviz_badges_reg2 from '../../static/achievements/dracoviz_badges_reg2.png';
import dracoviz_badges_reg3 from '../../static/achievements/dracoviz_badges_reg3.png';
import dracoviz_badges_reg4 from '../../static/achievements/dracoviz_badges_reg4.png';
import dracoviz_badges_reg8 from '../../static/achievements/dracoviz_badges_reg8.png';
import dracoviz_badges_reg16 from '../../static/achievements/dracoviz_badges_reg16.png';
import dracoviz_badges_regchamp from '../../static/achievements/dracoviz_badges_regchamp.png';
import dracoviz_badges_worlds1 from '../../static/achievements/dracoviz_badges_worlds1.png';
import dracoviz_badges_worlds2 from '../../static/achievements/dracoviz_badges_worlds2.png';
import dracoviz_badges_worlds3 from '../../static/achievements/dracoviz_badges_worlds3.png';
import dracoviz_badges_worlds4 from '../../static/achievements/dracoviz_badges_worlds4.png';
import dracoviz_badges_worlds8 from '../../static/achievements/dracoviz_badges_worlds8.png';
import dracoviz_badges_worlds16 from '../../static/achievements/dracoviz_badges_worlds16.png';
import dracoviz_badges_worlds2022 from '../../static/achievements/dracoviz_badges_worlds2022.png';
import dracoviz_badges_worlds2023 from '../../static/achievements/dracoviz_badges_worlds2023.png';
import dracoviz_badges_worlds2024 from '../../static/achievements/dracoviz_badges_worlds2024.png';
import dracoviz_badges_worldschamp from '../../static/achievements/dracoviz_badges_worldschamp.png';

function is3500(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRating >= 3500);
}

function is3750(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRating >= 3750);
}

function is4000(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRating >= 4000);
}

function isTop1Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 1);
}

function isTop5Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 5);
}

function isTop10Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 10);
}

function isTop50Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 50);
}

function isTop100Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 100);
}

function isTop500Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 500);
}

function isIC(tournament) {
  return tournament.includes('-naic')
    || tournament.includes('-laic')
    || tournament.includes('-ocic')
    || tournament.includes('-euic');
}

function isWorlds(tournament) {
  return tournament.includes('worlds');
}

function isWorlds1st(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 1 && isWorlds(tournament.tournament),
  );
}

function isWorlds2nd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 2 && isWorlds(tournament.tournament),
  );
}

function isWorlds3rd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 3 && isWorlds(tournament.tournament),
  );
}

function isWorlds4th(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 4 && isWorlds(tournament.tournament),
  );
}

function isWorldsTop8(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 8 && isWorlds(tournament.tournament),
  );
}

function isWorldsTop16(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 16 && isWorlds(tournament.tournament),
  );
}

function isIC1st(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 1 && isIC(tournament.tournament),
  );
}

function isIC2nd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 2 && isIC(tournament.tournament),
  );
}

function isIC3rd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 3 && isIC(tournament.tournament),
  );
}

function isIC4th(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 4 && isIC(tournament.tournament),
  );
}

function isICTop8(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 8 && isIC(tournament.tournament),
  );
}

function isICTop16(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 16 && isIC(tournament.tournament),
  );
}

function isReg1st(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 1 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}

function isReg2nd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 2 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}

function isReg3rd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 3 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}

function isReg4th(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 4 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}

function isRegTop8(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 8 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}

function isRegTop16(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank <= 16 && !isIC(tournament.tournament) && !isWorlds(tournament.tournament),
  );
}
function is2022Qualified(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.tournament.includes('2022') && ((tournament.tournament.includes('worlds')) || tournament.qualified));
}

function is2023Qualified(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.tournament.includes('2023') && ((tournament.tournament.includes('worlds')) || tournament.qualified));
}

function is2024Qualified(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.tournament.includes('2024') && ((tournament.tournament.includes('worlds')) || tournament.qualified));
}

function is80WinPercent(profile) {
  return !!profile.tournaments?.some((tournament) => {
    const winPercentage = (parseInt(tournament.game_wins, 10) + parseInt(tournament.game_losses, 10) > 0
     ? (100 * parseInt(tournament.game_wins, 10) / (parseInt(tournament.game_wins, 10) + parseInt(tournament.game_losses, 10)))
      : 0);
    return tournament.final_rank <= 8 && winPercentage >= 80;
  });
}

function is90WinPercent(profile) {
  return !!profile.tournaments?.some((tournament) => {
    const winPercentage = (parseInt(tournament.game_wins, 10) + parseInt(tournament.game_losses, 10) > 0
     ? (100 * parseInt(tournament.game_wins, 10) / (parseInt(tournament.game_wins, 10) + parseInt(tournament.game_losses, 10)))
      : 0);
    return tournament.final_rank <= 8 && winPercentage >= 90;
  });
}

function is100WinPercent(profile) {
  return !!profile.tournaments?.some((tournament) => (tournament.final_rank == 1 && tournament.game_losses == 0 && tournament.game_wins > 0));
}

function isTop8x3(profile) {
  const top8Counts = {}; // Store the count of top 8 appearances by year

  // Check each tournament
  profile.tournaments?.forEach((tournament) => {
    const tournamentYear = tournament.tournament.split('-')[0]; // Extract the year

    // Increment the count for the corresponding year
    if (tournament.final_rank <= 8) {
      top8Counts[tournamentYear] = (top8Counts[tournamentYear] || 0) + 1;
    }
  });

  // Check if any year has three or more top 8 appearances
  return Object.values(top8Counts).some((count) => count >= 3);
}

function isTop8x4(profile) {
  const top8Counts = {}; // Store the count of top 8 appearances by year

  // Check each tournament
  profile.tournaments?.forEach((tournament) => {
    const tournamentYear = tournament.tournament.split('-')[0]; // Extract the year

    // Increment the count for the corresponding year
    if (tournament.final_rank <= 8) {
      top8Counts[tournamentYear] = (top8Counts[tournamentYear] || 0) + 1;
    }
  });

  // Check if any year has three or more top 8 appearances
  return Object.values(top8Counts).some((count) => count >= 4);
}

function isTop8x5(profile) {
  const top8Counts = {}; // Store the count of top 8 appearances by year

  // Check each tournament
  profile.tournaments?.forEach((tournament) => {
    const tournamentYear = tournament.tournament.split('-')[0]; // Extract the year

    // Increment the count for the corresponding year
    if (tournament.final_rank <= 8) {
      top8Counts[tournamentYear] = (top8Counts[tournamentYear] || 0) + 1;
    }
  });

  // Check if any year has three or more top 8 appearances
  return Object.values(top8Counts).some((count) => count >= 5);
}

const achievements = [
  {
    id: 'is4000',
    name: '4000 Rating',
    description: 'Reach 4000 Rating in the GO Battle League',
    check: is4000,
    image: dracoviz_badges_gblELO4000,
  },
  {
    id: 'is3750',
    name: '3750 Rating',
    description: 'Reach 3750 Rating in the GO Battle League',
    check: is3750,
    image: dracoviz_badges_gblELO3750,
  },
  {
    id: 'is3500',
    name: '3500 Rating',
    description: 'Reach 3500 Rating in the GO Battle League',
    check: is3500,
    image: dracoviz_badges_gblELO3500,
  },
  {
    id: 'isTop1Lb',
    name: '#1 GBL',
    description: 'Reach #1 on the GO Battle League Leaderboard',
    check: isTop1Lb,
    image: dracoviz_badges_gblLB1,
  },
  {
    id: 'isTop5Lb',
    name: 'Top 5 GBL',
    description: 'Reach Top 5 on the GO Battle League Leaderboard',
    check: isTop5Lb,
    image: dracoviz_badges_gblLB5,
  },
  {
    id: 'isTop10Lb',
    name: 'Top 10 GBL',
    description: 'Reach Top 10 on the GO Battle League Leaderboard',
    check: isTop10Lb,
    image: dracoviz_badges_gblLB10,
  },
  {
    id: 'isTop50Lb',
    name: 'Top 50 GBL',
    description: 'Reach Top 50 on the GO Battle League Leaderboard',
    check: isTop50Lb,
    image: dracoviz_badges_gblLB50,
  },
  {
    id: 'isTop100Lb',
    name: 'Top 100 GBL',
    description: 'Reach Top 100 on the GO Battle League Leaderboard',
    check: isTop100Lb,
    image: dracoviz_badges_gblLB100,
  },
  {
    id: 'isTop500Lb',
    name: 'Top 500 GBL',
    description: 'Reach Top 500 on the GO Battle League Leaderboard',
    check: isTop500Lb,
    image: dracoviz_badges_gblLB500,
  },
  {
    tier: 4,
    id: 'isWorlds',
    name: 'World Champion',
    description: 'Pokémon GO World Champion',
    check: isWorlds1st,
    image: dracoviz_badges_worldschamp,
  },
  {
    tier: 3,
    id: 'isWorlds',
    name: '#2 Worlds',
    description: '2nd Place at the World Championships',
    check: isWorlds2nd,
    image: dracoviz_badges_worlds2,
  },
  {
    tier: 2,
    id: 'isWorlds',
    name: '#3 Worlds',
    description: '3rd Place at the World Championships',
    check: isWorlds3rd,
    image: dracoviz_badges_worlds3,
  },
  {
    tier: 1,
    id: 'isWorlds',
    name: '#4 Worlds',
    description: '4th Place at the World Championships',
    check: isWorlds4th,
    image: dracoviz_badges_worlds4,
  },
  {
    id: 'top8Worlds',
    name: 'Top 8 Worlds',
    description: 'Top 8 at the World Championships',
    check: isWorldsTop8,
    image: dracoviz_badges_worlds8,
  },
  {
    id: 'top16Worlds',
    name: 'Top 16 Worlds',
    description: 'Top 16 at the World Championships',
    check: isWorldsTop16,
    image: dracoviz_badges_worlds16,
  },
  {
    tier: 4,
    id: 'isIC',
    name: '#1 IC',
    description: '1st Place at an International Championship',
    check: isIC1st,
    image: dracoviz_badges_int1,
  },
  {
    tier: 3,
    id: 'isIC',
    name: '#2 IC',
    description: '2nd Place at an International Championship',
    check: isIC2nd,
    image: dracoviz_badges_int2,
  },
  {
    tier: 2,
    id: 'isIC',
    name: '#3 IC',
    description: '3rd Place at an International Championship',
    check: isIC3rd,
    image: dracoviz_badges_int3,
  },
  {
    tier: 1,
    id: 'isIC',
    name: '#4 IC',
    description: '4th Place at an International Championship',
    check: isIC4th,
    image: dracoviz_badges_int4,
  },
  {
    id: 'top8IC',
    name: 'Top 8 IC',
    description: 'Top 8 at an International Championship',
    check: isICTop8,
    image: dracoviz_badges_int8,
  },
  {
    id: 'top16IC',
    name: 'Top 16 IC',
    description: 'Top 16 at an International Championship',
    check: isICTop16,
    image: dracoviz_badges_int16,
  },
  {
    tier: 4,
    id: 'isReg',
    name: '#1 Regionals',
    description: '1st Place at a Regional Championship',
    check: isReg1st,
    image: dracoviz_badges_reg1,
  },
  {
    tier: 3,
    id: 'isReg',
    name: '#2 Regionals',
    description: '2nd Place at a Regional Championship',
    check: isReg2nd,
    image: dracoviz_badges_reg2,
  },
  {
    tier: 2,
    id: 'isReg',
    name: '#3 Regionals',
    description: '3rd Place at a Regional Championship',
    check: isReg3rd,
    image: dracoviz_badges_reg3,
  },
  {
    tier: 1,
    id: 'isReg',
    name: '#4 Regionals',
    description: '4th Place at a Regional Championship',
    check: isReg4th,
    image: dracoviz_badges_reg4,
  },
  {
    id: 'top8Reg',
    name: 'Top 8 Regionals',
    description: 'Top 8 at a Regional Championship',
    check: isRegTop8,
    image: dracoviz_badges_reg8,
  },
  {
    id: 'top16Reg',
    name: 'Top 16 Regionals',
    description: 'Top 16 at a Regional Championship',
    check: isRegTop16,
    image: dracoviz_badges_reg16,
  },
  {
    id: 'qual2024',
    name: '2024 Worlds',
    description: 'Qualified for the 2024 World Championships',
    check: is2024Qualified,
    image: dracoviz_badges_worlds2024,
  },
  {
    id: 'qual2023',
    name: '2023 Worlds',
    description: 'Qualified for the 2023 World Championships',
    check: is2023Qualified,
    image: dracoviz_badges_worlds2023,
  },
  {
    id: 'qual2022',
    name: '2022 Worlds',
    description: 'Qualified for the 2022 World Championships',
    check: is2022Qualified,
    image: dracoviz_badges_worlds2022,
  },
  {
    tier: 3,
    id: 'isWinPercent',
    name: '100% Win Rate',
    description: 'Finish a Play! Pokémon event with a 100% game win rate',
    check: is100WinPercent,
    image: dracoviz_badges_quest_100,
  },
  {
    tier: 2,
    id: 'isWinPercent',
    name: '90% Win Rate',
    description: 'Finish a Play! Pokémon event with a 90%+ game win rate',
    check: is90WinPercent,
    image: dracoviz_badges_quest_90,
  },
  {
    tier: 1,
    id: 'isWinPercent',
    name: '80% Win Rate',
    description: 'Finish a Play! Pokémon event with a 80%+ game win rate',
    check: is80WinPercent,
    image: dracoviz_badges_quest_80,
  },
  {
    tier: 3,
    id: 'top8x',
    name: 'Top 8 x 5',
    description: 'Five Top 8 finishes at Play! events in a single season',
    check: isTop8x5,
    image: dracoviz_badges_quest_8x5,
  },
  {
    tier: 2,
    id: 'top8x',
    name: 'Top 8 x 4',
    description: 'Four Top 8 finishes at Play! events in a single season',
    check: isTop8x4,
    image: dracoviz_badges_quest_8x4,
  },
  {
    tier: 1,
    id: 'top8x',
    name: 'Top 8 x 3',
    description: 'Three Top 8 finishes at Play! events in a single season',
    check: isTop8x3,
    image: dracoviz_badges_quest_8x3,
  },
];

export function getAchievements(profile) {
  const highestTierAchievements = {};
  const validAchievementsArray = [];

  achievements.forEach((achievement) => {
    if (achievement.check(profile)) {
      if (!highestTierAchievements[achievement.id] || achievement.tier > highestTierAchievements[achievement.id].tier) {
        highestTierAchievements[achievement.id] = achievement;
      }
    }
  });

  for (const achievement of Object.values(highestTierAchievements)) {
    validAchievementsArray.push(achievement);
  }

  return validAchievementsArray;
}
