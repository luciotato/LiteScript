//Compiled by LiteScript compiler v0.6.3, source: test-v0.6/event-emitter/doors.lite.md
   var events = require('events');

   //class Door extends events.EventEmitter
   //constructor
     function Door(color){
      //properties
        //color, isOpen
       this.color = color;
     };
   //Door (extends|proto is) events.EventEmitter
   Door.prototype.__proto__ = events.EventEmitter.prototype;

     //method open
     Door.prototype.open = function(){
       this.isOpen = true;
       this.emit('open');
     };

     //method close(force)
     Door.prototype.close = function(force){
       this.isOpen = false;
       this.emit('close', force);
     };

     //method show
     Door.prototype.show = function(){
       console.log('the ' + this.color + ' door is ' + (this.isOpen ? "open" : "closed"));
     };
   //end class Door


//Test


   var frontDoor = new Door('brown');

   frontDoor.on('open', function (){
       console.log('ring ring ring');
   });

   frontDoor.on('close', function (){
        //declare this:Door
       console.log('the ' + this.color + ' door closes');
   });

   frontDoor.on('close', function (force){
       //if force>5, print 'with a slam'
       if (force > 5) {
           console.log('with a slam')};
   });


   //with frontDoor
   var _with1=frontDoor;
       _with1.show();
       _with1.open();
       _with1.show();
       _with1.close();
       _with1.show();
       _with1.open();
       _with1.show();
       _with1.close(7);
       _with1.show();
   ;

//Test 2

   //global import http
   var http = require('http');

   console.log('checkip.dyndns.org');

   http.get({host: 'checkip.dyndns.org'}, function (res){

       var data = '';

       res.on('data', function (chunk){
           data += chunk.toString();
       });

       res.on('end', function (){
           console.log(data);
       });
   });
