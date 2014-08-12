
//- Support Lib for LiteScript
//- Copyright 2014 Lucio Tato

//-- WARNING: bleeding edge --
//This lib use  ECMAScript 6 generators,
//the next version of the javascript standard, code-named "Harmony".
//(release target date December 2013).

//This lib also uses bleeding edge v8 Harmony features, so you’ll need to
//use a (today) -unstable- nodejs version >= v0.11.6
//and also pass the --harmony flag when executing node.

  //node --harmony test/test


    //public function run(thisValue, generatorFn:function, args:array) // wait.launchFiber(fn,arg1,arg2...)
    function run(thisValue, generatorFn, args){

        //console.log(Array.prototype.slice.call(arguments));

        // starts a generator (emulating a fiber)

        //console.log('nicegen',arguments);

        // checks
        //if typeof generatorFn isnt 'function'
        if (typeof generatorFn !== 'function') {
        
            //console.log(arguments);
            //throw new Error('second argument must be a generator, not '+(typeof generatorFn));
            throw new Error('second argument must be a generator, not ' + (typeof generatorFn));
        };


        //var lastArg = args.length-1;
        var lastArg = args.length - 1;
        //var finalCallback = args[lastArg];
        var finalCallback = args[lastArg];

        //if typeof finalCallback isnt 'function'
        if (typeof finalCallback !== 'function') {
        

            //if no callback, create a default
            //finalCallback = -> err,data
                                //if err, throw err
            //lastArg++
            finalCallback = function (err, data){
                                //if err, throw err
                                if (err) {throw err};
            };
            //lastArg++
            lastArg++;
        };


        // if callback; remove final callback from arguments. The generator does not receive the callback
        //var generatorArgs = Array.prototype.slice.call(args,0,lastArg)
        var generatorArgs = Array.prototype.slice.call(args, 0, lastArg);

        // create the iterator
        //var thisIterator = generatorFn.apply(thisValue, generatorArgs); // create the iterator.
        var thisIterator = generatorFn.apply(thisValue, generatorArgs);
                           // Note: calling a generator function, DOES NOT execute it.
                           // just creates an iterator


        // create a function with this closure to act as callback for
        // the async calls in this iterator
        // this callback will RESUME the generator, returning 'data'
        // as the result of the 'yield' keyword

        //declare valid thisIterator.defaultCallback
        
        //declare valid thisIterator.defaultCallback
        //declare valid thisIterator.next
        
        //declare valid thisIterator.next
        //declare valid thisIterator.throw
        
        //declare valid thisIterator.throw

        //thisIterator.defaultCallback = function(err,data)
            // thisIterator.defaultCallback
            // console.log('on callback, err:',err,'data:',data);

            //var nextPart = undefined;
            //declare valid nextPart.done
            //declare valid nextPart.value

            // if err, throw inside the generator
            //if err
                //try

                    //give the generator a chance to catch
                    //nextPart = thisIterator.throw(err);
                    //if nextPart.done //iterator returned (instead of a new yield)
                        //if nextPart.value isnt undefined  //returned some data
                            //we asume error recovery
                            //if finalCallback, finalCallback(null, nextPart.value); //final value (data)

                        //else
                            //if finalCallback, finalCallback(err); //bubble up err

                        //return; //nothing more to do


                //catch e
                    //if finalCallback, finalCallback(e)
                    //return

            //end if //err

            //if nextPart is undefined //if it is not a error-recovery
                // data:
                // RESUME the generator returning data as the result of the yield keyword,
                // (we store the result of resuming the generator in 'nextPart')
                //try
                    //nextPart = thisIterator.next(data);  // thisIterator.next => RESUME generator, data:->result of 'yield'

                //catch e
                    //if finalCallback, finalCallback(e)
                    //return

            //end if

            //after the next part of the generator runs...
            //if nextPart.done //the generator function has finished (executed "return")
                //if finalCallback, finalCallback(null, nextPart.value); //final value (data)
                //return //it was the last part, nothing more to do


            // else...
            // not finished yet. The generator paused
            // with another : yield [asyncFn,arg1,arg2...]
            // so in nextPart.value we have the asyncFn to call
            // Let's call the async

            //callTheAsync(nextPart.value, thisIterator.defaultCallback);
            // the async function callback will be handled by this same closure (thisIterator.defaultCallback)
            // repeating the loop until nextPart.done

        //end defaultCallback function
        thisIterator.defaultCallback = function (err, data){
            // thisIterator.defaultCallback
            // console.log('on callback, err:',err,'data:',data);

            //var nextPart = undefined;
            var nextPart = undefined;
            //declare valid nextPart.done
            
            //declare valid nextPart.done
            //declare valid nextPart.value
            
            //declare valid nextPart.value

            // if err, throw inside the generator
            //if err
            if (err) {
            
                //try
                try{

                    //give the generator a chance to catch
                    //nextPart = thisIterator.throw(err);
                    nextPart = thisIterator.throw(err);
                    //if nextPart.done //iterator returned (instead of a new yield)
                    if (nextPart.done) {
                    
                        //if nextPart.value isnt undefined  //returned some data
                        if (nextPart.value !== undefined) {
                        
                            //we asume error recovery
                            //if finalCallback, finalCallback(null, nextPart.value); //final value (data)
                            if (finalCallback) {finalCallback(null, nextPart.value)};
                        }
                        //if nextPart.value isnt undefined  //returned some data
                        
                        else {
                            //if finalCallback, finalCallback(err); //bubble up err
                            if (finalCallback) {finalCallback(err)};
                        };

                        //return; //nothing more to do
                        return;
                    };
                
                }catch(e){
                    //if finalCallback, finalCallback(e)
                    if (finalCallback) {finalCallback(e)};
                    //return
                    return;
                };
            };

            //end if //err

            //if nextPart is undefined //if it is not a error-recovery
            

            //if nextPart is undefined //if it is not a error-recovery
            if (nextPart === undefined) {
            
                // data:
                // RESUME the generator returning data as the result of the yield keyword,
                // (we store the result of resuming the generator in 'nextPart')
                //try
                try{
                    //nextPart = thisIterator.next(data);  // thisIterator.next => RESUME generator, data:->result of 'yield'
                    nextPart = thisIterator.next(data);
                
                }catch(e){
                    //if finalCallback, finalCallback(e)
                    if (finalCallback) {finalCallback(e)};
                    //return
                    return;
                };
            };

            //end if

            //after the next part of the generator runs...
            //if nextPart.done //the generator function has finished (executed "return")
            

            //after the next part of the generator runs...
            //if nextPart.done //the generator function has finished (executed "return")
            if (nextPart.done) {
            
                //if finalCallback, finalCallback(null, nextPart.value); //final value (data)
                if (finalCallback) {finalCallback(null, nextPart.value)};
                //return //it was the last part, nothing more to do
                return;
            };


            // else...
            // not finished yet. The generator paused
            // with another : yield [asyncFn,arg1,arg2...]
            // so in nextPart.value we have the asyncFn to call
            // Let's call the async

            //callTheAsync(nextPart.value, thisIterator.defaultCallback);
            callTheAsync(nextPart.value, thisIterator.defaultCallback);
        };
            // the async function callback will be handled by this same closure (thisIterator.defaultCallback)
            // repeating the loop until nextPart.done

        //end defaultCallback function


        // by calling thisIterator.defaultCallback() now, we
        // RUN the first part of generator (up to 1st yield)
        //thisIterator.defaultCallback()
        


        // by calling thisIterator.defaultCallback() now, we
        // RUN the first part of generator (up to 1st yield)
        //thisIterator.defaultCallback()
        thisIterator.defaultCallback();

        //return thisIterator //nicegen returns created iterator
        return thisIterator;
    }
    // export
    module.exports.run = run;

    //end function run


    // helper function, call the async, using theCallback as callback
    //helper function callTheAsync( yieldArr:array ,theCallback:function)
    


    // helper function, call the async, using theCallback as callback
    //helper function callTheAsync( yieldArr:array ,theCallback:function)
    function callTheAsync(yieldArr, theCallback){

        //var first= yieldArr[0];
        var first = yieldArr[0];
        //if first is 'map'
        if (first === 'map') {
        
            //parallel map: single param asyncFn
            //yield ['map', addresses, dns, 'reverse']
            //parallelMap(yieldArr[1],yieldArr[2],yieldArr[3],theCallback);
            parallelMap(yieldArr[1], yieldArr[2], yieldArr[3], theCallback);
        }
        //if first is 'map'
        
        else {
            //single async call - multiple params

            // get asyncFn to call
            //var asyncFn: function
            var asyncFn = undefined;
            // options are; [null,function,...] or [object,'methodName',...]
            //if first is null
            if (first === null) {
            
                //asyncFn=yieldArr[1]
                asyncFn = yieldArr[1];
            }
            //if first is null
            
            else {
                //asyncFn = yieldArr[0][yieldArr[1]]
                asyncFn = yieldArr[0][yieldArr[1]];
            };

            //check: asyncFn should be a function
            //if typeof asyncFn isnt 'function'
            if (typeof asyncFn !== 'function') {
            
                    //throw(new Error(asyncFn.toString()+' is not a function\nyield '
                            //+JSON.stringify(yieldArr)));
                    throw (new Error(asyncFn.toString() + ' is not a function\nyield ' + JSON.stringify(yieldArr)));
            };


            // prepare arguments:
            // remove thisValue & fn from args and
            //var args = yieldArr.slice(2);
            var args = yieldArr.slice(2);
            //add callback to arguments
            //args.push(theCallback)
            args.push(theCallback);
            // start the asyncFn
            //try
            try{
                //asyncFn.apply(yieldArr[0], args); // call the asyncFn
                asyncFn.apply(yieldArr[0], args);
            
            }catch(err){
                //a nice async function should not throw errors on call, how bad.
                //theCallback(err);
                theCallback(err);
            };
        };
    };



    //helper function parallelMap(arr:array, asyncFnThis, asyncFnName, finalCallback:function)
    function parallelMap(arr, asyncFnThis, asyncFnName, finalCallback){

        //var mapResult =
            //arr : []
            //count : 0
            //expected : arr.length

        //early exit on empty array
        //if mapResult.expected is 0, return finalCallback(null,mapResult.arr);
        var mapResult = {
           arr: []
           , count: 0
           , expected: arr.length
            };

        //early exit on empty array
        //if mapResult.expected is 0, return finalCallback(null,mapResult.arr);
        if (mapResult.expected === 0) {return finalCallback(null, mapResult.arr)};

        //var asyncFn:function = asyncFnThis[asyncFnName];
        var asyncFn = asyncFnThis[asyncFnName];

        //function callAsyncOn(inx)
        function callAsyncOn(inx){

            //asyncFn.call asyncFnThis,arr[inx], -> err,data

                //if err, return finalCallback(err,data); //err
                //console.log('result arrived',inx,data);
                //store result
                //mapResult.arr[inx]=data;
                //mapResult.count++;
                //if mapResult.count>=mapResult.expected // all results arrived
                    //finalCallback(null,mapResult.arr)  // final callback OK


        //end function
            asyncFn.call(asyncFnThis, arr[inx], function (err, data){

                //if err, return finalCallback(err,data); //err
                if (err) {return finalCallback(err, data)};
                //console.log('result arrived',inx,data);
                //store result
                //mapResult.arr[inx]=data;
                mapResult.arr[inx] = data;
                //mapResult.count++;
                mapResult.count++;
                //if mapResult.count>=mapResult.expected // all results arrived
                if (mapResult.count >= mapResult.expected) {
                
                    //finalCallback(null,mapResult.arr)  // final callback OK
                    finalCallback(null, mapResult.arr);
                };
            });
        };


        //end function

        //main parallel call async
        //for i = 0, while i < mapResult.expected
        

        //main parallel call async
        //for i = 0, while i < mapResult.expected
        for( var i=0; i < mapResult.expected; i++) {
            //callAsyncOn i
            callAsyncOn(i);
        };// end for i
        
    };

    //end parallel map

    //helper function parallelFilter (uses parallelMap)
    //helper function parallelFilter(arr:array, asyncFnThis:function, asyncFnName, finalCallback:function)
    

    //helper function parallelFilter (uses parallelMap)
    //helper function parallelFilter(arr:array, asyncFnThis:function, asyncFnName, finalCallback:function)
    function parallelFilter(arr, asyncFnThis, asyncFnName, finalCallback){

        //parallelMap

            //arr, asyncFnThis, asyncFnName

            //-> err,testResults //when all the filters finish

                //if err, return finalCallback(err)

                // create an array with each item
                // where filterGeneratorFn returned true
                //var filteredArr=[];
                //for each inx,item in arr
                    //if testResults[inx], filteredArr.push item

                //finalCallback null,filteredArr

    //end function parallelFilter
        parallelMap(arr, asyncFnThis, asyncFnName, function (err, testResults){

                //if err, return finalCallback(err)
                if (err) {return finalCallback(err)};

                // create an array with each item
                // where filterGeneratorFn returned true
                //var filteredArr=[];
                var filteredArr = [];
                //for each inx,item in arr
                for( var inx=0,item ; inx<arr.length ; inx++){item=arr[inx];
                
                    //if testResults[inx], filteredArr.push item
                    if (testResults[inx]) {filteredArr.push(item)};
                };// end for each in arr

                //finalCallback null,filteredArr
                finalCallback(null, filteredArr);
            });
    };

    //end function parallelFilter
    
