
var DEFAULT_VERSION='0.6'

var fs = require('fs');
var path = require('path');
var fsUtil = require('./fsUtil');

var normal = "\x1b[39;49m";
var red = "\x1b[91m";
var green = "\x1b[32m";

var count={OK:0,FAILED:0}

var compilerOptions={verbose:0, debug:false}
var testOptions={verbose:0}

//------------------------
// Helper functions,
// parse command line parameters
//------------------------
   function Args(argv){
       var arr = argv.slice(2); //remove 'node lite' from command line arguments
       arr.__proto__ = Args.prototype; //convert arr:Array into arr:Args:Array
       return arr; //return as created object
    };
	// Args (extends|super is) Array
	Args.prototype.__proto__ = Array.prototype;

	//method option(short,argName)
	Args.prototype.option = function(short, argName){

       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           this.splice(pos, 1);
           return true;
       };

       return false;
    };

    //method value(short,argName) returns string
    Args.prototype.value = function(short, argName){

       //if .getPos(short,argName) into var pos >= 0
       var pos=undefined;
       if ((pos=this.getPos(short, argName)) >= 0) {
           var value = this[pos + 1];
           this.splice(pos, 2);
           return value;
       };

       return undefined;
    };

    //helper method getPos(short,argName)
    Args.prototype.getPos = function(short, argName){
       return this.search(['-' + short, '--' + short, '--' + argName, '-' + argName]);
    };

    //helper method search(list:array)
    Args.prototype.search = function(list){
       //for each item in list
       for( var item__inx=0,item=undefined; item__inx<list.length; item__inx++){item=list[item__inx];
           var result = this.indexOf(item);
           if (result >= 0) return result;
       };
       return -1;
    };

//-- helper fn -------------------
	function isObjEmpty(obj) {

	    // falsey
	    if (!obj) return true;

	    // Assume if it has a length property with a non-zero value
	    // that that property is correct.
	    if (obj.length && obj.length > 0)    return false;
	    if (obj.length === 0)  return true;

	    // Otherwise, does it have any properties of its own?
	    // Note that this doesn't handle
	    // toString and toValue enumeration bugs in IE < 9
	    for (var key in obj) {
	        if (hasOwnProperty.call(obj, key)) return false;
	    }

	    return true;
	}

//--------------------

function testFile(filename)	{

	function rpad(s,qty) { 
		if (!s) s="";
		while(s.length<qty) s+=' ';
		return s;
	}


	var exception;

	var title = "GROUP: "+filename
    testOptions.verbose>=1 && console.error(normal,title);

	testGroup = filename.replace(/\.|\\|\//g,'_');

	options = {};

	//declare globals Test helper function
	global.result = [];
	global.expected = [];
	global.expect = function(result,expectedResult){
			global.result.push(result);
			global.expected.push(expectedResult);
		}


	//produce js code from .lite file
	compiledLines=[]
	testOptions.verbose>=1 && console.error('compiling', filename);
	
	global.debugOptions = {};
	global.debugOptions.level = 10;
	
	try{
		sourceLines = fs.readFileSync(filename);
		moduleNode = compiler.compileModule(filename,sourceLines,compilerOptions);
		compiledLines = moduleNode.getCompiledLines();
		compiledLines.push('return Tests;');
	}catch(e){
        console.error(red,'Error compiling ',filename);
		console.error(e.message, normal);
		if (!e.controled) console.error(e.stack);
	}

	if (outDir) {
		outFile= outDir+'/'+filename+'.js';
		fsUtil.mkPathToFile(outFile);
		fs.writeFileSync(outFile,compiledLines.join('\n'));
	}

	//execute produced js code
	var testFn = new Function(compiledLines.join('\n')); //create a Fn with test code
	var Tests = testFn(); // call the Fn, Execute compiled tests

	if (isObjEmpty(Tests)) {
		console.error(red, title,"returned NO CODE TO TEST (Tests is empty)");
		count.FAILED++;
	}
	
	else for(var testTitle in Tests){

		test = Tests[testTitle];

		//clear globals helpers
		global.result = []
		global.expected = []

		var result;

		//run test code
		try{
			result = test.code();
		} 
		catch(e){
			exception = e;
			count.FAILED++;
			console.error(red, "*FAIL Test:", testTitle);
			console.error(normal, "    ",e.message);
			console.error(normal, "    ",e.stack);
		}

		if (!exception) {

			var expected = test.expected

			if ( ! result && global.result.length) { result = global.result };
			if ( ! expected && global.expected.length) { expected = global.expected };

			var resultString, expectedString;

			if ( ! result ) result = "" ;
			if ( ! expected ) expected = "" ;

			//if type of result is object, convert to string
			if (typeof result === 'object')
				resultString = JSON.stringify(result);
			else
				resultString = result.toString();

			//if type of expected is object, convert to string
			if (typeof expected === 'object')
				expectedString = JSON.stringify(expected);
			else
				expectedString = expected.toString();

			//compare result with expected result
            var failed = (resultString !== expectedString);
			if (failed) {
                count.FAILED++;
                console.error("\n"+normal+"file: ",filename)
                console.error(red + "*FAIL Test:", testTitle,normal);
				}
			else {
                testOptions.verbose>=1 && console.error(green,"[OK!] Test:",testTitle, normal);
                count.OK++;
            }

            if (failed||testOptions.verbose>=2) {
				if (expected instanceof Object) {
					console.error("    Result  vs",green,"Expected",normal);
					console.error(normal,"-----------------------");
					
					for(var inx=0;inx<expected.length||inx<result.length;inx++){
						
						var line=green;
						
						if (inx>=expected.length) expected[inx]="*not expected*";
						else if (expected[inx]===undefined) expected[inx]="*undefined*";
						else if (expected[inx]===null) expected[inx]="*null*";

						if (result[inx]===undefined) result[inx]="*undefined*";
						else if (result[inx]===null) result[inx]="*null*";

						if (expected[inx].toString()!==result[inx].toString()) line+=red;
						line+=' '+inx+': '+rpad(result[inx].toString(),10)+"  "+green+expected[inx].toString();
						console.error(line);
					}
					console.error(normal,"-----------------------");
				}
				else {
					console.error(normal,"  expected:",expected);
					console.error(normal,"    result:",result,"\n");
				}
			}

		}

	}	
}

//--------------
// MAIN
//--------------
/* 
Process all .lite files in test/*
*/

// get command line options
var args = new Args(process.argv);

var use = args.value('u','use')||DEFAULT_VERSION 
if (use[0]==='v') use=use.slice(1);

var compilerPath = args.value('comppath','compiler-path')||('../liteCompiler-v'+use)

var outDir = args.value('o','outdir');

compilerOptions.debug = args.option('d','debug')
testOptions.verbose = args.value('v','verbose')||0;

if (args[0]){
	var filter = args.splice(0,1)
	if (filter) console.log('filter:',filter);
}

if (args.length){
	console.error('invalid argument:', args.join(' '));	
	process.exit(2);
}

function separ(){console.error(normal+'---------------------------------');}

separ();
console.error('TEST using compiler at',compilerPath);
testOptions.verbose>=1 && console.error("compiler options:",JSON.stringify(compilerOptions));

//get Litescript compiler to compile tests
compiler = require(compilerPath+'/Compiler');
console.error('compiler v',compiler.version);

//DEBUG - SINGLE FILE
//testFile('tests/DoWhileUntil.lite');
//return;

console.error('---------------------------------');
console.error("cwd:",process.cwd())

var testPath = 'test-v'+use;
if (!fsUtil.dirExists(testPath)) testPath=testPath.slice(0,testPath.lastIndexOf('.')); //remove PATCH, keep major.minor

console.error('Starting tests from dir '+testPath+'/*');

fsUtil.recurseDir(testPath, function(filename){
	//console.error(filename,path.extname(filename));
	if (path.extname(filename)==='.lite'
		&& (filter===undefined || filename.indexOf(filter)>=0))		 
			testFile(filename);
});

separ();
testOptions.verbose>=1 && console.error('End tests from dir test-'+use);
testOptions.verbose>=1 && console.error('---------------------------------');
//console.timeEnd("tests")
console.error(count.OK+count.FAILED + ' tests performed');
count.OK && console.error(green,count.OK,'tests OK');
count.FAILED && console.error(red,count.FAILED,' TEST(S) FAILED!');
count.OK && count.FAILED===0 && console.error(green,'OK ALL TESTS');
console.error(normal);
separ();

if (count.FAILED) process.exit(1);
