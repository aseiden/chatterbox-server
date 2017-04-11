class Chatterbox {
  constructor(value) {
    this.name = value;
    this.server = 'http://127.0.0.1:3000/classes/messages';
    //this.SEARCH_PARAMS = '?order=-createdAt&limit=1000';
    this.friends = [];
    this.lastFetchedAt;
  }

  init () {
    var thisObj = this;
    console.log(thisObj);
    console.log(this);
    this.fetch(function(data) {
      console.log(data)
      console.log('hello')
      // Initialize app to lobby messages
      thisObj.renderRooms(data, 'lobby');
      thisObj.renderMessages(data, 'lobby');


      // Select a different room
    $('#roomSelect').change(function() {
      thisObj.clearMessages();
      thisObj.getNewMessages($(this).val());
      $('.room-form').hide();
      if ($(this).val() === '- Add new room -') {
        $('.room-form').show();
      }
    });

      // Send chat message
    $('body').on('click', '.chat-submit', function() {
      var message = {
        username: window.localStorage.username,
        message: $('.chat-input').val(),
        roomname: $('#roomSelect').val()
      }
      console.log(message);
      thisObj.send(message);
      $('.chat-input').val('');
    })

      // Create new room
    $('body').on('click', '.room-submit', function() {
      var message = {
        username: window.localStorage.username,
        message: `This room was created by ${window.localStorage.username} at ${new Date()}!`,
        roomname: $('.room-input').val()
      }
      thisObj.send(message);
      $('.room-input').val('');
      $('.room-form').hide();
      $('.chat-input').focus();
    })

      // Add and remove user from friend list
    $('body').on('click', '.username', function() {
      var username = $(this).text();
      if (thisObj.friends.includes(username)) {
        var userIndex = thisObj.friends.indexOf(username);
        thisObj.friends.splice(userIndex, 1);
      } else {
        thisObj.friends.push(username);
      }

      thisObj.clearMessages();
      thisObj.getNewMessages($('#roomSelect').val());

      console.log(JSON.stringify(thisObj.friends));
    });

      // Prevent form submits from refreshing page
    $('body').on('click', 'form', function(event) {
      event.preventDefault();
    });

    });
    // , thisObj.SEARCH_PARAMS);
  }

  send (message) {
    var thisObj = this;
    $.post(this.server, JSON.stringify(message), function(data) {
      thisObj.getNewMessages(message.roomname);
    });
  }

  fetch (successCallback, urlCode = '') {
    var thisObj = this;
    $.get(this.server /*+ this.SEARCH_PARAMS*/, successCallback);
  }

  getNewMessages (room) {
    var thisObj = this;
    thisObj.clearMessages();
    this.fetch(function(data) {
      console.log(data);
      thisObj.renderRooms(data, room);
      thisObj.renderMessages(data, room);
    });
    // , thisObj.SEARCH_PARAMS);
  }

  renderMessages (response, room) {
    var thisObj = this;

    var filteredMessages = response.results.filter(function(message) {
      if (message.roomname === room) {
        return true;
      } else {
        return false;
      }
    });

    filteredMessages.forEach(function(message) {
      console.log(message);
      thisObj.renderMessage(message);
    });
  }

  clearMessages () {
    $('#chats').children().remove();
  }

  renderMessage (message) {
    var user = $('<span class="username"></span>').text(`${message.username}`);
    var post = $('<p></p>').text(`: ${message.message}`).prepend(user);
    if (this.friends.includes(message.username)) {
      post.addClass('friend')
    }

    $('#chats').append(post);
  }

  renderRoom (room, desiredRoom) {
    $('#roomSelect').append(`<option value="${room}">${room}</option>`);
    if (room === desiredRoom) {
      $('#roomSelect').val(desiredRoom);
    }
  }

  renderRooms (response, desiredRoom) {
    $('#roomSelect').children().remove();
    var thisObj = this;

    var responseRooms = _.uniq(response.results.map(function(message) {
      return message.roomname;
    }));

    responseRooms.forEach(function(room) {
      thisObj.renderRoom(room, desiredRoom);
    });
    this.renderRoom('- Add new room -', desiredRoom);
  }
}

var app = new Chatterbox('alex');
app.init();
