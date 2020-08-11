const electron = require('electron');
const { remote, ipcRenderer } = electron;
$(document).ready(function () {
  $(".dropdown-trigger").dropdown({
    coverTrigger: false,
    gutter: ($('.dropdown-content').width() * 3) / 2.5 + 5, // Spacing from edge
    alignment: 'left' // Displays dropdown with edge aligned to the left of button
  });
  $('.dropdown-menu').on('click', function (e) {
    e.stopPropagation();
  });
  $('.sidenav').sidenav();
  $('#min-btn').on('click', function (e) {
    var window = remote.BrowserWindow.getFocusedWindow();
    window.minimize();
  });
  $('#close-btn').on('click', function (e) {
    var window = remote.BrowserWindow.getFocusedWindow();
    window.close();
  });
  $('#close-window').on('click', function (e) {
    var window = remote.BrowserWindow.getFocusedWindow();
    window.close();
  });
  $("#logout-window").on('click', () => {
    ipcRenderer.send('main:logout');
  });
  $('.modal').modal();
  //Pages function 
  //~ add-page
  $("#btn-add-page").on('click', () => {
    if ($('#add-page-title').val() !== '') {
      let obj = {};
      obj['title'] = $('#add-page-title').val();
      $("#add-page-title").val('');
      ipcRenderer.send('page:add', obj);
      $('#list-menu-block').css("display", "block");
    } else {
      $("#add-page-title").removeClass("valid");
      $("#add-page-title").addClass("invalid");
    }
  });

  //add file
  $("#btn-add-file").on('click', () => {
    let file = document.getElementById("file").files[0];
    let nObj = {};
    if(file!==undefined){
      nObj['file_name'] = file.name;
      nObj['file_path'] = file.path;
      nObj['page_id'] = $('#page_id').val();
    }
    if (nObj === {}) return;
    ipcRenderer.send('file:add', nObj);
    $("#file").val('');
  });
//add page
  $("#update_page").on('click', () => {
    $("#update_page").removeClass("modal-close");
    if($("#page_title").val()===''){
      $("#page_title").removeClass("valid");
      $("#page_title").addClass("invalid");
      $("#page_title").focus();
    }else{
      let nObj = {};
      nObj['title'] = $("#page_title").val();
      nObj['description'] = $('textarea#page_description').val();
      nObj['page_id'] = $('#page_id').val();
      $("#update_page").addClass("modal-close");
      ipcRenderer.send('page:update', nObj);
    }
  });
  ipcRenderer.on('page:load-data', function (e, data) {
    const pages = document.getElementById('pages');
    pages.innerHTML = "";
    data.forEach((item, idx) => {
      let li = document.createElement('li');
      let span1 = document.createElement('span');
      span1.setAttribute('id', item.id);
      span1.addEventListener('click', load_document);
      span1.classList = 'link';
      span1.innerText = item.title;
      let span2 = document.createElement('span');
      let a = document.createElement('a');
      a.setAttribute('id', item.id);
      a.addEventListener('click', delete_page);
      a.innerText = 'x';
      span2.appendChild(a);
      li.appendChild(span1);
      li.appendChild(span2);
      li.className = "collection-item page-list";
      pages.appendChild(li);
    })
  });
  ipcRenderer.on('document:load-data', function (e, data) {
    $(".list-menu-block").children('#page_id').val(data[0].id);
    $(".list-menu-block").children('h5').text(data[0].title);
    $(".list-menu-block").children('p').text(data[0].description);
    $("#page_title").val(data[0].title);
    $("#page_description").text(data[0].description);
    $(".files").empty();
    data.forEach(item => {
      let li = $('<li>');
      li.addClass('collection-item document-list');
      let name = $('<span>');
      let view = $('<a>');
      let del = $('<a>');
      if (item.file_path !== null) {
        name.attr('id', 'document-title');
        name.text(item.file_name);
        view.attr('id', item.file_id);
        del.attr('id', item.file_id);
        view.bind('click', function () {
          $('#file_name').text(item.file_name);
          $('#image').attr("src", item.file_path);
          $('#viewer-idx').val(item.file_id);
          $('.viewer').show();
        });
        view.append('<i class="material-icons">search</i>');
        del.append('<i class="material-icons">delete</i>');
        del.bind('click', function (e) {
          e.target.parentElement.parentElement.remove();
          ipcRenderer.send('file:delete', e.target.parentElement.id);
          if(e.target.parentElement.id === $('#viewer-idx').val()){
            $('.viewer').hide();
          }
        });
        name.append([view, del]);
        li.append(name);
        $(".files").append(li);
        $('.files').show();
      }
    });
  });
 
  var events = [
    { 'Date': new Date(2019, 11, 14), 'Title': 'Doctor appointment at 3:25pm.' },
    { 'Date': new Date(2019, 11, 15), 'Title': 'New Garfield movie comes out!', 'Link': 'https://garfield.com' },
    { 'Date': new Date(2019, 11, 16), 'Title': '25 year anniversary', 'Link': 'https://www.google.com.au/#q=anniversary+gifts' },
  ];
  var settings = {};
  var element = document.getElementById('caleandar');
  var load_document = (e) => {
    ipcRenderer.send('document:call_data', e.target.id);
    $('#list-menu-block').css("display", "block");
    $('#file_name').text(" ");
    $('#viewer-idx').val("");
    $('.viewer').hide();
  }
  var delete_page = (e) => {
    e.target.parentElement.parentElement.remove();
    ipcRenderer.send('page:delete', e.target.id);
      $('.viewer').hide();
  }
  caleandar(element, events, settings);

   
});