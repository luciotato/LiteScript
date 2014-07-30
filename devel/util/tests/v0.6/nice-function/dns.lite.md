
    global import dns, nicegen


// ----------------------
// DNS TESTS ------------
// ----------------------

#####Example 1 - get google.com DNS and reverse DNS

    nice function resolveAndReverse(domain)

        try 

            print domain,"sequential resolveAndReverse"

            var addresses:array = yield until dns.resolve domain

            for each addr in addresses
                print "#{addr}, and the reverse for #{addr} is #{yield until dns.reverse addr}"

        catch err
            print "sequential resolveAndReverse", err.stack

    end nice function


#####Example 2 - Same, with parallel reverse

    nice function parallelResolveAndReverse(domain)

        try

            print domain, "parallel resolveAndReverse"

            var addresses:array = yield until dns.resolve domain

            var results = yield parallel map addresses dns.reverse 

            for each index,addr in addresses
                print "#{addr}, and the reverse for #{addr} is #{results[index]}"

        catch err
            print "parallel resolveAndReverse", err.stack

    end nice function



    // ----------------------
    // OBJECT TESTS ---------
    // ----------------------
    class TestObj

        properties value,pong

        constructor (value,pong)
            this.value = value;
            this.pong = pong;
    

        method think (callback)

            console.log('thinking...');
            
            var self=this;
            // callback after 1.5 secs
            
            setTimeout -> return callback(null, 'the answer is: '+self.value)
                , Math.floor(Math.random()*400)+200

        method pingPong (ping,callback)
            // callback before return
            callback(null, ping+'...'+this.pong);


    var theAnswer = new TestObj(42,'tomeito');
    var theWrongAnswer = new TestObj('a thousand','tomatito');


    // ----------
    // RUN TESTS 
    // ----------
    nice function runTests

        console.log('----------------------------------');
        console.log('T1: PARALLEL Resolve And Reverse');
        console.log('T2: sequential Resolve And Reverse');
        console.log('T3: class method test');
        console.log('--------------------------------');
        console.log('.');
        console.log('.');

        console.log('start');

        console.time('PARALLEL Resolve And Reverse');
        yield until parallelResolveAndReverse 'google.com'
        console.timeEnd('PARALLEL Resolve And Reverse');

        console.time('sequential Resolve And Reverse');
        yield until resolveAndReverse 'google.com'
        console.timeEnd('sequential Resolve And Reverse');

        console.log(yield until theAnswer.think());
        console.log(yield until theWrongAnswer.think());
        
        console.log(yield until theAnswer.pingPong 'tomato');
        console.log(yield until theWrongAnswer.pingPong 'pera');

    end function

    // MAIN

    runTests();

    /*
    //ASYNC CALLED
    console.log('start');

    console.time('Resolve And Reverse');
    resolveAndReverse('google.com',function(err,data){
        console.timeEnd('Resolve And Reverse');
        if(err){console.log(err)}
        else{if(data)console.log(data)};
    });

    console.time('PARALLEL Resolve And Reverse');
    parallelResolveAndReverse('google.com',function(err,data){
        console.timeEnd('PARALLEL Resolve And Reverse');
        if(err){console.log(err)}
        else{if(data)console.log(data)};
    });

    console.log('after call');
    */
