
    global import nicegen 

    var failedCount=0

    function expect(a,b)
        var as = JSON.stringify(a)
        var bs = JSON.stringify(b)
        print ""
        if as isnt bs
            print "FAILED!"
            failedCount++
        else
            print "OK"
        print '    expected:',as
        print '    result:',bs
        
    // ----------------------
    // OBJECT TESTS ---------
    // ----------------------
    class TestObj

        properties value,pong

        constructor (value,pong)
            this.value = value;
            this.pong = pong;
    

        method think (callback)

            //console.log('thinking...');
            
            var self=this;
            // callback after 1.5 secs
            
            setTimeout -> return callback(null, 'the answer is: '+self.value)
                , Math.floor(Math.random()*400)+200

        method pingPong (ping,callback)
            // callback before return
            callback(null, ping+'...'+this.pong);


    var theAnswer = new TestObj(42,'ping');
    var theWrongAnswer = new TestObj(1000,'pong');

    // ----------
    // RUN TESTS 
    // ----------
    nice function runTests

        expect yield until theAnswer.think(), "the answer is: 42"
        expect yield until theWrongAnswer.think(), "the answer is: 1000"
        
        expect yield until theAnswer.pingPong('the machine that goes'), 'the machine that goes...ping'
        expect yield until theWrongAnswer.pingPong('ping'), 'ping...pong'

    end function

    // MAIN

    runTests -> err,data
        print "End"
        if err or failedCount
            print "failedCount:",failedCount
            process.exit 1


