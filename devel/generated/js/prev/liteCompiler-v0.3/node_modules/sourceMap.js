var sourceMap = require('source-map');
var path=require('path');
var fs=require('fs');

module.exports.mappingLog = [];

exports.initGlobalMap = function(sourceFileName, js_filename) {
    module.exports.currentSource  = sourceFileName;
    module.exports.jsFile = js_filename;
    module.exports.mapFile = module.exports.jsFile + ".map";
    module.exports.globalMap = new sourceMap.SourceMapGenerator({file: module.exports.mapFile});
  };

/*
   addMapping, Source Map generation
*/
function addMapping(mapping) {
    module.exports.mappingLog.push(mapping);
    mapping.source = '..' + path.sep + module.exports.currentSource;
    module.exports.globalMap.addMapping(mapping);
  }
exports.addMapping = addMapping;

exports.writeMapFile = function(){
    //console.log('mapping: ',module.exports.mapFile);
    fs.writeFileSync(exports.mapFile, exports.globalMap.toString());
};

