#include "TestOut.h"
//-------------------------
//Module TestOut
//-------------------------
//-------------------------
//NAMESPACE TestOut
//-------------------------
any TestOut_mkSorted(DEFAULT_ARGUMENTS); //forward declare
any TestOut_saveFiles(DEFAULT_ARGUMENTS); //forward declare
var TestOut_indent;
any TestOut_recursive_mkSorted(DEFAULT_ARGUMENTS); //forward declare

    //import fs, mkPath
    

//### public function mkSorted(name:string, obj) returns array of string
    any TestOut_mkSorted(DEFAULT_ARGUMENTS){
        // define named params
        var name, obj;
        name=obj=undefined;
        switch(argc){
          case 2:obj=arguments[1];
          case 1:name=arguments[0];
        }
        //---------

        //var result:array=[] 
        var result = new(Array,0,NULL)
       ;
        //recursive_mkSorted(name,obj,result)
        TestOut_recursive_mkSorted(undefined,3,(any_arr){name
           , obj
           , result
       });
        //return result
        return result;
    return undefined;
    }


//### public function saveFiles(outPath, result:array)
    any TestOut_saveFiles(DEFAULT_ARGUMENTS){
        // define named params
        var outPath, result;
        outPath=result=undefined;
        switch(argc){
          case 2:result=arguments[1];
          case 1:outPath=arguments[0];
        }
        //---------

        //mkPath.create outPath
        mkPath_create(undefined,1,(any_arr){outPath
       });

        //var maxFiles = 5
        var maxFiles = any_number(5)
       ;

        //var startFile=0
        var startFile = any_number(0)
       ;
        //var sli=10000
        var sli = any_number(10000)
       ;
        //slice to be able to use Kompare
        //while startFile<maxFiles and startFile*sli<result.length
        while(_anyToNumber(startFile) < _anyToNumber(maxFiles) && _anyToNumber(startFile) * _anyToNumber(sli) < _length(result)){
            //fs.writeFileSync("#{outPath}/#{startFile}", result.slice(startFile*sli,startFile*sli+sli).join("\n"))
            fs_writeFileSync(undefined,2,(any_arr){_concatAny(3,outPath
               , any_LTR("/")
               , startFile
           )
               , __call(join_,METHOD(slice_,result)(result,2,(any_arr){any_number(_anyToNumber(startFile) * _anyToNumber(sli))
                  , any_number(_anyToNumber(startFile) * _anyToNumber(sli) + _anyToNumber(sli))
              }),1,(any_arr){any_LTR("\n")
             })
           });
            //startFile++
            startFile.value.number++;
        };// end loop
        
    return undefined;
    }



//private module vars

    //var indent=""

//### helper function recursive_mkSorted(name:string, value, result:array)
    any TestOut_recursive_mkSorted(DEFAULT_ARGUMENTS){
        // define named params
        var name, value, result;
        name=value=result=undefined;
        switch(argc){
          case 3:result=arguments[2];
          case 2:value=arguments[1];
          case 1:name=arguments[0];
        }
        //---------

//hacks, skip undefined and property "file"

        //if value is undefined, return
        if (__is(value,undefined)) {return undefined;};
        //if name.slice(-4) is "file", return
        //if name is "file", return
        if (__is(name,any_LTR("file"))) {return undefined;};

        //indent &= "  "
        TestOut_indent=_concatAny(2,TestOut_indent,any_LTR("  "));

        //var title = name
        var title = name
       ;
        //if title.slice(-3) is "end", title &= "pos"

//hack: names changed because LS reserved words: end, property & properties

        //case title 
        var _case1=title;
            //when "end"  : title = "endpos"
            if (__is(_case1,any_LTR("end"))){
                title = any_LTR("endpos");
            }
            //when "prop" : title = "property"
            else if (__is(_case1,any_LTR("prop"))){
                title = any_LTR("property");
            }
            //when "props": title = "properties"
            else if (__is(_case1,any_LTR("props"))){
                title = any_LTR("properties");
            };


        //var resultLine = indent & title & ":"
        var resultLine = _concatAny(2,_concatAny(2,TestOut_indent,title),any_LTR(":"))
       ;

        //if Array.isArray(value)
        if (_anyToBool(Array_isArray(undefined,1,(any_arr){value
       })))  {

            //declare value:Array
            

            //resultLine &= "["
            resultLine=_concatAny(2,resultLine,any_LTR("["));

            //if value.length is 0
            if (__is(any_number(_length(value)),any_number(0)))  {
                //resultLine &= "]"
                resultLine=_concatAny(2,resultLine,any_LTR("]"));
                //result.push resultLine
                METHOD(push_,result)(result,1,(any_arr){resultLine
               });
            }

            //else
            
            else {
                //result.push resultLine
                METHOD(push_,result)(result,1,(any_arr){resultLine
               });
                //declare value:array
                
                //for each inx,item in value
                {
                var iter=_newIterPos(); int __inx=0;
                for(int __inx=0; ITER_NEXT(value,iter); __inx++ ){
                  var item=PROP(value_,iter), inx=PROP(key_,iter), item__inx=any_number(__inx);
                
                    //outSorted "#{title}[#{inx}]", item, result
                    //recursive_mkSorted inx, item, result
                    TestOut_recursive_mkSorted(undefined,3,(any_arr){inx
                       , item
                       , result
                   });
                }};// end for each loop

                //result.push "#{indent}]//#{title}"
                METHOD(push_,result)(result,1,(any_arr){_concatAny(3,TestOut_indent
                   , any_LTR("]//")
                   , title
               )
               });
            };
        }

        //else if value and value.constructor.name is "RegExp"
        
        else if (_anyToBool(value) && __is(PROP(name_,any_class(value.class)),any_LTR("RegExp")))  {
            //ifdef TARGET_C
            //resultLine &= " " & JSON.stringify(value.tryGetProperty("source"))
            resultLine=_concatAny(2,resultLine,_concatAny(2,any_LTR(" "),JSON_stringify(undefined,1,(any_arr){METHOD(tryGetProperty_,value)(value,1,(any_arr){any_LTR("source")
           })
           })));
            //else
            //resultLine &= " " & JSON.stringify(value["source"])
            //endif
            //result.push resultLine
            METHOD(push_,result)(result,1,(any_arr){resultLine
           });
        }

        //else if typeof value is 'object'
        
        else if (__is(_typeof(value),any_LTR("object")))  {

            //if value and value.constructor, resultLine &= ":#{value.constructor.name}={"

            //result.push resultLine
            METHOD(push_,result)(result,1,(any_arr){resultLine
           });

            //var arr= [] //Object.keys(value)
            var arr = new(Array,0,NULL)
           ; //Object.keys(value)
            //for each own property propName,propValue in value 
            {len_t __propCount=_length(value); any propName=undefined; any propValue=undefined;
            for(int __propIndex=0 ; __propIndex < __propCount ; __propIndex++ ){
                NameValuePair_s _nvp = _unifiedGetNVPAtIndex(value, __propIndex);
                propValue= _nvp.value;propName= _nvp.name;
            
                //arr.push propName
                METHOD(push_,arr)(arr,1,(any_arr){propName
               });
            }};// end for each property in value

            //arr.sort
            METHOD(sort_,arr)(arr,0,NULL);

            //for each propName in arr
            {
            var iter=_newIterPos(); int __inx=0;
            for(int __inx=0; ITER_NEXT(arr,iter); __inx++ ){
              var propName=PROP(value_,iter), propName__name=PROP(key_,iter), propName__inx=any_number(__inx);
            
                //outSorted "#{title}.#{propName}", value[propName], result
                //ifdef TARGET_C
                //recursive_mkSorted propName, value.tryGetProperty(propName), result
                TestOut_recursive_mkSorted(undefined,3,(any_arr){propName
                   , METHOD(tryGetProperty_,value)(value,1,(any_arr){propName
                  })
                   , result
               });
            }};// end for each loop
                //else
                //recursive_mkSorted propName, value[propName], result
                //endif

            //result.push "#{indent}}//#{title}"
            METHOD(push_,result)(result,1,(any_arr){_concatAny(3,TestOut_indent
               , any_LTR("}//")
               , title
           )
           });
        }

        //else
        
        else {

            //resultLine &= " " & JSON.stringify(value)
            resultLine=_concatAny(2,resultLine,_concatAny(2,any_LTR(" "),JSON_stringify(undefined,1,(any_arr){value
           })));
            //result.push resultLine
            METHOD(push_,result)(result,1,(any_arr){resultLine
           });
        };


        //indent=indent.slice(0,-2)
        TestOut_indent = METHOD(slice_,TestOut_indent)(TestOut_indent,2,(any_arr){any_number(0)
           , any_number(-2)
       });
    return undefined;
    }
//------------------
void TestOut__namespaceInit(void){
    TestOut_indent = any_EMPTY_STR;
};


//-------------------------
void TestOut__moduleInit(void){
    TestOut__namespaceInit();
};
