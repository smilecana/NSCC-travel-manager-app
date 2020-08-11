// const { ipcRenderer } = electron;

function showImage() { 
  var random = Math.round(Math.random() * 100); 
  var bg = document.getElementsByTagName("body")[0]; 
  console.log(bg);
  bg.style.backgroundImage = `url("https://picsum.photos/id/${random}/800/600")`;
  setTimeout(showImage, 100000); 
}

setTimeout(showImage, 100000);
