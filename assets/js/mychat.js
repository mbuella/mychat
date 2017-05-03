$(function () {

  var codename = '';
  var typing = false;
  var timeout = undefined;
  var currMsgs = {};

  //select name input
  $('#codename').focus();

  //open modal on load
  $('#infoModal').modal('show');

  $('#codename-form').on('submit',function(e){
    e.preventDefault();

    codename = $('#codename').val();
    if(codename.trim().length < 1)
      return false;


    /*** FORM LISTENERS ***/

    // listener for form
    $('#msg-form').submit(function(e){
      e.preventDefault();

      var msg_txt = $('#msg-box').val();
      if(msg_txt.trim().length < 1)
      return false;

      //send msg to server
      socket.emit('chat message', msg_txt);

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
        socket.emit('chat typing',true);  
      }
      else {
        clearTimeout(timeout);
      }

      timeout = setTimeout(
        function() {
          typing = false;
          socket.emit('chat typing',false);              
        },5000
      );

    });

    $('#msg-box').on('focusout',function(){
        socket.emit('chat typing',false);                
        typing = false;
    });


    /*** SOCKETS LISTENERS ***/

    var socket = io();

    //messages listener
    socket.on('chat message', function(msg){
      // just replace the loading placeholder with the new message
      currMsgs[msg.cn].find('.loading').replaceWith(msg.text);

      //remember to delete
      delete currMsgs[msg.cn];

      scrollToMsg(currMsgs[msg.cn]);
    });

    //new joiners listener
    socket.on('chat intro', function(codename){
        $('#msg-board .panel').append(
          $('<div>').addClass('text-center member-info')
            .html($('<strong>').text(codename))
            .append(' has joined the chat.')
        );            
    });

    //typing member listener
    socket.on('chat typing',function(member){
      if (!member.typing) {
          //remove the message
          console.log('not typing')
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

    //members who leave listener
    socket.on('chat leave', function(codename){
        $('#msg-board .panel').append(
          $('<div>').addClass('text-center member-info')
            .html($('<strong>').text(codename))
            .append(' has left the chat.')
        );            
    });


    /*** CUSTOM FUNCTIONS ***/

    //scrolldown function
    function scrollToMsg(target) {  
      $('#msg-board').animate({
        scrollTop: $('#msg-board').prop("scrollHeight")
      }, 2000);
    }


    /*** EXECUTION STARTS HERE ***/

    socket.emit('chat intro', codename);

    $('#infoModal').modal('hide');

    //greeting to the user
    $('#msg-board .panel').append(
      $('<div>').addClass('text-center member-info')
          .text('Welcome to the group, ')
          .append($('<strong>').text(codename))
          .append('!')
    );

    $('#msg-box').focus();

  });
});