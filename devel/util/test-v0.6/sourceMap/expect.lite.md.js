//Compiled by LiteScript compiler v0.6.3, source: test-v0.6/sourceMap/expect.lite.md

   var normal = "\x1b[39;49m";
   var red = "\x1b[91m";
   var green = "\x1b[32m";

   module.exports = function expect(title, result, expected){

       //helper function rpad(s,qty)
       function rpad(s, qty){
           //if no s, s="";
           if (!s) {
               s = ""};
           //while s.length<qty
           while(s.length < qty){
               s += ' ';
           };//end loop
           return s;
       };

       var exception = undefined;
       var resultString = undefined, expectedString = undefined;

//normalize to string

       //if no result, result = ""
       if (!result) {
           result = ""};
       //if no expected, expected = ""
       if (!expected) {
           expected = ""};

        //if type of result is object, convert to string
       //if typeof result is 'object'
       if (typeof result === 'object') {
           resultString = JSON.stringify(result);
       }
       
       else {
           resultString = result.toString();
       };

        //if type of expected is object, convert to string
       //if typeof expected is 'object'
       if (typeof expected === 'object') {
           expectedString = JSON.stringify(expected);
       }
       
       else {
           expectedString = expected.toString();
       };

//compare result with expected result

       var failed = (resultString !== expectedString);

       console.log('\n' + title + '\nexpected: ' + green + expectedString + (failed ? red : green) + '\nresult  : ' + resultString + normal);
   };

