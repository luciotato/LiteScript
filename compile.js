/* 
compile.js: actions
-----------------
    1. Create a LiteScript Processor from your ./node_modules/litescript dir
    2. Add all the extra sugar from ./node_modules/litescript/sugar dir
    3. Call lite.compile()
        3.1 default path is your main app dir: ../..
        3.2 compile only if source is newer
        3.3 process *.lite.js files, creating _*.js files
            Example: creates '_main.js' from 'main.lite.js', if datetime of 'main.lite.js' is newer
    
    
To use litescript in node.js
----------------------------

1. Install your copy of litescript in node_modules:

    npm install litescript

2. Create a boot auto-compiler:

    (assuming your main source file is: main.lite.js)

    2.1 Include:  "main":"boot.js"  in your package.json

    2.2 Create a file 'boot.js', with the following content:

    boot.js
    -------
    require('litescript'); //create & run LiteScript your processor from ./node_modules
    require('./_main.js'); //load & run your processed main.lite.js

3. ?

4. PROFIT!

*/

//-------------------------
//-- compile.js -----------
//-------------------------

var fs=require('fs');
var path=require('path');
var Lite=require('./lite'); //load class

// -----------------------------------------
// - Support functions ---------------------
// -----------------------------------------
// - add processFile & processDir to Lite --
// -----------------------------------------
Lite.prototype.processFile = function(dirPath,aFname) {
    
    if (aFname[0]!='.') {
        var fname = path.join(dirPath,aFname);
        var stat = fs.statSync(fname);
        
        if (stat.isDirectory() && aFname!='node_modules')
            this.processDir(fname); //recursive
        else
        {
            if (fname.indexOf('.lite.')>0) { // extension '.lite.js' '.lite.html'
                
                this.fileName = fname;
                var aFname_processed= aFname.replace(/.lite/,'');
                var fname_processed= path.join(dirPath,aFname_processed);
                var procesar=true;
                if (fs.existsSync(fname_processed)) {
                    var stat_processed = fs.statSync(fname_processed);
                    //console.log(stat.mtime, stat_processed.mtime);
                    procesar= (stat.mtime > stat_processed.mtime); //proces if source is newer
                }
                //procesar=true; //DEBUG
                if (procesar) {
                    console.log('+ Processing: ' , fname , " -> ", fname_processed);
                    var sourceText=fs.readFileSync(fname,'utf8');
                    this.process(sourceText);
                    fs.writeFileSync(fname_processed,this.result.join('\n'));
                }
            }       
        }
    }
};

//-----------------------
Lite.prototype.processDir = function(dirPath)
{
    var lite=this;
    //console.log('LiteScript processing dir: ',dirPath);
    var files = fs.readdirSync(dirPath);
    files.forEach ( 
        function(aFname) {
            lite.processFile(dirPath,aFname);
        }
    );
};

//-----------------------
Lite.prototype.compile = function(dirPath)
{
    this.processDir(dirPath||'./');
};

//console.log('litescript compile.js, __dirname: ', __dirname);

// 1. Create a LiteScript Processor from your ./node_modules/litescript dir
var lite=new Lite();

// 2. Add all the extra sugar from ./node_modules/litescript/sugar dir
fs.readdirSync(path.join(__dirname,"sugar")).forEach(
    function(file) {
        lite.addSugar( require("./sugar/"+file) );
    }
);

// 3. Call lite.compile()
// default path is your main app dir: ../..
// to compile a specific path you can do:
// $> node compile mydir

lite.compile( process.argv[2] );
