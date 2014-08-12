##nicegen - based on ES6-harmony generators 

- Support Lib for LiteScript
- Copyright 2014 Lucio Tato

-- WARNING: bleeding edge --
This lib use  ECMAScript 6 generators, 
the next version of the javascript standard, code-named "Harmony".
(release target date December 2013).

This lib also uses bleeding edge v8 Harmony features, so you’ll need to
use a (today) -unstable- nodejs version >= v0.11.6 
and also pass the --harmony flag when executing node.

  node --harmony test/test


    public function run(thisValue, generatorFn:function, args:array) // wait.launchFiber(fn,arg1,arg2...)

        //console.log(Array.prototype.slice.call(arguments));
        
        // starts a generator (emulating a fiber)

        //console.log('nicegen',arguments);

        // checks
        if typeof generatorFn isnt 'function' 
            //console.log(arguments);
            throw new Error('second argument must be a generator, not '+(typeof generatorFn));
        

        var lastArg = args.length-1;
        var finalCallback = args[lastArg];

        if typeof finalCallback isnt 'function'

            //if no callback, create a default
            finalCallback = -> err,data
                                if err, throw err
            lastArg++
        

        // if callback; remove final callback from arguments. The generator does not receive the callback
        var generatorArgs = Array.prototype.slice.call(args,0,lastArg)

        // create the iterator
        var thisIterator = generatorFn.apply(thisValue, generatorArgs); // create the iterator. 
                           // Note: calling a generator function, DOES NOT execute it.
                           // just creates an iterator


        // create a function with this closure to act as callback for 
        // the async calls in this iterator
        // this callback will RESUME the generator, returning 'data' 
        // as the result of the 'yield' keyword

        declare valid thisIterator.defaultCallback
        declare valid thisIterator.next
        declare valid thisIterator.throw

        thisIterator.defaultCallback = function(err,data)
            // thisIterator.defaultCallback
            // console.log('on callback, err:',err,'data:',data);

            var nextPart = undefined;
            declare valid nextPart.done
            declare valid nextPart.value

            // if err, throw inside the generator
            if err
                try
                
                    //give the generator a chance to catch
                    nextPart = thisIterator.throw(err);
                    if nextPart.done //iterator returned (instead of a new yield)
                        if nextPart.value isnt undefined  //returned some data
                            //we asume error recovery
                            if finalCallback, finalCallback(null, nextPart.value); //final value (data) 
                        
                        else 
                            if finalCallback, finalCallback(err); //bubble up err
                        
                        return; //nothing more to do
                    
                
                catch e
                    if finalCallback, finalCallback(e)
                    return
                
            end if //err

            if nextPart is undefined //if it is not a error-recovery
                // data:        
                // RESUME the generator returning data as the result of the yield keyword,
                // (we store the result of resuming the generator in 'nextPart')
                try 
                    nextPart = thisIterator.next(data);  // thisIterator.next => RESUME generator, data:->result of 'yield'
                
                catch e
                    if finalCallback, finalCallback(e)
                    return
                
            end if

            //after the next part of the generator runs...
            if nextPart.done //the generator function has finished (executed "return")
                if finalCallback, finalCallback(null, nextPart.value); //final value (data) 
                return //it was the last part, nothing more to do
            

            // else...
            // not finished yet. The generator paused 
            // with another : yield [asyncFn,arg1,arg2...]
            // so in nextPart.value we have the asyncFn to call
            // Let's call the async

            callTheAsync(nextPart.value, thisIterator.defaultCallback);
            // the async function callback will be handled by this same closure (thisIterator.defaultCallback) 
            // repeating the loop until nextPart.done
        
        end defaultCallback function


        // by calling thisIterator.defaultCallback() now, we
        // RUN the first part of generator (up to 1st yield)
        thisIterator.defaultCallback()
        
        return thisIterator //nicegen returns created iterator
    
    end function run


    // helper function, call the async, using theCallback as callback
    helper function callTheAsync( yieldArr:array ,theCallback:function)

        var first= yieldArr[0];
        if first is 'map'
            //parallel map: single param asyncFn
            //yield ['map', addresses, dns, 'reverse']
            parallelMap(yieldArr[1],yieldArr[2],yieldArr[3],theCallback);
        
        else 
            //single async call - multiple params
        
            // get asyncFn to call
            var asyncFn: function
            // options are; [null,function,...] or [object,'methodName',...]
            if first is null 
                asyncFn=yieldArr[1]
            else 
                asyncFn = yieldArr[0][yieldArr[1]]

            //check: asyncFn should be a function 
            if typeof asyncFn isnt 'function'
                    throw(new Error(asyncFn.toString()+' is not a function\nyield '
                            +JSON.stringify(yieldArr)));
            

            // prepare arguments:
            // remove thisValue & fn from args and 
            var args = yieldArr.slice(2); 
            //add callback to arguments
            args.push(theCallback)
            // start the asyncFn
            try
                asyncFn.apply(yieldArr[0], args); // call the asyncFn
            catch err
                //a nice async function should not throw errors on call, how bad.
                theCallback(err);
            
        
    
    helper function parallelMap(arr:array, asyncFnThis, asyncFnName, finalCallback:function)
        
        var mapResult = 
            arr : []
            count : 0 
            expected : arr.length
        
        //early exit on empty array
        if mapResult.expected is 0, return finalCallback(null,mapResult.arr); 

        var asyncFn:function = asyncFnThis[asyncFnName];

        function callAsyncOn(inx)

            asyncFn.call asyncFnThis,arr[inx], -> err,data

                if err, return finalCallback(err,data); //err
                //console.log('result arrived',inx,data);
                //store result
                mapResult.arr[inx]=data;
                mapResult.count++;
                if mapResult.count>=mapResult.expected // all results arrived
                    finalCallback(null,mapResult.arr)  // final callback OK
                
           
        end function

        //main parallel call async
        for i = 0, while i < mapResult.expected
            callAsyncOn i
        
    end parallel map

    //helper function parallelFilter (uses parallelMap)
    helper function parallelFilter(arr:array, asyncFnThis:function, asyncFnName, finalCallback:function)
        
        parallelMap 

            arr, asyncFnThis, asyncFnName

            -> err,testResults //when all the filters finish

                if err, return finalCallback(err)

                // create an array with each item 
                // where filterGeneratorFn returned true
                var filteredArr=[];
                for each inx,item in arr
                    if testResults[inx], filteredArr.push item
                
                finalCallback null,filteredArr
        
    end function parallelFilter


