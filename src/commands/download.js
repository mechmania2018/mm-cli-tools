//
const path = require("path");
const chalk = require("chalk");
const execa = require("execa");
const fetch = require("node-fetch");
const os = require("os");
const fs = require("fs");
const tar = require("tar");
const { promisify } = require("util");
const rimraf = promisify(require("rimraf"));

const handleErrors = require("../utils/handleErrors");

// const visualizerFName = "visualizer"
const visualizerDir = path.join(os.homedir(), ".mm", "visualizer");
// const visualizerPath = path.join(visualizerDir, "visualizer.tar.gz");

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

module.exports.command = "download";
module.exports.describe =
  "Download the appropriate visualizer for your operating system";

module.exports.builder = yargs => yargs;

module.exports.handler = handleErrors(async argv => {
  try {
    await rimraf(visualizerDir);
  } catch (e) {}
  try {
    await mkdir(visualizerDir);
  } catch (e) {}

  if (process.platform === "darwin") {
    console.log("Downloading the game");
    fetch("https://mm-mac.now.sh").then(res =>
      res.body.pipe(
        tar.x({
          strip: 1,
          C: visualizerDir
        })
      )
    );
  }

  if (process.platform === "win32" || process.platform === "win64" ) {
    console.log("Downloading the game");
    fetch("https://mm-window.now.sh").then(res =>
      res.body.pipe(
        tar.x({
          strip: 1,
          C: visualizerDir
        })
      )
    );
  }


  if (process.platform === "linux") {
    console.log("Downloading the game");
    fetch("https://mm-linux.now.sh").then(res =>
      res.body.pipe(
        tar.x({
          strip: 1,
          C: visualizerDir
        })
      )
    );
  }


 
});
