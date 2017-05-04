$(function () {

  var codename = '';
  var typing = false;
  var timeout = undefined;
  var currMsgs = {};

  var socket = io('/public-chat');

  //open modal on load
  $('#infoModal').modal('show');

  //select name input
  $('#codename').focus();

  //we need to listen for <enter> keypress
  //since we have multiple inputs and submitting
  //our form by <enter> will not work anymore.
  $("#codename-form input").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        $('#codename-form').submit();
    }
  });

  $('#codename-form').on('submit',function(e){
    e.preventDefault();

    codename = $('#codename').val();
    topic = $('#topic').val();

    if(codename.trim().length < 1 ||
      topic.trim().length < 1)
      return false;



    /*** FORM LISTENERS ***/

    // listener for form
    $('#msg-form').submit(function(e){
      e.preventDefault();

      var msg_txt = $('#msg-box').val();
      if(msg_txt.trim().length < 1)
        return false;

      //send msg to server
      socket.emit('room message', msg_txt);

      //
      var myMsg = $('<div>').addClass('my-msg')
                  .append(
                    $('<div>').addClass('alert alert-info pull-right')
                              .append(
                                $('<div>').addClass('label label-success cn-id')
                                  .text('you')
                              )
                              .append(msg_txt)
                  )
                  .append($('<div>').addClass('clearfix'));

      //create a right-pos callout for the message
      $('#msg-board .panel').append(myMsg);

      scrollToMsg(myMsg);
      
      //empty the input
      $('#msg-box').val('');
      //blur and focus to restart typing
      $('#msg-box').blur().focus();

    });

    //typing member inform server
    $('#msg-box').on('keyup keypress',function(){

      if(!typing && $('#msg-box').val().length > 0) {
        typing = true;
        //send info to server
        socket.emit('room typing',true);  
      }
      else {
        clearTimeout(timeout);
      }

      timeout = setTimeout(
        function() {
          typing = false;
          socket.emit('room typing',false);  
        },5000
      );

    });

    $('#msg-box').on('focusout',function(){
        socket.emit('room typing',false);  
        typing = false;
    });

    //member leave chat request
/*    $('#leave-chat').on('click',function(){
        socket.emit('chat leave');
    });*/


    /*** SOCKETS LISTENERS ***/

    var socket = io('/public-chat');

    //room name listener
    socket.on('room name',function(room){      
      $('#room-tag > h1').text(room);

      //greeting to the user
      $('#msg-board .panel').append(
        $('<em>').append(
          $('<div>').addClass('text-center member-info')
              .html('Welcome to OpenChat, ')
              .append($('<strong>').text(codename))
              .append('! <br>You are now part of the ')
              .append($('<strong>').text(room))
              .append(' room.')
        )
      );

      console.log(codename + ' ' + room);
      
    });

    //messages listener
    socket.on('room message', function(msg){
      // just replace the loading placeholder with the new message
      currMsgs[msg.cn].find('.loading').replaceWith(msg.text);

      //remember to delete
      delete currMsgs[msg.cn];

      scrollToMsg(currMsgs[msg.cn]);
    });

    //new joiners listener
    socket.on('room join', function(codename){
        $('#msg-board .panel').append(
          $('<em>').append(
            $('<div>').addClass('text-center member-info')
              .html($('<strong>').text(codename))
              .append(' has joined the chat.')
          )
        );
    });

    //typing member listener
    socket.on('room typing',function(member){
      if (!member.typing) {
          //remove the message
          if(member.cn in currMsgs)
            currMsgs[member.cn].remove();
      }
      else {
        currMsgs[member.cn] = $('<div>').addClass('his-msg')
              .append(
                $('<div>').addClass('alert alert-warning pull-left')
                          .append(
                            $('<div>').addClass('label label-default cn-id')
                              .text(member.cn)
                          )
                          .append(
                            $('<span>').addClass('loading')
                          )
              )
              .append($('<div>').addClass('clearfix'));

        $('#msg-board .panel').append(currMsgs[member.cn]);
      }

    });

    //members who is disconnected listener
    socket.on('room disconnect', function(codename){
        $('#msg-board .panel').append(
          $('<em>').append(
            $('<div>').addClass('text-center member-info')
              .html($('<strong>').text(codename))
              .append(' has been disconnected from the chat.')
          )
        );
    });

    //members who leave listener
/*    socket.on('chat leave', function(){
        $('#msg-board .panel').append(
          $('<em>').append(
            $('<div>').addClass('text-center member-info')
              .html($('<strong>').text(codename))
              .append(' has left the chat.')
          )
        );
    });*/


    /*** CUSTOM FUNCTIONS ***/

    //scrolldown function
    function scrollToMsg(target) {  
      $('#msg-board').animate({
        scrollTop: $('#msg-board').prop("scrollHeight")
      }, 2000);
    }


    /*** EXECUTION STARTS HERE ***/

    //join the requested room
    socket.emit('room join', {
      'cn': codename,
      'room': topic
    });

    $('#infoModal').modal('hide');

    $('#msg-box').focus();

  });
});