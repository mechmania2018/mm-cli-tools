//
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");

const { stats, teams } = require("../../api");

module.exports.command = "leaderboard";
module.exports.describe = false;

module.exports.builder = yargs => yargs;

const compute = ({ wins, losses, ties }) => ({
  wins: wins,
  losses: losses,
  ties: ties,
  score: 3 * wins + ties
});

function sortUsers(a, b) {
  return a.stats.score < b.stats.score ? 1 : -1;
}

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }

  let users = await teams(team);
  users = users.filter(u => u.latestScript);
  const usersWithStats = await Promise.all(
    users.map(async user => ({
      team: user.name,
      stats: compute(await stats(user, user.latestScript.key))
    }))
  );

  usersWithStats.sort(sortUsers).map((user, i) => {
    console.log(`
     ${i}. Team: ${user.padEnd(20).substring(0, 20)} Score: ${
      user.stats.score
    } Wins: ${user.stats.wins} Losses: ${user.stats.losses} Ties: ${
      user.stats.ties
    } `);
  });
});
