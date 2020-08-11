const electron = require('electron');
 const { ipcRenderer } = electron;
$(document).ready(function(){
  $("#register").on('click',()=>{
    ipcRenderer.send('main:register');
  });
});
function showImage() { 
  var random = Math.round(Math.random() * 100); 
  var bg = document.getElementsByTagName("body")[0]; 
  console.log(bg);
  bg.style.backgroundImage = `url("https://picsum.photos/id/${random}/800/600")`;
  setTimeout(showImage, 100000); 
}

setTimeout(showImage, 100000);
