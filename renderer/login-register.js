const electron = require('electron');
const { ipcRenderer } = electron;


$(document).ready(function () {
  $("#call-register-form").on('click', () => {
    ipcRenderer.send('main:register-view');
  });
  $("#register").on('click', () => {
    if (!validateEmail($('#email').val())) {
      $("#email").next("label").attr('data-error','Wrong email');
    } else {
      let obj = {};
      obj['e-mail'] = $('#email').val();
      obj['password'] = $('#password').val();
      ipcRenderer.send('main:register', obj);
    }
  });
  $("#login").on('click', () => {
    if (!validateEmail($('#email').val())) {
      $("#email").next("label").attr('data-error','Wrong email');
    } else {
      let obj = {};
      obj['e-mail'] = $('#email').val();
      obj['password'] = $('#password').val();
      ipcRenderer.send('main:login', obj);
    }
  });
  $('#cancel').on('click', () => {
    ipcRenderer.send('main:login-view');
  });
  ipcRenderer.on('register:check-email', function (e) {
    $("#email").addClass("invalid");
    $("label[for='email']")[0].dataset.error = "This user already exists.";
  });
  ipcRenderer.on('login:check-password', function (e) {
    $("#password").addClass("invalid");
    $("label[for='password']")[0].dataset.error = "Password is miss match";
  });
});
function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test($email);
}
function showImage() {
  var random = Math.round(Math.random() * 100);
  var bg = document.getElementsByTagName("body")[0];
  bg.style.backgroundImage = `url("https://picsum.photos/id/${random}/1200/800")`;
  setTimeout(showImage, 100000);
}

setTimeout(showImage, 100000);

