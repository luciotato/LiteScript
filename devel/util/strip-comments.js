//strip-comments.js
//
// requires wait.for & uglify-js as command line utility

var baseDir='/home/ltato/LiteScript/devel'

var processDirs = [
  ['generated/byV07/js/lite-to-js', 'out/clean/by07/js/lite-to-js']
  ,['generated/js/v0.8/lite-to-js', 'out/clean/actual/js/lite-to-js']
]


var path = require('path');
var fs   = require('fs');
var util = require('./fsUtil');

var wait = require('wait.for-es6');

var compiler;

var normal = "\x1b[39;49m";
var red = "\x1b[91m";
var green = "\x1b[32m";

//var UglifyJS = require("uglify-js");
 var cp  = require('child_process')

 function exec(command, callback){
   var proc = cp.exec(command
    , function (error, stdout, stderr) {
           if (error) {
             console.log(red, error.stack);
             console.log('Error code: ',error.code);
             console.log('Signal received: ',error.signal, normal);
             callback(error,stderr);
           }
           //if (stdout) console.log('Child Process STDOUT:',stdout);
           //if (stderr) console.log('Child Process STDERR:',red, stderr, normal);
           callback(null,stdout);
         });

/*  proc.on('error', function (code) {
    console.log(red, filename,' - error',code, normal);
    });


  proc.on('exit', function (code) {
    console.log('exit code',code);
    if (code===0) callback();
    else callback(new Error('exit code:'+code));
    });
*/
 }

//------------------------------------------
// ug a FILE
  function* ugFile(sourceDir,filename, output_dir, options) {

      options = options || {};
      //if (options.map===undefined) options.map=true;
      console.log("process:",filename);

      var stat, extension, js_filename, source, js_output;
      stat = fs.statSync(filename);
      if (stat.isDirectory()) throw 'expected a file';

      output_dir = path.join(output_dir,path.relative(sourceDir, path.dirname(filename)));

      extension = path.extname(filename);

      if (['.js'].indexOf(extension) >= 0) {

        //get date & time source
        var stat = fs.statSync(filename);

        // get filename for output .js
        js_filename = path.join(output_dir, path.basename(filename, extension)) + '.ug.js';

        var fname_processed = js_filename;
        var procesar=true;
        //console.log(stat.mtime, fname_processed);
        if (!options.force) {
            if (fs.existsSync(fname_processed)) {
                var stat_processed = fs.statSync(fname_processed);
                //console.log(stat.mtime, stat_processed.mtime);
                procesar= (stat.mtime > stat_processed.mtime); //proces if source is newer
                if (!procesar) console.log(filename,'UNCHANGED');
            }
        }

        //procesar=true; //DEBUG
        if (procesar) {

            //console.log(fname_processed);
            
            options.filename = filename;

            util.mkPathToFile(js_filename);

            //   Compile the source.
            var result = yield wait.for ( exec, 'uglifyjs '+filename+' -b -o '+js_filename);

            //console.log('after wait for');    
            //var contents = fs.readFileSync(js_filename,'utf-8');
            //fs.writeFileSync(js_filename,contents.replace(/\svar\s/g," "));
            // fs.writeFileSync(js_filename,result);

            console.log(green,'->',js_filename,normal);

            //console.log(green, js_filename,' REPLACED var',normal);
    
      }
    }
};


function* ugDir(sourceDir, outDir, options){

    var wait = require('wait.for-es6');

    //use compiled2 compiler
    //setCompiler(compilerCodeDir);
    console.log('ug dir  '+sourceDir+' -to- '+outDir);
    if (options) console.log('OPTIONS ', options);

    //rm * outdir
    //util.rmDirForce(outDir);
    //create outdir
    //fs.mkdirSync(outDir);

    var files = [];
    var filename;
    util.recurseDir(sourceDir, function(filename){
        if ( path.extname(filename)==='.js'
            && (options.filter===undefined || filename.indexOf(options.filter)>=0)
            && (options.exclude===undefined || filename.indexOf(options.exclude)===-1) )      
                    files.push(filename);
    });

    for(var i=0;i<files.length;i++){
        filename = files[i];
        yield wait.runGenerator(ugFile,sourceDir,filename,outDir,options);
    }


}

function* mainProcess(){

    for(var inx=0;inx<processDirs.length;inx++){

      var source = path.join(baseDir,processDirs[inx][0]);
      var dest = path.join(baseDir,processDirs[inx][1]);

      yield wait.runGenerator(ugDir,source,dest,options);
    }

};

//
//-- MAIN--------------------------------------
//

console.log("\n\n\n");
console.log(process.argv);
console.log(process.cwd());
console.log('About to process: ',processDirs);


var options = {beautify:true};

options.exclude = 'README';

options.force = (process.argv.indexOf("-force")>=0)

wait.launchFiber(mainProcess);

/*
uglifyjs out/debug/source-for-jsc/Compiler.js -b -o out/byV1/Compiler.js
uglifyjs liteCompilerV1/Compiler.js -b -o out/byV0/Compiler.js

uglifyjs out/debug/source-for-jsc/ASTBase.js -b -o out/byV1/ASTBase.js
uglifyjs liteCompilerV1/ASTBase.js -b -o out/byV0/ASTBase.js

uglifyjs out/debug/source-for-jsc/Grammar.js -b -o out/byV1/Grammar.js
uglifyjs liteCompilerV1/Grammar.js -b -o out/byV0/Grammar.js

uglifyjs out/debug/source-for-jsc/Lexer.js -b -o out/byV1/Lexer.js
uglifyjs liteCompilerV1/Lexer.js -b -o out/byV0/Lexer.js

uglifyjs out/debug/source-for-jsc/TypeCheck.js -b -o out/byV1/TypeCheck.js
uglifyjs liteCompilerV1/TypeCheck.js -b -o out/byV0/TypeCheck.js

*/