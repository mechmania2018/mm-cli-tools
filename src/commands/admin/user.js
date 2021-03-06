//
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");
const moment = require("moment");
const inquirer = require("inquirer");

const { getTeam } = require("../../utils/auth");
const handleErrors = require("../../utils/handleErrors");
const { stats, teams, versions, matches } = require("../../api");

module.exports.command = "user";
module.exports.describe = false;

module.exports.builder = yargs => yargs;

function sortUsers(a, b) {
  return a.stats.wins / (a.stats.wins + a.stats.losses + a.stats.ties) <
    b.stats.wins / (b.stats.wins + b.stats.losses + b.stats.ties)
    ? 1
    : -1;
}

module.exports.handler = handleErrors(async argv => {
  const team = await getTeam();

  if (!team) {
    return console.log(
      "Nobody is currently logged in. Use `mm login` to login or `mm register` to create a new team."
    );
  }
  const users = await teams(team);

  console.log(users);
  const choices = users.map(user => ({
    name: user.team.name,
    value: user
  }));
  console.log(choices);
  const { chosenTeam } = await inquirer.prompt([
    {
      type: "list",
      name: "chosenTeam",
      choices
    }
  ]);

  const modes = ["stats", "info", "versions", "matches"];

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      choices: modes
    }
  ]);

  switch (mode) {
    case "stats":
      console.log(`Name: ${chosenTeam.team.name}`);
      console.log(`Email: ${chosenTeam.team.email}`);
      console.log(`Token: ${chosenTeam.team.token}`);
      console.log(`Latest script url: ${chosenTeam.script.url}`);
      console.log(`Latest script created At: ${chosenTeam.script.createdAt}`);
      break;
    case "versions":
      const allUserVersions = await versions(chosenTeam.team);
      allUserVersions.map(userVersion => console.log(userVersion.createdAt));
      break;
    case "stats":
      const userStats = await stats(chosenTeam.team, chosenTeam.script.key);
      console.log(`Name:       ${chosenTeam.team.name}`);
      console.log(`Wins:       ${userStats.wins}`);
      console.log(`Losses      ${userStats.losses}`);
      console.log(`Ties:       ${userStats.ties}`);
      console.log(`Scores:     ${userStats.wins * 3 + userStats.ties}`);
      break;
    case "matches":
      const allMatches = await matches(chosenTeam.team);
      const teamNames = allMatches.oponentInfo.map(
        (match, i) =>
          users
            .map(
              user =>
                user.script.key === allMatches.oponentInfo[i].key
                  ? user.team.name
                  : ""
            )
            .filter(name => name != "")[0]
      );

      for (let i = 0; i < teamNames.length; i++) {
        if (teamNames[i] != undefined) {
          console.log(
            " " +
              teamNames[i].padEnd(20).substring(0, 20) +
              "  : " +
              allMatches.wins[i]
          );
        }
      }

      break;
    default:
      console.log("You broke the cli tool, congrats. Please report this");
  }
  console.log(mode);
});
