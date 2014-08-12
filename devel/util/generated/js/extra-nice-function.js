    //import nicegen
    var nicegen = require('./../interfaces/nicegen.js');

    //var failedCount=0
    var failedCount = 0;

    //function expect(a,b)
    function expect(a, b){
        //var as = JSON.stringify(a)
        var as = JSON.stringify(a);
        //var bs = JSON.stringify(b)
        var bs = JSON.stringify(b);
        //print ""
        console.log("");
        //if as isnt bs
        if (as !== bs) {
        
            //print "FAILED!"
            console.log("FAILED!");
            //failedCount++
            failedCount++;
        }
        //if as isnt bs
        
        else {
            //print "OK"
            console.log("OK");
        };
        //print '    expected:',as
        console.log('    expected:', as);
        //print '    result:',bs
        console.log('    result:', bs);
    };

    // ----------------------
    // OBJECT TESTS ---------
    // ----------------------
    //class TestObj
    // constructor
    function TestObj(value, pong){
        //properties value,pong
            //this.value = value;
            this.value = value;
            //this.pong = pong;
            this.pong = pong;
        };


        //method think (callback)
        TestObj.prototype.think = function(callback){

            //console.log('thinking...');

            //var self=this;
            var self = this;
            // callback after 1.5 secs

            //setTimeout
                //function = callback(null, 'the answer is: '+self.value)
                //, Math.floor(Math.random()*400)+200

        //method pingPong (ping,callback)
            setTimeout(callback(null, 'the answer is: ' + self.value), Math.floor(Math.random() * 400) + 200);
        };

        //method pingPong (ping,callback)
        TestObj.prototype.pingPong = function(ping, callback){
            // callback before return
            //callback(null, ping+'...'+this.pong);
            callback(null, ping + '...' + this.pong);
        };
    // end class TestObj


    //var theAnswer = new TestObj(42,'ping');
    var theAnswer = new TestObj(42, 'ping');
    //var theWrongAnswer = new TestObj(1000,'pong');
    var theWrongAnswer = new TestObj(1000, 'pong');

    // ----------
    // RUN TESTS
    // ----------
    //nice function runTests
    function runTests(__callback){
      nicegen.run(this, runTests_generator, arguments);
    };
    function* runTests_generator(){

        //expect yield until theAnswer.think(), "the answer is: 42"
        expect(yield [ theAnswer, 'think' ], "the answer is: 42");
        //expect yield until theWrongAnswer.think(), "the answer is: 1000"
        expect(yield [ theWrongAnswer, 'think' ], "the answer is: 1000");

        //expect yield until theAnswer.pingPong('the machine that goes'), 'the machine that goes...ping'
        expect(yield [ theAnswer, 'pingPong', 'the machine that goes' ], 'the machine that goes...ping');
        //expect yield until theWrongAnswer.pingPong('ping'), 'ping...pong'
        expect(yield [ theWrongAnswer, 'pingPong', 'ping' ], 'ping...pong');
    };

    //end function

    // MAIN

    //runTests -> err,data
    

    // MAIN

    //runTests -> err,data
        //print "End"
        //if err or failedCount
            //print "failedCount:",failedCount
            //process.exit 1
    runTests(function (err, data){
        //print "End"
        console.log("End");
        //if err or failedCount
        if (err || failedCount) {
        
            //print "failedCount:",failedCount
            console.log("failedCount:", failedCount);
            //process.exit 1
            process.exit(1);
        };
    });
