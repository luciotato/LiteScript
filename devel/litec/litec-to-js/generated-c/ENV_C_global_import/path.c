#include "path.h"
//-------------------------
//Module path
//-------------------------
#include "path.c.extra"
//-------------------------
//NAMESPACE path
//-------------------------
any path_normalizeArray(DEFAULT_ARGUMENTS); //forward declare
any path_splitPath(DEFAULT_ARGUMENTS); //forward declare
any path_resolve(DEFAULT_ARGUMENTS); //forward declare
any path_normalize(DEFAULT_ARGUMENTS); //forward declare
any path_isAbsolute(DEFAULT_ARGUMENTS); //forward declare
any path_join(DEFAULT_ARGUMENTS); //forward declare
any path_relative(DEFAULT_ARGUMENTS); //forward declare
any path_trim(DEFAULT_ARGUMENTS); //forward declare
var path_sep;
var path_delimiter;
any path_dirname(DEFAULT_ARGUMENTS); //forward declare
any path_basename(DEFAULT_ARGUMENTS); //forward declare
any path_extname(DEFAULT_ARGUMENTS); //forward declare
//##Helper "path" namespace
//Translated to Litescript from node's sources, https://github.com/joyent/node/edit/master/lib/path.js
//minus "windows version" parts, and witout RegEx, in order to compile in LiteC
//// "path" - LiteScript Version
//// Copyright Lucio M. Tato
//// for the LiteScript litec compiler
//// Original:
////
//// Copyright Joyent, Inc. and other Node contributors.
////
//// Permission is hereby granted, free of charge, to any person obtaining a
//// copy of this software and associated documentation files (the
//// "Software"), to deal in the Software without restriction, including
//// without limitation the rights to use, copy, modify, merge, publish,
//// distribute, sublicense, and/or sell copies of the Software, and to permit
//// persons to whom the Software is furnished to do so, subject to the
//// following conditions:
////
//// The above copyright notice and this permission notice shall be included
//// in all copies or substantial portions of the Software.
////
//// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//// USE OR OTHER DEALINGS IN THE SOFTWARE.
//// resolves . and .. elements in a path array with directory names there
//// must be no slashes, empty elements, or device names (c:\) in the array
//// (so also no leading and trailing slashes - it does not distinguish
//// relative and absolute paths)
    //function normalizeArray(parts:array, allowAboveRoot) 
    any path_normalizeArray(DEFAULT_ARGUMENTS){
      // define named params
      var parts, allowAboveRoot;
      parts=allowAboveRoot=undefined;
      switch(argc){
        case 2:allowAboveRoot=arguments[1];
        case 1:parts=arguments[0];
      }
      //---------
//if the path tries to go above the root, `up` ends up > 0
      //var up = 0
      var 
        up = any_number(0)
;
      //for  i = parts.length - 1 down to 0
      int64_t _end1=0;
      for(int64_t i=_length(parts) - 1; i>=_end1; i--){
        //var last = parts[i]
        var 
        last = ITEM(i,parts)
;
        //if last is '.'
        if (__is(last,any_LTR(".")))  {
          //parts.splice(i, 1)
          METHOD(splice_,parts)(parts,2,(any_arr){
        any_number(i), 
        any_number(1)
});
        }
        
        //else if last is '..'
        
        else if (__is(last,any_LTR("..")))  {
          //parts.splice(i, 1)
          METHOD(splice_,parts)(parts,2,(any_arr){
        any_number(i), 
        any_number(1)
});
          //up++
          up.value.number++;
        }
        //else if up
        
        else if (_anyToBool(up))  {
          //parts.splice(i, 1)
          METHOD(splice_,parts)(parts,2,(any_arr){
        any_number(i), 
        any_number(1)
});
          //up--
          up.value.number--;
        };
      };// end for i
        
//if the path is allowed to go above the root, restore leading ..s
      //if allowAboveRoot
      if (_anyToBool(allowAboveRoot))  {
        //for n=0 to up
        int64_t _end2=_anyToNumber(up);
        for(int64_t n=0; n<=_end2; n++){
          //parts.unshift '..'
          METHOD(unshift_,parts)(parts,1,(any_arr){
        any_LTR("..")
});
        };// end for n
        
      };
      //return parts
      return parts;
    return undefined;
    }
    //function splitPath(filename:string) returns array of string
    any path_splitPath(DEFAULT_ARGUMENTS){
        // define named params
        var filename= argc? arguments[0] : undefined;
        //---------
//Split a filename into [root, dir, basename, ext], unix version.
//'root' is just a slash, or nothing.
//var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        //var result: string array = []
        var 
        result = new(Array,0,NULL)
;
        //var parts = filename.split('/')
        var 
        parts = METHOD(split_,filename)(filename,1,(any_arr){
        any_LTR("/")
})
;
        //if no parts[0] # starts with "/"
        if (!_anyToBool(ITEM(0,parts)))  {// # starts with "/"
            //result.push "/"  # result[0] is root
            METHOD(push_,result)(result,1,(any_arr){
        any_LTR("/")
});// # result[0] is root
        }
        //else
        
        else {
            //# do not start with "/"
            //result.push "" # result[0] is root = ""
            METHOD(push_,result)(result,1,(any_arr){
        any_EMPTY_STR
});// # result[0] is root = ""
        };
        //var dir = parts.slice(1,-1).join("/") #rejoin 2nd to last-1 to make "dir"
        var 
        dir = __call(join_,METHOD(slice_,parts)(parts,2,(any_arr){
        any_number(1), 
        any_number(-1)
}),1,(any_arr){
        any_LTR("/")
})
;// #rejoin 2nd to last-1 to make "dir"
        //if dir, dir = "#{dir}/"
        if (_anyToBool(dir)) {dir = _concatAny(2,
        dir, 
        any_LTR("/")
);};
        //result.push dir
        METHOD(push_,result)(result,1,(any_arr){
        dir
});
        //// now basename
        //var basename:string = parts.slice(-1)[0] //last part
        var 
        basename = ITEM(0,METHOD(slice_,parts)(parts,1,(any_arr){
        any_number(-1)
}))
; //last part
        //result.push basename
        METHOD(push_,result)(result,1,(any_arr){
        basename
});
//now the extension.
//split on ".", last is extension
        //parts=basename.split('.') 
        parts = METHOD(split_,basename)(basename,1,(any_arr){
        any_LTR(".")
});
        //if parts.length is 1 //no extension, only filename
        if (__is(any_number(_length(parts)),any_number(1)))  { //no extension, only filename
            //result.push "" 
            METHOD(push_,result)(result,1,(any_arr){
        any_EMPTY_STR
});
        }
        //else
        
        else {
            //result.push ".#{parts.pop()}" 
            METHOD(push_,result)(result,1,(any_arr){
        _concatAny(2,
        any_LTR("."), 
        (METHOD(pop_,parts)(parts,0,NULL))
)
});
        };
            
            
        //return result
        return result;
    return undefined;
    }
  
  //// path.resolve([from ...], to)
  //// posix version
    //public function resolve
    any path_resolve(DEFAULT_ARGUMENTS){
        //var 
            //resolvedPath = ''
            //resolvedAbsolute = false
            //args = arguments.toArray()
        var 
        resolvedPath = any_EMPTY_STR, 
        resolvedAbsolute = false, 
        args = _newArray(argc,arguments)
;
        //for i = args.length - 1, while i >= -1 and not resolvedAbsolute, i--
        for(int64_t i=_length(args) - 1; i >= -1 && !(_anyToBool(resolvedAbsolute)); i--){
            //var path:string = i>=0 ? args[i] else process.cwd()
            var 
        path = i >= 0 ? ITEM(i,args) : process_cwd(undefined,0,NULL)
;
            //// Skip empty and invalid entries
            //if no path, continue
            if (!_anyToBool(path)) {continue;};
            //if type of path isnt 'string'
            if (!__is(_typeof(path),any_LTR("string")))  {
                //fail with 'Arguments to path.resolve must be strings'
                throw(new(Error,1,(any_arr){any_LTR("Arguments to path.resolve must be strings")}));;
            };
            //resolvedPath = "#{path}/#{resolvedPath}"
            resolvedPath = _concatAny(3,
        path, 
        any_LTR("/"), 
        resolvedPath
);
            //resolvedAbsolute = path.charAt(0) is '/'
            resolvedAbsolute = any_number(__is(METHOD(charAt_,path)(path,1,(any_arr){
        any_number(0)
}),any_LTR("/")));
        };// end for i
//// At this point the path should be resolved to a full absolute path, but
//// handle relative paths to be safe (might happen when process.cwd() fails)
//// Normalize the path
        ////resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
        ////  return !!p;
        ////}), !resolvedAbsolute).join('/');
        ////filter out empty parts
        //var partsOK = []
        var 
        partsOK = new(Array,0,NULL)
;
        //for each part in resolvedPath.split('/')
        any _list1=METHOD(split_,resolvedPath)(resolvedPath,1,(any_arr){
        any_LTR("/")
});
        { var part=undefined;
        for(int part__inx=0 ; part__inx<_list1.value.arr->length ; part__inx++){part=ITEM(part__inx,_list1);
          
            //where part
            if(_anyToBool(part)){
                //partsOK.push part
                METHOD(push_,partsOK)(partsOK,1,(any_arr){
        part
});
        }}};// end for each in
        //resolvedPath = normalizeArray(partsOK, allowAboveRoot = not resolvedAbsolute).join('/')
        resolvedPath = __call(join_,path_normalizeArray(undefined,2,(any_arr){
        partsOK, 
        any_number(!(_anyToBool(resolvedAbsolute)))
}),1,(any_arr){
        any_LTR("/")
});
        //return "#{resolvedAbsolute? '/' : ''}#{resolvedPath}" or '.'
        return (_anyToBool(__or1=_concatAny(2,
        (_anyToBool(resolvedAbsolute) ? any_LTR("/") : any_EMPTY_STR), 
        resolvedPath
))? __or1 : any_LTR("."));
    return undefined;
    }
//// path.normalize(path)
//// posix version
    //public function normalize(path) 
    any path_normalize(DEFAULT_ARGUMENTS){
        // define named params
        var path= argc? arguments[0] : undefined;
        //---------
        //var 
            //isAbs = isAbsolute(path)
            //trailingSlash = path.charAt(path.length - 1) is '/'
            //segments:array = path.split('/')
            //nonEmptySegments = []
        var 
        isAbs = path_isAbsolute(undefined,1,(any_arr){
        path
}), 
        trailingSlash = any_number(__is(METHOD(charAt_,path)(path,1,(any_arr){
        any_number(_length(path) - 1)
}),any_LTR("/"))), 
        segments = METHOD(split_,path)(path,1,(any_arr){
        any_LTR("/")
}), 
        nonEmptySegments = new(Array,0,NULL)
;
        //// Normalize the path
        //for each segment in segments
        any _list2=segments;
        { var segment=undefined;
        for(int segment__inx=0 ; segment__inx<_list2.value.arr->length ; segment__inx++){segment=ITEM(segment__inx,_list2);
          
          //where segment
          if(_anyToBool(segment)){
            //nonEmptySegments.push segment
            METHOD(push_,nonEmptySegments)(nonEmptySegments,1,(any_arr){
        segment
});
        }}};// end for each in
        //path = normalizeArray(nonEmptySegments, allowAboveRoot = not isAbs).join('/')
        path = __call(join_,path_normalizeArray(undefined,2,(any_arr){
        nonEmptySegments, 
        any_number(!(_anyToBool(isAbs)))
}),1,(any_arr){
        any_LTR("/")
});
        //if no path and not isAbs
        if (!_anyToBool(path) && !(_anyToBool(isAbs)))  {
          //path = '.'
          path = any_LTR(".");
        };
        
        //if path and trailingSlash
        if (_anyToBool(path) && _anyToBool(trailingSlash))  {
          //path = '#{path}/'
          path = _concatAny(2,
        path, 
        any_LTR("/")
);
        };
        
        //return "#{isAbs? '/' : ''}#{path}"
        return _concatAny(2,
        (_anyToBool(isAbs) ? any_LTR("/") : any_EMPTY_STR), 
        path
);
    return undefined;
    }
      
//// posix version
    //public function isAbsolute(path:string) 
    any path_isAbsolute(DEFAULT_ARGUMENTS){
        // define named params
        var path= argc? arguments[0] : undefined;
        //---------
        //return path.charAt(0) is '/'
        return any_number(__is(METHOD(charAt_,path)(path,1,(any_arr){
        any_number(0)
}),any_LTR("/")));
    return undefined;
    }
  
//// posix version
    //public function join
    any path_join(DEFAULT_ARGUMENTS){
        //var path = ''
        var 
        path = any_EMPTY_STR
;
        //for each segment in arguments.toArray()
        any _list3=_newArray(argc,arguments);
        { var segment=undefined;
        for(int segment__inx=0 ; segment__inx<_list3.value.arr->length ; segment__inx++){segment=ITEM(segment__inx,_list3);
        
            //if no segment, continue
            if (!_anyToBool(segment)) {continue;};
            //if type of segment isnt 'string'
            if (!__is(_typeof(segment),any_LTR("string")))  {
                //fail with 'Arguments to path.join must be strings'
                throw(new(Error,1,(any_arr){any_LTR("Arguments to path.join must be strings")}));;
            };
              
            //if no path 
            if (!_anyToBool(path))  {
                //path = segment
                path = segment;
            }
            //else 
            
            else {
                //path = '#{path}/#{segment}'
                path = _concatAny(3,
        path, 
        any_LTR("/"), 
        segment
);
            };
        }};// end for each in
        //return normalize(path)
        return path_normalize(undefined,1,(any_arr){
        path
});
    return undefined;
    }
//// path.relative(from, to)
//// posix version
    //public function relative(from:string, toPath:string) 
    any path_relative(DEFAULT_ARGUMENTS){
        // define named params
        var from, toPath;
        from=toPath=undefined;
        switch(argc){
          case 2:toPath=arguments[1];
          case 1:from=arguments[0];
        }
        //---------
        //from = resolve(from).substr(1)
        from = __call(substr_,path_resolve(undefined,1,(any_arr){
        from
}),1,(any_arr){
        any_number(1)
});
        //toPath = resolve(toPath).substr(1)
        toPath = __call(substr_,path_resolve(undefined,1,(any_arr){
        toPath
}),1,(any_arr){
        any_number(1)
});
        //var fromParts:array = trim(from.split('/'))
        var 
        fromParts = path_trim(undefined,1,(any_arr){
        METHOD(split_,from)(from,1,(any_arr){
        any_LTR("/")
})
})
;
        //var toParts:array = trim(toPath.split('/'))
        var 
        toParts = path_trim(undefined,1,(any_arr){
        METHOD(split_,toPath)(toPath,1,(any_arr){
        any_LTR("/")
})
})
;
        //var length = fromParts.length<toParts.length? fromParts.length : toParts.length
        var 
        length = _length(fromParts) < _length(toParts) ? any_number(_length(fromParts)) : any_number(_length(toParts))
;
        //var samePartsLength = length
        var 
        samePartsLength = length
;
        //for i = 0 while i < length
        for(int64_t i=0; i < _anyToNumber(length); i++){
          //if fromParts[i] isnt toParts[i]
          if (!__is(ITEM(i,fromParts),ITEM(i,toParts)))  {
            //samePartsLength = i
            samePartsLength = any_number(i);
            //break
            break;
          };
        };// end for i
        //var outputParts = []
        var 
        outputParts = new(Array,0,NULL)
;
        //for i = samePartsLength, while i < fromParts.length
        for(int64_t i=_anyToNumber(samePartsLength); i < _length(fromParts); i++){
          //outputParts.push('..')
          METHOD(push_,outputParts)(outputParts,1,(any_arr){
        any_LTR("..")
});
        };// end for i
        
        //outputParts = outputParts.concat(toParts.slice(samePartsLength))
        outputParts = METHOD(concat_,outputParts)(outputParts,1,(any_arr){
        METHOD(slice_,toParts)(toParts,1,(any_arr){
        samePartsLength
})
});
        //return outputParts.join('/')
        return METHOD(join_,outputParts)(outputParts,1,(any_arr){
        any_LTR("/")
});
    return undefined;
    }
    //helper function trim(arr:array) returns array
    any path_trim(DEFAULT_ARGUMENTS){
        // define named params
        var arr= argc? arguments[0] : undefined;
        //---------
        //var start = 0
        var 
        start = any_number(0)
;
        //while start < arr.length
        while(_anyToNumber(start) < _length(arr)){
            //if arr[start] isnt '', break
            if (!__is(ITEM(_anyToNumber(start),arr),any_EMPTY_STR)) {break;};
            //start++
            start.value.number++;
        };// end loop
        //var endPos = arr.length - 1
        var 
        endPos = any_number(_length(arr) - 1)
;
        
        //while endPos >= 0
        while(_anyToNumber(endPos) >= 0){
            //if arr[endPos] isnt '', break
            if (!__is(ITEM(_anyToNumber(endPos),arr),any_EMPTY_STR)) {break;};
            //endPos--
            endPos.value.number--;
        };// end loop
        //if start > endPos, return []
        if (_anyToNumber(start) > _anyToNumber(endPos)) {return new(Array,0,NULL);};
        //return arr.slice(start, endPos + 1)
        return METHOD(slice_,arr)(arr,2,(any_arr){
        start, 
        any_number(_anyToNumber(endPos) + 1)
});
    return undefined;
    }
        
    //public var sep = '/'
    //public var delimiter = ':'
    //public function dirname(path) 
    any path_dirname(DEFAULT_ARGUMENTS){
        // define named params
        var path= argc? arguments[0] : undefined;
        //---------
        //var 
            //result = splitPath(path)
            //root:string = result[0]
            //dir:string = result[1]
        var 
        result = path_splitPath(undefined,1,(any_arr){
        path
}), 
        root = ITEM(0,result), 
        dir = ITEM(1,result)
;
        //if no root and no dir
        if (!_anyToBool(root) && !_anyToBool(dir))  {
            //// No dirname whatsoever
            //return '.'
            return any_LTR(".");
        };
          
        //if dir
        if (_anyToBool(dir))  {
            //// It has a dirname, strip trailing slash
            //dir = dir.substr(0, dir.length - 1)
            dir = METHOD(substr_,dir)(dir,2,(any_arr){
        any_number(0), 
        any_number(_length(dir) - 1)
});
        };
        
        //return "#{root}#{dir}"
        return _concatAny(2,
        root, 
        dir
);
    return undefined;
    }
    //public function basename(path:string, ext:string) 
    any path_basename(DEFAULT_ARGUMENTS){
         // define named params
         var path, ext;
         path=ext=undefined;
         switch(argc){
           case 2:ext=arguments[1];
           case 1:path=arguments[0];
         }
         //---------
         //var f:string = splitPath(path)[2]
         var 
        f = ITEM(2,path_splitPath(undefined,1,(any_arr){
        path
}))
;
         //// TODO: make this comparison case-insensitive on windows?
         //if ext and f.substr(-1 * ext.length) is ext
         if (_anyToBool(ext) && __is(METHOD(substr_,f)(f,1,(any_arr){
        any_number(-1 * _length(ext))
}),ext))  {
            //f = f.substr(0, f.length - ext.length)
            f = METHOD(substr_,f)(f,2,(any_arr){
        any_number(0), 
        any_number(_length(f) - _length(ext))
});
         };
         
         //return f
         return f;
    return undefined;
    }
    //public function extname(path) 
    any path_extname(DEFAULT_ARGUMENTS){
        // define named params
        var path= argc? arguments[0] : undefined;
        //---------
        //return splitPath(path)[3]
        return ITEM(3,path_splitPath(undefined,1,(any_arr){
        path
}));
    return undefined;
    }
//------------------
void path__namespaceInit(void){
    path_sep = any_LTR("/");
    path_delimiter = any_LTR(":");
};


//-------------------------
void path__moduleInit(void){
    path__namespaceInit();
};
