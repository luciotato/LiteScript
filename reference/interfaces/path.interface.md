
##node.js core  modeule "path" interface

Translated to Litescript from node's sources, https://github.com/joyent/node/edit/master/lib/path.js

    public var sep // POSIX = '/', windows="\""
    public var delimiter // POSIX= ':', windows = ";"

    public function resolve returns string 

    public function normalize(path)  returns string 

    public function isAbsolute(path:string)  //return path.charAt(0) is '/'

    public function join returns string 

    public function relative(from:string, toPath:string)  returns string 

    public function dirname(path) returns string 

    public function basename(path:string, ext:string)  returns string 

    public function extname(path)  returns string 
