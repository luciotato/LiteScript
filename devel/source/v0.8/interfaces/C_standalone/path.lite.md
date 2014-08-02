##Helper "path" namespace

Translated to Litescript from node's sources, https://github.com/joyent/node/edit/master/lib/path.js

minus "windows version" parts, and witout RegEx, in order to compile in LiteC

// "path" - LiteScript Version
// Copyright Lucio M. Tato
// for the LiteScript litec compiler

// Original:
//
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)

    function normalizeArray(parts:array, allowAboveRoot) 

if the path tries to go above the root, `up` ends up > 0

      var up = 0

      for  i = parts.length - 1 down to 0

        var last = parts[i]
        if last is '.'
          parts.splice(i, 1)
        
        else if last is '..'
          parts.splice(i, 1)
          up++

        else if up
          parts.splice(i, 1)
          up--
        
if the path is allowed to go above the root, restore leading ..s

      if allowAboveRoot
        for n=0 to up
          parts.unshift '..'

      return parts


    function splitPath(filename:string) returns array of string

Split a filename into [root, dir, basename, ext], unix version.
'root' is just a slash, or nothing.

var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

        var result: string array = []

        var parts = filename.split('/')

        if no parts[0] # starts with "/"
            result.push "/"  # result[0] is root
        else
            # do not start with "/"
            result.push "" # result[0] is root = ""

        var dir = parts.slice(1,-1).join("/") #rejoin 2nd to last-1 to make "dir"
        if dir, dir = "#{dir}/"
        result.push dir

        // now basename
        var basename:string = parts.slice(-1)[0] //last part
        result.push basename

now the extension.
split on ".", last is extension

        parts=basename.split('.') 

        if parts.length is 1 //no extension, only filename
            result.push "" 
        else
            result.push ".#{parts.pop()}" 
            
            
        return result
  
  // path.resolve([from ...], to)
  // posix version

    public function resolve

        var 
            resolvedPath = ''
            resolvedAbsolute = false
            args = arguments.toArray()

        for i = args.length - 1, while i >= -1 and not resolvedAbsolute, i--

            var path:string = i>=0 ? args[i] else process.cwd()

            // Skip empty and invalid entries
            if no path, continue

            if type of path isnt 'string'
                fail with 'Arguments to path.resolve must be strings'

            resolvedPath = "#{path}/#{resolvedPath}"
            resolvedAbsolute = path.charAt(0) is '/'

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path

        //resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
        //  return !!p;
        //}), !resolvedAbsolute).join('/');

        //filter out empty parts
        var partsOK = []
        for each part in resolvedPath.split('/')
            where part
                partsOK.push part

        resolvedPath = normalizeArray(partsOK, allowAboveRoot = not resolvedAbsolute).join('/')

        return "#{resolvedAbsolute? '/' : ''}#{resolvedPath}" or '.'

// path.normalize(path)
// posix version

    public function normalize(path) 

        var 
            isAbs = isAbsolute(path)
            trailingSlash = path.charAt(path.length - 1) is '/'
            segments:array = path.split('/')
            nonEmptySegments = []

        // Normalize the path
        for each segment in segments
          where segment
            nonEmptySegments.push segment

        path = normalizeArray(nonEmptySegments, allowAboveRoot = not isAbs).join('/')

        if no path and not isAbs
          path = '.'
        
        if path and trailingSlash
          path = '#{path}/'
        
        return "#{isAbs? '/' : ''}#{path}"
      

// posix version

    public function isAbsolute(path:string) 
        return path.charAt(0) is '/'
  

// posix version

    public function join

        var path = ''

        for each segment in arguments.toArray()

            if no segment, continue

            if type of segment isnt 'string'
                fail with 'Arguments to path.join must be strings'
              
            if no path 
                path = segment
            else 
                path = '#{path}/#{segment}'

        return normalize(path)



// path.relative(from, to)
// posix version

    public function relative(from:string, toPath:string) 

        from = resolve(from).substr(1)
        toPath = resolve(toPath).substr(1)

        var fromParts:array = trim(from.split('/'))
        var toParts:array = trim(toPath.split('/'))

        var length = fromParts.length<toParts.length? fromParts.length : toParts.length

        var samePartsLength = length
        for i = 0 while i < length
          if fromParts[i] isnt toParts[i]
            samePartsLength = i
            break

        var outputParts = []
        for i = samePartsLength, while i < fromParts.length
          outputParts.push('..')
        
        outputParts = outputParts.concat(toParts.slice(samePartsLength))

        return outputParts.join('/')


    helper function trim(arr:array) returns array

        var start = 0

        while start < arr.length
            if arr[start] isnt '', break
            start++

        var endPos = arr.length - 1
        
        while endPos >= 0
            if arr[endPos] isnt '', break
            endPos--

        if start > endPos, return []

        return arr.slice(start, endPos + 1)
        

    public var sep = '/'
    public var delimiter = ':'


    public function dirname(path) 

        var 
            result = splitPath(path)
            root:string = result[0]
            dir:string = result[1]

        if no root and no dir
            // No dirname whatsoever
            return '.'
          

        if dir
            // It has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1)
        
        return "#{root}#{dir}"



    public function basename(path:string, ext:string) 

         var f:string = splitPath(path)[2]

         // TODO: make this comparison case-insensitive on windows?

         if ext and f.substr(-1 * ext.length) is ext
            f = f.substr(0, f.length - ext.length)
         
         return f



    public function extname(path) 
        return splitPath(path)[3]


    //public function exists (path, callback) 
    // path.exists is now called `fs.exists`


    //public function existsSync = util.deprecate(function(path) {
    // return require('fs').existsSync(path);
    // }, 'path.existsSync is now called `fs.existsSync`.');

