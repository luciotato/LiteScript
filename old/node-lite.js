var fs=require('fs');
var path=require('path');
var lite=require('./lite');


// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// START LiteScript Processor
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------

// sources readed from ./src
var sourcePath=path.resolve(__dirname,'src');

// output sent to ./out
var destPath=path.resolve(__dirname,'out');
if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);

// -----------------
// ---Start --
// -----------------
console.log('Reading Files...');
fs.readdir(sourcePath, ProcessFiles);
// -----------------
// ---End --
// -----------------

// -----------------
// ---ProcessFiles--
// -----------------
function ProcessFiles(err,files) {

    if (err) throw new Error(err);

    for(var i=0;i<files.length;i++){

        var fname=files[i];

        if (fname.indexOf('.ls')){ // extension '.ls'

            console.log('  + ',fname);

            fname=path.resolve(sourcePath,fname);
            var sourceText=fs.readFileSync(fname,'utf8');

            lite.setSource(sourceText);

            lite.processBlock();

			var destFname=path.resolve(destPath,path.basename(fname,'.ls')+'.js');
            console.log('  -> ',destFname);
			fs.writeFileSync(destFname,lite.result.toString());

        }
    }
}

