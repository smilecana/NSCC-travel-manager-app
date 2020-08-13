
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
dotenv.config();
const checkToken = require('./js/check-key.js');
// const dotenv = require('dotenv');
// dotenv.config();
const Settings = require('./settings.js');
const settings = new Settings({
  configName: 'user-data',
  defaults: {
    windowBounds: { width: 1200, height: 800 }
  }
});
let knex = require('knex')({
  client: "sqlite3",
  connection: {
    filename: path.join('app', './data/travelDB.db')
  },
  useNullAsDefault: true
});
//deconstruct imports
const { app, BrowserWindow, ipcMain, remote } = require('electron');
//variables for windows
let mainWindow;
let loginWindow;
let roadData;
// CREATE WINDOWS START======================================================================================
//create main window
function createWindow() {
  let { width, height } = settings.get('windowBounds');
  let pathname;
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    frame: false ,
    webPreferences: {
      nodeIntegration: true
    }
  })
  const token = settings.get('token');
  pathname = (checkToken(token))? 'renderer/viewerwindow.html':'renderer/loginwindow.html';
 
  mainWindow.loadURL(url.format({
    pathname: path.join('app', pathname),
    protocol: 'file:',
    slashes: true
  }));
  console.log(mainWindow);
  mainWindow.webContents.openDevTools();
  if(token){
    mainWindow.webContents.on('dom-ready', (e) => {
      dbreadpage();
      mainWindow.send('item:theme',settings.get('theme'));
    });
  }
}
//end createWindow

//Event handler
ipcMain.on('main:closed', function (e, item) {   
  app.quit();
});
ipcMain.on('main:login-view', function(e){
  dbread();
  console.log(`${__dirname}`);
  mainWindow.loadURL(`file:${__dirname}/renderer/loginwindow.html`);
})
ipcMain.on('main:register-view', function(e){
  mainWindow.loadURL(`file:${__dirname}/renderer/registerwindow.html`);
})
ipcMain.on('main:register', function(e, item){
  registerEmailCheck(e, item['e-mail']);
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(item['password'], salt);
  item['password'] = hash;
  item['created_date'] = new Date().toISOString().slice(0,10);
  addUser(item);
});
ipcMain.on('main:login', function(e,item){
  login(e, item);
});
ipcMain.on('main:logout', function(){
  logout();
});
//page-event
ipcMain.on('page:add', function(e,item){
  addPage(e,item);
  dbreadpage();
});
ipcMain.on('page:delete', function(e,id){
  deletePage(id);
});
ipcMain.on('page:update', function(e,item){
  dbupdate(item);
});
ipcMain.on('document:call_data', function(e,item){
  loadfile(item);
});
ipcMain.on('file:add', function(e,item){
  savefile(item);
});
ipcMain.on('file:delete', function(e,id){
  deletefile(id);
});
app.on('ready', createWindow)


//Database
async function dbread() {
  try {
    let result = await knex.select().from("users")
    if (!result) {
      console.log('no data');
    }
  } catch (error) {
    if(error.errno === 19){
      e.sender.send('register:check-email');
    }
  }
}
//read page
async function dbreadpage() {
  try {
    let result = await knex.select(
        'pages.id',
        'title',
        knex.ref('pages.created_date').as('created_date')
    ).from("users")
    .leftJoin('pages', 'users.id', 'pages.user_id')
    .where('users.id', settings.get('user_id'));
    if (!result) {
      console.log('no data');
    }
    mainWindow.send("page:load-data", result);
  } catch (error) {
    console.log(error);
  }
}
//update page
async function dbupdate(item) {
  try {
    let result = await knex('pages')
    .where('id', '=', item.page_id)
    .update({title:item.title, description:item.description})
    if (!result) {
      console.log('no data');
    }
    dbreadpage();
    loadfile(item.page_id);
  } catch (error) {
    console.log(error);
  }
}
//read file
async function loadfile(page_id) {
  try {
    let result = await knex.select(
        'title',
        'pages.id',
        'files.id as file_id',
        'description',
        'file_name',
        'file_path',
        knex.ref('pages.created_date').as('created_date')
    ).from("pages")
    .leftJoin('files', 'pages.id', 'files.page_id')
    .where('pages.id',page_id);
    if (!result) {
      console.log('no data');
    }
    mainWindow.send("document:load-data", result);
  } catch (error) {
    console.log(error);
  }
}
//save file
async function savefile(item) {
  try {
    item['created_date'] = new Date().toISOString().slice(0,10);
    let result = await knex.insert(item).from('files')
    if (!result) return console.log('can\t insert data');
    loadfile(item['page_id']);
  } catch (error) {
   
  }
}
//delete file
async function deletefile(file_id) {
  try {
    let result = await knex('files').where('id', file_id).del();
  } catch (error) {
  }
}
//delete Page
async function deletePage(page_id) {
  try {
    let result = await knex('pages').where('id', page_id).del();
  } catch (error) {
  }
}
async function registerEmailCheck(e, email){
  try {
    let result = await knex.select().from("users").where('e-mail', email);
     if(result.length === 1) {
      e.sender.send("register:check-email");
     }
  } catch (error) {
    console.log(error);
  }
}
async function addUser(item) {
  try {
    let result = await knex('users').insert(item);
    if (!result) return console.log('can\t insert data');
    mainWindow.loadURL(`file:${__dirname}/renderer/loginwindow.html`);
  } catch (error) {
    console.log(error);
  }
}
//page function
async function addPage(e,item){
  try {
    item['user_id'] = settings.get('user_id');
    item['created_date'] = new Date().toISOString().slice(0,10);
    let result = await knex.insert(item).from('pages')
    if (!result) return console.log('can\t insert data');
  } catch (error) {
    console.log(error);
  }
}
//login function
async function login(e,item) {
  try {
    let result = await knex.select().from("users").where('e-mail', item['e-mail']);
    if (!result) return console.log('nodata');
    if(!bcrypt.compareSync(item['password'], result[0]['password']))  e.sender.send("login:check-password");
    const token = jwt.sign({password: result[0]['password'], email: result[0]['e-mail']}, process.env.JWT_SECRET);
    settings.set('token', token);
    settings.set('user_id', result[0]['id']);
    mainWindow.loadURL(`file:${__dirname}/renderer/viewerwindow.html`);
  } catch (error) {
    console.log(error);
  }
}
function logout(){
  settings.set('token', '');
  settings.set('user_id', '');
  mainWindow.loadURL(`file:${__dirname}/renderer/loginwindow.html`);
}

