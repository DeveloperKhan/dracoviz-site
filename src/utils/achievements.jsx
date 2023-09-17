import rating3500 from '../../static/achievements/3500.png';
import top50 from '../../static/achievements/top50.png';
import lb from '../../static/achievements/lb.png';
import number1 from '../../static/achievements/number1.png';
import qualified from '../../static/achievements/qualified.png';

function is3500(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRating >= 3500);
}

function isTop50Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank <= 50);
}

function isTop1Lb(profile) {
  return !!profile.gbl?.some((gbl) => gbl.peakRank == 1);
}

function isLb(profile) {
  return profile.gbl !== undefined;
}

function isQualified(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.qualified);
}

function isTop8(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.final_rank <= 8);
}

function isTop8x2(profile) {
  // Filter the tournaments where the player got top 8
  const top8Tournaments = (profile.tournaments || []).filter((tournament) => tournament.final_rank <= 8);
  
  // Check if there are at least 2 tournaments with top 8 finishes
  return top8Tournaments.length >= 2;
}

function isTop8x3(profile) {
  // Filter the tournaments where the player got top 8
  const top8Tournaments = (profile.tournaments || []).filter((tournament) => tournament.final_rank <= 8);
  
  // Check if there are at least 3 tournaments with top 8 finishes
  return top8Tournaments.length >= 3;
}

function isTop8x4(profile) {
  // Filter the tournaments where the player got top 8
  const top8Tournaments = (profile.tournaments || []).filter((tournament) => tournament.final_rank <= 8);
  
  // Check if there are at least 4 tournaments with top 8 finishes
  return top8Tournaments.length >= 4;
}

function is4th(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.final_rank == 4);
}

function is3rd(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.final_rank == 3);
}

function is2nd(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.final_rank == 2);
}

function is1st(profile) {
  return !!profile.tournaments?.some((tournament) => tournament.final_rank == 1);
}

function isWorlds4th(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 4 && tournament.tournament.includes("worlds")
  );
}

function isWorlds3rd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 3 && tournament.tournament.includes("worlds")
  );
}

function isWorlds2nd(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 2 && tournament.tournament.includes("worlds")
  );
}

function isWorlds1st(profile) {
  return !!profile.tournaments?.some(
    (tournament) => tournament.final_rank == 1 && tournament.tournament.includes("worlds")
  );
}

function isTop8x3Season(profile) {
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

const achievements = [
  {
    tier: 1,
    id: 'is3500',
    name: '3500 Rating',
    description: 'Reach 3500 rating',
    check: is3500,
    image: rating3500,

  },
  {
    id: 'isTop50Lb',
    name: 'Page 1 GBL',
    description: 'Reach top 50 in the GBL leaderboard',
    check: isTop50Lb,
    image: top50,
  },
  {
    id: 'isTop1Lb',
    name: '#1 GBL',
    description: 'Reach #1 in the GBL leaderboard',
    check: isTop1Lb,
    image: number1,
  },
  {
    id: 'isLb',
    name: 'GBL Leaderboard',
    description: 'Reach the GBL leaderboard',
    check: isLb,
    image: lb,
  },
  {
    id: 'qualified',
    name: 'Worlds Qualified',
    description: 'Qualify for the World Championships',
    check: isQualified,
    image: qualified,
  },
  {
    tier: 2,
    id: 'is3500',
    name: 'Reach 3550',
    description: 'Reach 4000 rating for Tier 2',
    check: (profile) => profile.gbl?.some((gbl) => gbl.peakRating >= 3550),
    image: rating3500,
  },
  {
    tier: 1,
    id: 'top8',
    name: 'Top 8',
    description: 'Top 8 at a Play! Pokemon event',
    check: isTop8,
    image: rating3500,
  },
  {
    tier: 2,
    id: 'top8',
    name: 'Top 8 x2',
    description: 'Top 8 x2 at a Play! Pokemon event',
    check: isTop8x2,
    image: rating3500,
  },
  {
    tier: 3,
    id: 'top8',
    name: 'Top 8 x3',
    description: 'Top 8 x3 at a Play! Pokemon event',
    check: isTop8x3,
    image: rating3500,
  },
  {
    tier: 4,
    id: 'top8',
    name: 'Top 8 x4',
    description: 'Top 8 x4 at a Play! Pokemon event',
    check: isTop8x4,
    image: rating3500,
  },
  {
    tier: 1,
    id: 'bigPlacement',
    name: '4th Place',
    description: '4th Place at a Play! Pokemon event',
    check: is4th,
    image: rating3500,
  },
  {
    tier: 2,
    id: 'bigPlacement',
    name: '3rd Place',
    description: '3rd Place at a Play! Pokemon event',
    check: is3rd,
    image: rating3500,
  },
  {
    tier: 3,
    id: 'bigPlacement',
    name: '2nd Place',
    description: '2nd Place at a Play! Pokemon event',
    check: is2nd,
    image: rating3500,
  },
  {
    tier: 4,
    id: 'bigPlacement',
    name: '1st Place',
    description: '1st Place at a Play! Pokemon event',
    check: is1st,
    image: rating3500,
  },
  {
    tier: 1,
    id: 'worlds',
    name: '4th Worlds',
    description: '4th Place at the World Championship',
    check: isWorlds4th,
    image: rating3500,
  },
  {
    tier: 2,
    id: 'worlds',
    name: '3rd Worlds',
    description: '3rd Place at the World Championship',
    check: isWorlds3rd,
    image: rating3500,
  },
  {
    tier: 3,
    id: 'worlds',
    name: '2nd Worlds',
    description: '2nd Place at the World Championship',
    check: isWorlds2nd,
    image: rating3500,
  },
  {
    tier: 4,
    id: 'worlds',
    name: '1st Worlds',
    description: '1st Place at the World Championship',
    check: isWorlds1st,
    image: rating3500,
  },
  {
    tier: 4,
    id: 'top8x3Season',
    name: 'Season Top 8 x3',
    description: 'Reach top 8 at a Play! Pokemon event 3 times in a single season',
    check: isTop8x3Season,
    image: rating3500,
  }
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

  console.log(validAchievementsArray);
  return validAchievementsArray;
}