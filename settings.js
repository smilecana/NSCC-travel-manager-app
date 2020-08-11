const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Settings {
  constructor(opts) {
    const userDataPath = (electron.app || electron.remote.app).getAppPath();
    this.path = path.join(`${userDataPath}/app/data/`, opts.configName + '.json'); 
    this.data = parseDataFile(this.path, opts.defaults);
  }
  
  get(key) {
    return this.data[key];
  }

  set(key, val) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
    try { //if file does not exist
        return JSON.parse(fs.readFileSync(filePath));
  } catch(error) {
        return defaults;
  }
}

// expose the class
module.exports = Settings;