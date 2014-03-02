  var fs, path, Kal, sourceMap, existsSync;
  var k$indexof = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  var k$comprl = function (iterable,func) {var o = []; if (iterable instanceof Array || typeof iterable.length == "number") {for (var i=0;i<iterable.length;i++) {o.push(func(iterable[i]));}} else if (typeof iterable.next == "function") {var i; while ((i = iterable.next()) != null) {o.push(func(i));}} else {throw "Object is not iterable";}return o;};
  /* Command Line Utility
     --------------------

     This module defines the command line `kal` utility.
      */
  fs = require('fs');
  path = require('path');
  compiler = require('./compiler.js');

  sourceMap;// = require('./sourceMap.js');

  /*
     Utilities
     =========

     Some messages are written to `stderr` in this module.
 */

  function warn(line) {
    process.stderr.write(line + '\n');
  }

  /*
     This utility function checks if a file is "hidden" by the operating system.
      */
  function hidden(file) {
    /^\.|~$/.test(file);
  }

  /*
     `existsSync` is used to retain compatibility between node.js versions.
      */
  existsSync = fs.existsSync || path.existsSync;

// Compile a FILE
  function compileFile(filename, output_dir, options, minify) {

    var filename, stat, extension, js_filename, source, js_output;
      stat = fs.statSync(filename);

      if (stat.isDirectory()) throw 'expected a file';

      extension = path.extname(filename);

      if (['.lit', '.lite', '.md'].indexOf(extension) >= 0) {

        /*
           Check if this is Literate code.
            */
        options.literate = (['.lite', '.md'].indexOf(extension) >= 0);

        // get js out filename
        js_filename = path.join(output_dir, path.basename(filename, extension)) + '.js';

        //   Start Source Map generation
        //sourceMap.initGlobalMap(filename, js_filename);

        //   Compile the source.
        console.log('compiling', filename, 'to', js_filename);

        //get file contents
        source = fs.readFileSync(filename);

        js_output = compiler.compile(source, options);
        /*
           Minify if requested. We've already checked that `uglify-js` is installed at this point.
        */
        if (minify) {
          js_output = require('uglify-js').minify(js_output, {fromString: true, mangle: false}).code;
        }
        /*
           Print out the JavaScript if the debug option was passed in.
        */
        if (options.show_js) console.log(js_output);
        /*
           Write the output to the output directory with a `.js` extension.
        */
        js_output += '\n//# sourceMappingURL=' + path.basename(sourceMap.mapFile);
        fs.writeFileSync(js_filename, js_output);

        //write map file
        sourceMap.writeMapFile();

        //also copy original source to output dir
        //fs.writeFileSync(path.join(output_dir, path.basename(filename)), source);

        //debug map generation
        //fs.writeFileSync(js_filename + '.map.log', JSON.stringify(module.exports.mappingLog, null, '\t'));
      }
      else { // unrecg extesion, just copy
          fs.createReadStream(filename)
                .pipe(fs.createWriteStream(path.join(output_dir, path.basename(filename))));
        }
    }

/*
Compile Files
=============
This function recursively compiles a dir into `output_dir`.
*/
  function compile_files(dir, output_dir, options) {

    var stat;

    stat = fs.statSync(dir);
    if (!stat.isDirectory()) throw 'expected a dir';

    //for each item in folder
    fs.readdirSync(dir).forEach(function(itemNameOnly){
        //get Full Path
        item = path.join(dir, itemNameOnly );
        //check if it is a dir
        if (fs.statSync(item).isDirectory()) {
            //if it is, recursive call
            compile_files(item, path.join(output_dir, itemNameOnly), options );
        }
        else { //compile single file
          compileFile(item, output_dir, options);
      }
    });

}

  exports.compile_files = compile_files;

