
    var normal = "\x1b[39;49m";
    var red = "\x1b[91m";
    var green = "\x1b[32m";

    module.exports = function expect(title, result, expected)	

    	helper function rpad(s,qty) 
    		if no s, s="";
    		while s.length<qty
                s+=' '
    		return s
    	
    	var exception;
		var resultString, expectedString;

normalize to string

		if no result, result = "" 
		if no expected, expected = "" 

		//if type of result is object, convert to string
		if typeof result is 'object'
			resultString = JSON.stringify(result)
		else
			resultString = result.toString()

		//if type of expected is object, convert to string
		if typeof expected is 'object'
			expectedString = JSON.stringify(expected);
		else
			expectedString = expected.toString()

compare result with expected result

        var failed = (resultString !== expectedString);

        print """

            #{title}
            expected: #{green}#{expectedString}#{failed? red else green}
            result  : #{resultString}#{normal}
            """

