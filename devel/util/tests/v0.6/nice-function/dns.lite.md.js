//Compiled by LiteScript compiler v0.6.3, source: test-v0.6/nice-function/dns.lite.md

   //global import dns, nicegen
   var dns = require('dns');
   var nicegen = require('nicegen');


// ----------------------
// DNS TESTS ------------
// ----------------------

//#####Example 1 - get google.com DNS and reverse DNS

   //nice function resolveAndReverse(domain)
   function resolveAndReverse(){
     nicegen(this, resolveAndReverse_generator, arguments);
   };
   function* resolveAndReverse_generator(domain){

       //try
       try{

           console.log(domain, "sequential resolveAndReverse");

           var addresses = yield [ dns, 'resolve', domain ];

           //for each addr in addresses
           for( var addr__inx=0,addr ; addr__inx<addresses.length ; addr__inx++){addr=addresses[addr__inx];
               console.log("" + addr + ", and the reverse for " + addr + " is " + (yield [ dns, 'reverse', addr ]));
           };//end for each in addresses
           
       
       }catch(err){
           console.log("sequential resolveAndReverse", err.stack);
       };
   };

   //end nice function


//#####Example 2 - Same, with parallel reverse

   //nice function parallelResolveAndReverse(domain)
   function parallelResolveAndReverse(){
     nicegen(this, parallelResolveAndReverse_generator, arguments);
   };
   function* parallelResolveAndReverse_generator(domain){

       //try
       try{

           console.log(domain, "parallel resolveAndReverse");

           var addresses = yield [ dns, 'resolve', domain ];

           var results = yield [ 'map', addresses, dns, 'reverse' ];

           //for each index,addr in addresses
           for( var index=0,addr ; index<addresses.length ; index++){addr=addresses[index];
               console.log("" + addr + ", and the reverse for " + addr + " is " + (results[index]));
           };//end for each in addresses
           
       
       }catch(err){
           console.log("parallel resolveAndReverse", err.stack);
       };
   };

   //end nice function



    // ----------------------
    // OBJECT TESTS ---------
    // ----------------------
   //class TestObj
   //constructor
       function TestObj(value, pong){
        //properties value,pong
           this.value = value;
           this.pong = pong;
       };


       //method think (callback)
       TestObj.prototype.think = function(callback){

           console.log('thinking...');

           var self = this;
            // callback after 1.5 secs

           setTimeout(function (){return callback(null, 'the answer is: ' + self.value)}, Math.floor(Math.random() * 400) + 200);
       };

       //method pingPong (ping,callback)
       TestObj.prototype.pingPong = function(ping, callback){
            // callback before return
           callback(null, ping + '...' + this.pong);
       };
   //end class TestObj


   var theAnswer = new TestObj(42, 'tomeito');
   var theWrongAnswer = new TestObj('a thousand', 'tomatito');


    // ----------
    // RUN TESTS
    // ----------
   //nice function runTests
   function runTests(){
     nicegen(this, runTests_generator, arguments);
   };
   function* runTests_generator(){

       console.log('----------------------------------');
       console.log('T1: PARALLEL Resolve And Reverse');
       console.log('T2: sequential Resolve And Reverse');
       console.log('T3: class method test');
       console.log('--------------------------------');
       console.log('.');
       console.log('.');

       console.log('start');

       console.time('PARALLEL Resolve And Reverse');
       //yield until parallelResolveAndReverse 'google.com'
       yield [ null, parallelResolveAndReverse, 'google.com' ];
       console.timeEnd('PARALLEL Resolve And Reverse');

       console.time('sequential Resolve And Reverse');
       //yield until resolveAndReverse 'google.com'
       yield [ null, resolveAndReverse, 'google.com' ];
       console.timeEnd('sequential Resolve And Reverse');

       console.log(yield [ theAnswer, 'think' ]);
       console.log(yield [ theWrongAnswer, 'think' ]);

       console.log(yield [ theAnswer, 'pingPong', 'tomato' ]);
       console.log(yield [ theWrongAnswer, 'pingPong', 'pera' ]);
   };

   //end function

    // MAIN

   runTests();

//    //ASYNC CALLED
//    console.log('start');
//    console.time('Resolve And Reverse');
//    resolveAndReverse('google.com',function(err,data){
//        console.timeEnd('Resolve And Reverse');
//        if(err){console.log(err)}
//        else{if(data)console.log(data)};
//    });
//    console.time('PARALLEL Resolve And Reverse');
//    parallelResolveAndReverse('google.com',function(err,data){
//        console.timeEnd('PARALLEL Resolve And Reverse');
//        if(err){console.log(err)}
//        else{if(data)console.log(data)};
//    });
//    console.log('after call');
//    
