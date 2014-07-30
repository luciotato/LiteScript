#include "ASTBase.h"
//-------------------------
//Module ASTBase
//-------------------------
#include "ASTBase.c.extra"
    //-----------------------
    // Class ASTBase: static list of METHODS(verbs) and PROPS(things)
    //-----------------------
    
    static _methodInfoArr ASTBase_METHODS = {
      { lock_, ASTBase_lock },
      { getParent_, ASTBase_getParent },
      { positionText_, ASTBase_positionText },
      { toString_, ASTBase_toString },
      { sayErr_, ASTBase_sayErr },
      { warn_, ASTBase_warn },
      { throwError_, ASTBase_throwError },
      { throwParseFailed_, ASTBase_throwParseFailed },
      { parse_, ASTBase_parse },
      { produce_, ASTBase_produce },
      { parseDirect_, ASTBase_parseDirect },
      { opt_, ASTBase_opt },
      { req_, ASTBase_req },
      { reqOneOf_, ASTBase_reqOneOf },
      { optList_, ASTBase_optList },
      { optSeparatedList_, ASTBase_optSeparatedList },
      { optFreeFormList_, ASTBase_optFreeFormList },
      { reqSeparatedList_, ASTBase_reqSeparatedList },
      { listArgs_, ASTBase_listArgs },
      { out_, ASTBase_out },
      { outSourceLineAsComment_, ASTBase_outSourceLineAsComment },
      { outSourceLinesAsComment_, ASTBase_outSourceLinesAsComment },
      { getEOLComment_, ASTBase_getEOLComment },
      { addSourceMap_, ASTBase_addSourceMap },
      { levelIndent_, ASTBase_levelIndent },
      { parseAccessors_, ASTBase_parseAccessors },
      { addAccessor_, ASTBase_addAccessor },
      { hasAdjective_, ASTBase_hasAdjective },
      { parseType_, ASTBase_parseType },
      { declareName_, ASTBase_declareName },
      { addMemberTo_, ASTBase_addMemberTo },
      { tryGetMember_, ASTBase_tryGetMember },
      { getScopeNode_, ASTBase_getScopeNode },
      { findInScope_, ASTBase_findInScope },
      { tryGetFromScope_, ASTBase_tryGetFromScope },
      { addToScope_, ASTBase_addToScope },
      { addToSpecificScope_, ASTBase_addToSpecificScope },
      { createScope_, ASTBase_createScope },
      { tryGetOwnerNameDecl_, ASTBase_tryGetOwnerNameDecl },
      { callOnSubTree_, ASTBase_callOnSubTree },
      { assignIfUndefined_, ASTBase_assignIfUndefined },
    
    {0,0}}; //method jmp table initializer end mark
    
    static propIndex_t ASTBase_PROPS[] = {
    parent_
    , childs_
    , name_
    , keyword_
    , type_
    , keyType_
    , itemType_
    , lexer_
    , lineInx_
    , sourceLineNum_
    , column_
    , indent_
    , locked_
    , extraInfo_
    , accessors_
    , executes_
    , hasSideEffects_
    , isMap_
    , scope_
    , skipSemiColon_
    };
    
    

//--------------
    // ASTBase
    any ASTBase; //Class ASTBase
    
    //auto ASTBase_newFromObject
    inline any ASTBase_newFromObject(DEFAULT_ARGUMENTS){
        return _newFromObject(ASTBase,argc,arguments);
    }
//The Abstract Syntax Tree (AST) Base class
//-----------------------------------------
//This module defines the base abstract syntax tree class used by the grammar. 
//It's main purpose is to provide utility methods used in the grammar 
//for **req**uired tokens, **opt**ional tokens 
//and comma or semicolon **Separated Lists** of symbols.
//Dependencies
    //import Parser, ControlledError
    //import logger
    
    //shim import LiteCore, Map
//### public Class ASTBase 
//This class serves as a base class on top of which Grammar classes are defined.
//It contains basic functions to parse a token stream.
//#### properties
        //parent: ASTBase 
        //childs: array of ASTBase
        //name:string, keyword:string
        //type, keyType, itemType
        //lexer: Parser.Lexer 
//AST node position in source
        //lineInx
        //sourceLineNum, column
        //indent 
//wile-parsing info
        //locked: boolean
        //extraInfo // if parse failed, extra information 
     ;
//#### Constructor (parent:ASTBase, name)
     void ASTBase__init(DEFAULT_ARGUMENTS){
        
        // define named params
        var parent, name;
        parent=name=undefined;
        switch(argc){
          case 2:name=arguments[1];
          case 1:parent=arguments[0];
        }
        //---------
        //.parent = parent
        PROP(parent_,this) = parent;
        //.name = name
        PROP(name_,this) = name;
//Get lexer from parent
        //if parent
        if (_anyToBool(parent))  {
            //.lexer = parent.lexer
            PROP(lexer_,this) = PROP(lexer_,parent);
//Remember this node source position.
//Also remember line index in tokenized lines, and indent
            //if .lexer 
            if (_anyToBool(PROP(lexer_,this)))  {
                //.sourceLineNum = .lexer.sourceLineNum
                PROP(sourceLineNum_,this) = PROP(sourceLineNum_,PROP(lexer_,this));
                //.column = .lexer.token.column
                PROP(column_,this) = PROP(column_,PROP(token_,PROP(lexer_,this)));
                //.indent = .lexer.indent
                PROP(indent_,this) = PROP(indent_,PROP(lexer_,this));
                //.lineInx = .lexer.lineInx
                PROP(lineInx_,this) = PROP(lineInx_,PROP(lexer_,this));
            };
        };
     }
        //#debug "created [#.constructor.name] indent #.indent col:#.column #{.lexer? .lexer.token:''}"
//------------------------------------------------------------------------
//#### method lock()
     any ASTBase_lock(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//**lock** marks this node as "locked", meaning we are certain this is the right class
//for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
//we are certain this is the right class to use, so we 'lock()'. 
//Once locked, any **req**uired token not present causes compilation to fail.
        //.locked = true
        PROP(locked_,this) = true;
     return undefined;
     }
//#### helper method getParent(searchedClass)
     any ASTBase_getParent(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var searchedClass= argc? arguments[0] : undefined;
        //---------
//**getParent** method searchs up the AST tree until a specfied node class is found
        //var node = this.parent
        var node = PROP(parent_,this);
        //while node and node isnt instance of searchedClass
        while(_anyToBool(node) && !(_instanceof(node,searchedClass))){
            //node = node.parent # move to parent
            node = PROP(parent_,node);// # move to parent
        };// end loop
        //return node
        return node;
     return undefined;
     }
//#### helper method positionText() 
     any ASTBase_positionText(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        //if not .lexer or no .sourceLineNum, return "(compiler-defined)"    
        if (_anyToBool((_anyToBool(__or1=any_number(!(_anyToBool(PROP(lexer_,this)))))? __or1 : any_number(!_anyToBool(PROP(sourceLineNum_,this)))))) {return any_LTR("(compiler-defined)");};
        //return "#{.lexer.filename}:#{.sourceLineNum}:#{.column or 0}"
        return _concatAny(5,PROP(filename_,PROP(lexer_,this))
, any_LTR(":")
, PROP(sourceLineNum_,this)
, any_LTR(":")
, ((_anyToBool(__or2=PROP(column_,this))? __or2 : any_number(0)))
        );
     return undefined;
     }
  
//#### helper method toString()
     any ASTBase_toString(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        //return "[#{.constructor.name}]"
        return _concatAny(3,any_LTR("[")
, PROP(name_,any_class(this.class))
, any_LTR("]")
        );
     return undefined;
     }
//#### helper method sayErr(msg)
     any ASTBase_sayErr(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
        //logger.error .positionText(), msg
        logger_error(undefined,2,(any_arr){METHOD(positionText_,this)(this,0,NULL)
, msg
        });
     return undefined;
     }
//#### helper method warn(msg)
     any ASTBase_warn(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
        //logger.warning .positionText(), msg
        logger_warning(undefined,2,(any_arr){METHOD(positionText_,this)(this,0,NULL)
, msg
        });
     return undefined;
     }
//#### method throwError(msg)
     any ASTBase_throwError(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//**throwError** add node position info and throws a 'controlled' error.
//A 'controlled' error, shows only err.message
//A 'un-controlled' error is an unhandled exception in the compiler code itself, 
//and it shows error message *and stack trace*.
        //logger.throwControlled "#{.positionText()}. #{msg}"
        logger_throwControlled(undefined,1,(any_arr){_concatAny(3,(METHOD(positionText_,this)(this,0,NULL))
, any_LTR(". ")
, msg
        )
        });
     return undefined;
     }
//#### method throwParseFailed(msg)
     any ASTBase_throwParseFailed(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var msg= argc? arguments[0] : undefined;
        //---------
//throws a parseFailed-error
//During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
//"parse failed" signals a failure to parse the tokens from the stream, 
//however the syntax might still be valid for another AST node. 
//If the AST node was locked-on-target, it is a hard-error.
//If the AST node was NOT locked, it's a soft-error, and will not abort compilation 
//as the parent node will try other AST classes against the token stream before failing.
        ////var err = new Error("#{.positionText()}. #{msg}")
        //var cErr = new ControlledError("#{.lexer.posToString()}. #{msg}")
        var cErr = new(ControlledError,1,(any_arr){_concatAny(3,(__call(posToString_,PROP(lexer_,this),0,NULL))
, any_LTR(". ")
, msg
        )
        });
        //cErr.soft = not .locked
        PROP(soft_,cErr) = any_number(!(_anyToBool(PROP(locked_,this))));
        //throw cErr
        throw(cErr);
     return undefined;
     }
//#### method parse()
     any ASTBase_parse(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//abstract method representing the TRY-Parse of the node.
//Child classes _must_ override this method
      
        //.throwError 'Parser Not Implemented'
        METHOD(throwError_,this)(this,1,(any_arr){any_LTR("Parser Not Implemented")
        });
     return undefined;
     }
//#### method produce()
     any ASTBase_produce(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//**produce()** is the method to produce target code
//Target code produces should override this, if the default production isnt: `.out .name`
        //.out .name
        METHOD(out_,this)(this,1,(any_arr){PROP(name_,this)
        });
     return undefined;
     }
//#### method parseDirect(key, directMap)
     any ASTBase_parseDirect(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var key, directMap;
        key=directMap=undefined;
        switch(argc){
          case 2:directMap=arguments[1];
          case 1:key=arguments[0];
        }
        //---------
//We use a DIRECT associative array to pick the exact AST node to parse 
//based on the actual token value or type.
//This speeds up parsing, avoiding parsing by trial & error
//Check keyword
        //if directMap.get(key) into var param
        var param=undefined;
        if (_anyToBool((param=METHOD(get_,directMap)(directMap,1,(any_arr){key
        }))))  {
//try parse by calling .opt, accept Array as param
            
            //var statement = param instance of Array ? 
            var statement = _instanceof(param,Array) ? __applyArr(__classMethodFunc(opt_ ,ASTBase),this,param) : METHOD(opt_,this)(this,1,(any_arr){param
                    });
                    //ASTBase.prototype.opt.apply(this, param) 
                    //: .opt(param)
//return parsed statement or nothing
            //return statement
            return statement;
        };
     return undefined;
     }
//#### Method opt() returns ASTBase
     any ASTBase_opt(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//**opt** (optional) is for optional parts of a grammar. It attempts to parse 
//the token stream using one of the classes or token types specified.
//This method takes a variable number of arguments.
//For example:
  //calling `.opt IfStatement, Expression, 'IDENTIFIER'`
  //would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  //to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  //If all of those fail, it will return `undefined`.
//Method start:
//Remember the actual position, to rewind if all the arguments to `opt` fail
        //var startPos = .lexer.getPos()
        var startPos = __call(getPos_,PROP(lexer_,this),0,NULL);
        //#debug
        //var spaces = .levelIndent()
        var spaces = METHOD(levelIndent_,this)(this,0,NULL);
//For each argument, -a class or a string-, we will attempt to parse the token stream 
//with the class, or match the token type to the string.
        //for each searched in arguments.toArray()
        any _list9=_newArray(argc,arguments);
        { var searched=undefined;
        for(int searched__inx=0 ; searched__inx<_list9.value.arr->length ; searched__inx++){searched=ITEM(searched__inx,_list9);
        
//skip empty, null & undefined
          //if no searched, continue
          if (!_anyToBool(searched)) {continue;};
//determine value or type
//For strings we check the token **value** or **TYPE** (if searched is all-uppercase)
          //if typeof searched is 'string'
          if (__is(_typeof(searched),any_LTR("string")))  {
            //declare searched:string
            
            //#debug spaces, .constructor.name,'TRY',searched, 'on', .lexer.token.toString()
            //var isTYPE = searched.charAt(0)>="A" and searched.charAt(0)<="Z" and searched is searched.toUpperCase()
            var isTYPE = any_number(_anyToNumber(METHOD(charAt_,searched)(searched,1,(any_arr){any_number(0)
            })) >= 'A' && _anyToNumber(METHOD(charAt_,searched)(searched,1,(any_arr){any_number(0)
            })) <= 'Z' && __is(searched,METHOD(toUpperCase_,searched)(searched,0,NULL)));
            //var found
            var found = undefined;
            //if isTYPE 
            if (_anyToBool(isTYPE))  {
              //found = .lexer.token.type is searched
              found = any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),searched));
            }
            //else
            
            else {
              //found = .lexer.token.value is searched
              found = any_number(__is(PROP(value_,PROP(token_,PROP(lexer_,this))),searched));
            };
            //if found
            if (_anyToBool(found))  {
//Ok, type/value found! now we return: token.value
//Note: we shouldnt return the 'token' object, because returning objects (here and in js) 
//is a "pass by reference". You return a "pointer" to the object.
//If we return the 'token' object, the calling function will recive a "pointer"
//and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)
              //logger.debug spaces, .constructor.name,'matched OK:',searched, .lexer.token.value
              logger_debug(undefined,5,(any_arr){spaces
, PROP(name_,any_class(this.class))
, any_LTR("matched OK:")
, searched
, PROP(value_,PROP(token_,PROP(lexer_,this)))
              });
              //var result = .lexer.token.value 
              var result = PROP(value_,PROP(token_,PROP(lexer_,this)));
//Advance a token, .lexer.token always has next token
              //.lexer.nextToken()
              __call(nextToken_,PROP(lexer_,this),0,NULL);
              //return result
              return result;
            };
          }
          //else
          
          else {
//"searched" is an AST class
            //declare searched:Function //class
            
            //logger.debug spaces, .constructor.name,'TRY',searched.name, 'on', .lexer.token.toString()
            logger_debug(undefined,6,(any_arr){spaces
, PROP(name_,any_class(this.class))
, any_LTR("TRY")
, PROP(name_,searched)
, any_LTR("on")
, __call(toString_,PROP(token_,PROP(lexer_,this)),0,NULL)
            });
//if the argument is an AST node class, we instantiate the class and try the `parse()` method.
//`parse()` can fail with `ParseFailed` if the syntax do not match
            //try
            try{
                //var astNode:ASTBase = new searched(this) # create required ASTNode, to try parse
                var astNode = new(searched,1,(any_arr){this
                });// # create required ASTNode, to try parse
                //astNode.parse() # if it can't parse, will raise an exception
                METHOD(parse_,astNode)(astNode,0,NULL);// # if it can't parse, will raise an exception
                //logger.debug spaces, 'Parsed OK!->',searched.name
                logger_debug(undefined,3,(any_arr){spaces
, any_LTR("Parsed OK!->")
, PROP(name_,searched)
                });
                //return astNode # parsed ok!, return instance
                {e4c_exitTry(1);return astNode;};// # parsed ok!, return instance
            
            }catch(err){
            //catch err
                //if err isnt instance of ControlledError, throw err //re-raise if not ControlledError
                if (!(_instanceof(err,ControlledError))) {throw(err);};
                //declare err:ControlledError
                
                
//If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
//we will try other AST nodes.
                //if err.soft
                if (_anyToBool(PROP(soft_,err)))  {
                    //.lexer.softError = err
                    PROP(softError_,PROP(lexer_,this)) = err;
                    //logger.debug spaces, searched.name,'parse failed.',err.message
                    logger_debug(undefined,4,(any_arr){spaces
, PROP(name_,searched)
, any_LTR("parse failed.")
, PROP(message_,err)
                    });
//rewind the token stream, to try other AST nodes
                    //logger.debug "<<REW to", "#{startPos.sourceLineNum}:#{startPos.token.column or 0} [#{startPos.index}]", startPos.token.toString()
                    logger_debug(undefined,3,(any_arr){any_LTR("<<REW to")
, _concatAny(6,PROP(sourceLineNum_,startPos)
, any_LTR(":")
, ((_anyToBool(__or3=PROP(column_,PROP(token_,startPos)))? __or3 : any_number(0)))
, any_LTR(" [")
, PROP(index_,startPos)
, any_LTR("]")
                    )
, __call(toString_,PROP(token_,startPos),0,NULL)
                    });
                    //.lexer.setPos startPos
                    __call(setPos_,PROP(lexer_,this),1,(any_arr){startPos
                    });
                }
                //else
                
                else {
//else: it's a hard-error. The AST node were locked-on-target.
//We abort parsing and throw.
                    //# the first hard-error is the most informative, the others are cascading ones
                    //if .lexer.hardError is null, .lexer.hardError = err
                    if (__is(PROP(hardError_,PROP(lexer_,this)),null)) {PROP(hardError_,PROP(lexer_,this)) = err;};
//raise up, abort parsing
              
                    //raise err
                    throw(err);
                };
                //end if - type of error
                
            };
            //end catch
            
          };
            
          //end if - string or class
          
        }};// end for each in
        //end loop - try the next argument
        
//No more arguments.
//`opt` returns `undefined` if none of the arguments can be use to parse the token stream.
        //return undefined
        return undefined;
     return undefined;
     }
     //end method opt
     
//#### method req() returns ASTBase
     any ASTBase_req(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//**req** (required) if for required symbols of the grammar. It works the same way as `opt` 
//except that it throws an error if none of the arguments can be used to parse the stream.
//We first call `opt` to see what we get. If a value is returned, the function was successful,
//so we just return the node that `opt` found.
//else, If `opt` returned nothing, we give the user a useful error.
        //var result = ASTBase.prototype.opt.apply(this,arguments)
        var result = __applyArr(__classMethodFunc(opt_ ,ASTBase),this,_newArray(argc,arguments));
        //if no result 
        if (!_anyToBool(result))  {
          //.throwParseFailed "#{.constructor.name}:#{.extraInfo or ''} found #{.lexer.token.toString()} but #{.listArgs(arguments)} required"
          METHOD(throwParseFailed_,this)(this,1,(any_arr){_concatAny(8,PROP(name_,any_class(this.class))
, any_LTR(":")
, ((_anyToBool(__or4=PROP(extraInfo_,this))? __or4 : any_EMPTY_STR))
, any_LTR(" found ")
, (__call(toString_,PROP(token_,PROP(lexer_,this)),0,NULL))
, any_LTR(" but ")
, (METHOD(listArgs_,this)(this,1,(any_arr){_newArray(argc,arguments)
          }))
, any_LTR(" required")
          )
          });
        };
        //return result
        return result;
     return undefined;
     }
//#### method reqOneOf(arr)
     any ASTBase_reqOneOf(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var arr= argc? arguments[0] : undefined;
        //---------
//(performance) call req only if next token (value) in list
        
        //if .lexer.token.value in arr
        if (CALL1(indexOf_,arr,PROP(value_,PROP(token_,PROP(lexer_,this)))).value.number>=0)  {
            //return ASTBase.prototype.req.apply(this,arr)
            return __applyArr(__classMethodFunc(req_ ,ASTBase),this,arr);
        }
        //else
        
        else {
            //.throwParseFailed "not in list"
            METHOD(throwParseFailed_,this)(this,1,(any_arr){any_LTR("not in list")
            });
        };
     return undefined;
     }
//#### method optList()
     any ASTBase_optList(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//this generic method will look for zero or more of the requested classes,
        //var item
        var item = undefined;
        //var list=[]
        var list = new(Array,0,NULL);
        
        //do
        while(TRUE){
          //item = ASTBase.prototype.opt.apply(this,arguments)
          item = __applyArr(__classMethodFunc(opt_ ,ASTBase),this,_newArray(argc,arguments));
          //if no item then break
          if (!_anyToBool(item)) {break;};
          //list.push item
          METHOD(push_,list)(list,1,(any_arr){item
          });
        };// end loop
        //loop
        //return list.length? list : undefined
        return _length(list) ? list : undefined;
     return undefined;
     }
//#### method optSeparatedList(astClass:ASTBase, separator, closer) #[Separated Lists]
     any ASTBase_optSeparatedList(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var astClass, separator, closer;
        astClass=separator=closer=undefined;
        switch(argc){
          case 3:closer=arguments[2];
          case 2:separator=arguments[1];
          case 1:astClass=arguments[0];
        }
        //---------
//Start optSeparatedList
        //var result = []
        var result = new(Array,0,NULL);
        //var optSepar
        var optSepar = undefined;
//except the requested closer is NEWLINE, 
//NEWLINE is included as an optional extra separator 
//and also we allow a free-form mode list
        //if closer isnt 'NEWLINE' #Except required closer *IS* NEWLINE
        if (!__is(closer,any_LTR("NEWLINE")))  {// #Except required closer *IS* NEWLINE
//if the list starts with a NEWLINE, 
//assume an indented free-form mode separated list, 
//where NEWLINE is a valid separator.
            //if .lexer.token.type is 'NEWLINE'
            if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_LTR("NEWLINE")))  {
                //return .optFreeFormList( astClass, separator, closer )
                return METHOD(optFreeFormList_,this)(this,3,(any_arr){astClass
, separator
, closer
                });
            };
//else normal list, but NEWLINE is accepted as optional before and after separator
            //optSepar = 'NEWLINE' #newline is optional before and after separator
            optSepar = any_LTR("NEWLINE");// #newline is optional before and after separator
        };
//normal separated list, 
//loop until closer found
        //logger.debug "optSeparatedList [#{.constructor.name}] indent:#{.indent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'
        logger_debug(undefined,2,(any_arr){_concatAny(9,any_LTR("optSeparatedList [")
, PROP(name_,any_class(this.class))
, any_LTR("] indent:")
, PROP(indent_,this)
, any_LTR(", get SeparatedList of [")
, PROP(name_,astClass)
, any_LTR("] by '")
, separator
, any_LTR("' closer:")
        )
, (_anyToBool(__or5=closer)? __or5 : any_LTR("-no closer-"))
        });
        //var startLine = .lexer.sourceLineNum
        var startLine = PROP(sourceLineNum_,PROP(lexer_,this));
        //do until .opt(closer) or .lexer.token.type is 'EOF'
        while(!(_anyToBool((_anyToBool(__or6=METHOD(opt_,this)(this,1,(any_arr){closer
        }))? __or6 : any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_LTR("EOF"))))))){
//get a item
            //var item = .req(astClass)
            var item = METHOD(req_,this)(this,1,(any_arr){astClass
            });
            //.lock()
            METHOD(lock_,this)(this,0,NULL);
//add item to result
            //result.push(item)
            METHOD(push_,result)(result,1,(any_arr){item
            });
//newline after item (before comma or closer) is optional
            //var consumedNewLine = .opt(optSepar)
            var consumedNewLine = METHOD(opt_,this)(this,1,(any_arr){optSepar
            });
//if, after newline, we got the closer, then exit. 
            //if .opt(closer) then break #closer found
            if (_anyToBool(METHOD(opt_,this)(this,1,(any_arr){closer
            }))) {break;};
//here, a 'separator' (comma/semicolon) means: 'there is another item'.
//Any token other than 'separator' means 'end of list'
            //if no .opt(separator)
            if (!_anyToBool(METHOD(opt_,this)(this,1,(any_arr){separator
            })))  {
                //# any token other than comma/semicolon means 'end of comma separated list'
                //# but if a closer was required, then "other" token is an error
                //if closer, .throwError "Expected '#{closer}' to end list started at line #{startLine}, got '#{.lexer.token.value}'"
                if (_anyToBool(closer)) {METHOD(throwError_,this)(this,1,(any_arr){_concatAny(7,any_LTR("Expected '")
, closer
, any_LTR("' to end list started at line ")
, startLine
, any_LTR(", got '")
, PROP(value_,PROP(token_,PROP(lexer_,this)))
, any_LTR("'")
                )
                });};
                //if consumedNewLine, .lexer.returnToken()
                if (_anyToBool(consumedNewLine)) {__call(returnToken_,PROP(lexer_,this),0,NULL);};
                //break # if no error, end of list
                break;// # if no error, end of list
            };
            //end if
            
//optional newline after comma 
            //.opt(optSepar)
            METHOD(opt_,this)(this,1,(any_arr){optSepar
        });
        };// end loop
        //loop #try get next item
        //return result
        return result;
     return undefined;
     }
//#### Method optFreeFormList(astClass:ASTBase, separator, closer)
     any ASTBase_optFreeFormList(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var astClass, separator, closer;
        astClass=separator=closer=undefined;
        switch(argc){
          case 3:closer=arguments[2];
          case 2:separator=arguments[1];
          case 1:astClass=arguments[0];
        }
        //---------
//In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
//The item list ends when a closer is found or when indentation changes
        //var result = []
        var result = new(Array,0,NULL);
        //var lastItemSourceLine = -1
        var lastItemSourceLine = any_number(-1);
        //var separatorAfterItem
        var separatorAfterItem = undefined;
        //var parentIndent = .parent.indent
        var parentIndent = PROP(indent_,PROP(parent_,this));
//FreeFormList should start with NEWLINE
//First line sets indent level
        //.req "NEWLINE"
        METHOD(req_,this)(this,1,(any_arr){any_LTR("NEWLINE")
        });
        //var startLine = .lexer.sourceLineNum
        var startLine = PROP(sourceLineNum_,PROP(lexer_,this));
        //var blockIndent = .lexer.indent
        var blockIndent = PROP(indent_,PROP(lexer_,this));
        //logger.debug "optFreeFormList: [#{astClass.name} #{separator}]*  parent:#{.parent.name}.#{.constructor.name} parentIndent:#{parentIndent}, blockIndent:#{blockIndent}, closer:", closer or '-no-'
        logger_debug(undefined,2,(any_arr){_concatAny(13,any_LTR("optFreeFormList: [")
, PROP(name_,astClass)
, any_LTR(" ")
, separator
, any_LTR("]*  parent:")
, PROP(name_,PROP(parent_,this))
, any_LTR(".")
, PROP(name_,any_class(this.class))
, any_LTR(" parentIndent:")
, parentIndent
, any_LTR(", blockIndent:")
, blockIndent
, any_LTR(", closer:")
        )
, (_anyToBool(__or7=closer)? __or7 : any_LTR("-no-"))
        });
        //if blockIndent <= parentIndent #first line is same or less indented than parent - assume empty list
        if (_anyToNumber(blockIndent) <= _anyToNumber(parentIndent))  {// #first line is same or less indented than parent - assume empty list
          //.lexer.sayErr "free-form SeparatedList: next line is same or less indented (#{blockIndent}) than parent indent (#{parentIndent}) - assume empty list"
          __call(sayErr_,PROP(lexer_,this),1,(any_arr){_concatAny(5,any_LTR("free-form SeparatedList: next line is same or less indented (")
, blockIndent
, any_LTR(") than parent indent (")
, parentIndent
, any_LTR(") - assume empty list")
          )
          });
          //return result
          return result;
        };
//now loop until closer or an indent change
        //#if closer found (`]`, `)`, `}`), end of list
        //do until .opt(closer) or .lexer.token.type is 'EOF'
        while(!(_anyToBool((_anyToBool(__or8=METHOD(opt_,this)(this,1,(any_arr){closer
        }))? __or8 : any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_LTR("EOF"))))))){
//check for indent changes
            //logger.debug "freeForm Mode .lexer.indent:#{.lexer.indent} block indent:#{blockIndent} parentIndent:#{parentIndent}"
            logger_debug(undefined,1,(any_arr){_concatAny(6,any_LTR("freeForm Mode .lexer.indent:")
, PROP(indent_,PROP(lexer_,this))
, any_LTR(" block indent:")
, blockIndent
, any_LTR(" parentIndent:")
, parentIndent
            )
            });
            //if .lexer.indent isnt blockIndent
            if (!__is(PROP(indent_,PROP(lexer_,this)),blockIndent))  {
//indent changed:
//if a closer was specified, indent change before the closer means error (line misaligned)
                  //if closer 
                  if (_anyToBool(closer))  {
                    //.lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent}, or '#{closer}' to end block started at line #{startLine}"
                    __call(throwErr_,PROP(lexer_,this),1,(any_arr){_concatAny(8,any_LTR("Misaligned indent: ")
, PROP(indent_,PROP(lexer_,this))
, any_LTR(". Expected ")
, blockIndent
, any_LTR(", or '")
, closer
, any_LTR("' to end block started at line ")
, startLine
                    )
                    });
                  };
//check for excesive indent
                  //if .lexer.indent > blockIndent
                  if (_anyToNumber(PROP(indent_,PROP(lexer_,this))) > _anyToNumber(blockIndent))  {
                    //.lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent} to continue block, or #{parentIndent} to close block started at line #{startLine}"
                    __call(throwErr_,PROP(lexer_,this),1,(any_arr){_concatAny(8,any_LTR("Misaligned indent: ")
, PROP(indent_,PROP(lexer_,this))
, any_LTR(". Expected ")
, blockIndent
, any_LTR(" to continue block, or ")
, parentIndent
, any_LTR(" to close block started at line ")
, startLine
                    )
                    });
                  };
//else, if no closer specified, and indent decreased => end of list
                  //break #end of list
                  break;// #end of list
            };
            //end if
            
//check for more than one statement on the same line, with no separator
            //if not separatorAfterItem and .lexer.sourceLineNum is lastItemSourceLine 
            if (!(_anyToBool(separatorAfterItem)) && __is(PROP(sourceLineNum_,PROP(lexer_,this)),lastItemSourceLine))  {
                //.lexer.sayErr "More than one [#{astClass.name}] on line #{lastItemSourceLine}. Missing ( ) on function call?"
                __call(sayErr_,PROP(lexer_,this),1,(any_arr){_concatAny(5,any_LTR("More than one [")
, PROP(name_,astClass)
, any_LTR("] on line ")
, lastItemSourceLine
, any_LTR(". Missing ( ) on function call?")
                )
                });
            };
            //lastItemSourceLine = .lexer.sourceLineNum
            lastItemSourceLine = PROP(sourceLineNum_,PROP(lexer_,this));
//else, get a item
            //var item = .req(astClass)
            var item = METHOD(req_,this)(this,1,(any_arr){astClass
            });
            //.lock()
            METHOD(lock_,this)(this,0,NULL);
//add item to result
            //result.push(item)
            METHOD(push_,result)(result,1,(any_arr){item
            });
//record where the list ends - for accurate sorucemaps (function's end)
//and to add commented original litescript source at C-generation
            //if item.sourceLineNum>.lexer.maxSourceLineNum, .lexer.maxSourceLineNum=item.sourceLineNum
            if (_anyToNumber(PROP(sourceLineNum_,item)) > _anyToNumber(PROP(maxSourceLineNum_,PROP(lexer_,this)))) {PROP(maxSourceLineNum_,PROP(lexer_,this)) = PROP(sourceLineNum_,item);};
//newline after item (before comma or closer) is optional
            //.opt('NEWLINE')
            METHOD(opt_,this)(this,1,(any_arr){any_LTR("NEWLINE")
            });
//separator (comma|semicolon) is optional, 
//NEWLINE also is optional and valid 
            //separatorAfterItem = .opt(separator)
            separatorAfterItem = METHOD(opt_,this)(this,1,(any_arr){separator
            });
            //.opt('NEWLINE')
            METHOD(opt_,this)(this,1,(any_arr){any_LTR("NEWLINE")
        });
        };// end loop
        //loop #try get next item
        //logger.debug "END freeFormMode [#{.constructor.name}] blockIndent:#{blockIndent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'
        logger_debug(undefined,2,(any_arr){_concatAny(9,any_LTR("END freeFormMode [")
, PROP(name_,any_class(this.class))
, any_LTR("] blockIndent:")
, blockIndent
, any_LTR(", get SeparatedList of [")
, PROP(name_,astClass)
, any_LTR("] by '")
, separator
, any_LTR("' closer:")
        )
, (_anyToBool(__or9=closer)? __or9 : any_LTR("-no closer-"))
        });
        ////if closer then .opt('NEWLINE') # consume optional newline after closer in free-form mode
        //return result
        return result;
     return undefined;
     }
//#### method reqSeparatedList(astClass:ASTBase, separator, closer)
     any ASTBase_reqSeparatedList(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var astClass, separator, closer;
        astClass=separator=closer=undefined;
        switch(argc){
          case 3:closer=arguments[2];
          case 2:separator=arguments[1];
          case 1:astClass=arguments[0];
        }
        //---------
//**reqSeparatedList** is the same as `optSeparatedList` except that it throws an error 
//if the list is empty
        
//First, call optSeparatedList
        //var result:ASTBase array = .optSeparatedList(astClass, separator, closer)
        var result = METHOD(optSeparatedList_,this)(this,3,(any_arr){astClass
, separator
, closer
        });
        //if result.length is 0, .throwParseFailed "#{.constructor.name}: Get list: At least one [#{astClass.name}] was expected"
        if (__is(any_number(_length(result)),any_number(0))) {METHOD(throwParseFailed_,this)(this,1,(any_arr){_concatAny(4,PROP(name_,any_class(this.class))
, any_LTR(": Get list: At least one [")
, PROP(name_,astClass)
, any_LTR("] was expected")
        )
        });};
        //return result
        return result;
     return undefined;
     }
//#### helper method listArgs(args:Object array)
     any ASTBase_listArgs(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var args= argc? arguments[0] : undefined;
        //---------
//listArgs list arguments (from opt or req). used for debugging
//and syntax error reporting
        //var msg = []
        var msg = new(Array,0,NULL);
        //for each i in args
        any _list10=args;
        { var i=undefined;
        for(int i__inx=0 ; i__inx<_list10.value.arr->length ; i__inx++){i=ITEM(i__inx,_list10);
        
            //declare valid i.name
            
            //if typeof i is 'string'
            if (__is(_typeof(i),any_LTR("string")))  {
                //msg.push("'#{i}'")
                METHOD(push_,msg)(msg,1,(any_arr){_concatAny(3,any_LTR("'")
, i
, any_LTR("'")
                )
            });
            }
            //else if i
            
            else if (_anyToBool(i))  {
                //if typeof i is 'function'
                if (__is(_typeof(i),any_LTR("function")))  {
                  //msg.push("[#{i.name}]")
                  METHOD(push_,msg)(msg,1,(any_arr){_concatAny(3,any_LTR("[")
, PROP(name_,i)
, any_LTR("]")
                  )
                });
                }
                //else
                
                else {
                  //msg.push("<#{i.name}>")
                  METHOD(push_,msg)(msg,1,(any_arr){_concatAny(3,any_LTR("<")
, PROP(name_,i)
, any_LTR(">")
                  )
            });
                };
            }
            //else
            
            else {
                //msg.push("[null]")
                METHOD(push_,msg)(msg,1,(any_arr){any_LTR("[null]")
        });
            };
        }};// end for each in
        //return msg.join('|')
        return METHOD(join_,msg)(msg,1,(any_arr){any_LTR("|")
        });
     return undefined;
     }
//Helper functions for code generation
//=====================================
//#### helper method out( )
     any ASTBase_out(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//*out* is a helper function for code generation
//It evaluates and output its arguments. uses .lexer.out
        //var rawOut = .lexer.outCode
        var rawOut = PROP(outCode_,PROP(lexer_,this));
        //for each item in arguments.toArray()
        any _list11=_newArray(argc,arguments);
        { var item=undefined;
        for(int item__inx=0 ; item__inx<_list11.value.arr->length ; item__inx++){item=ITEM(item__inx,_list11);
        
//skip empty items
          //if no item, continue
          if (!_anyToBool(item)) {continue;};
//if it is the first thing in the line, out indentation
          //if rawOut.currLine.length is 0  and .indent > 0
          if (__is(any_number(_length(PROP(currLine_,rawOut))),any_number(0)) && _anyToNumber(PROP(indent_,this)) > 0)  {
              //rawOut.put String.spaces(.indent)
              METHOD(put_,rawOut)(rawOut,1,(any_arr){String_spaces(undefined,1,(any_arr){PROP(indent_,this)
              })
              });
          };
//if it is an AST node, call .produce()
          //if item instance of ASTBase 
          if (_instanceof(item,ASTBase))  {
              //declare item:ASTBase 
              
              //item.produce()
              METHOD(produce_,item)(item,0,NULL);
          }
//New line char means "start new line"
          //else if item is '\n' 
          
          else if (__is(item,any_LTR("\n")))  {
            //rawOut.startNewLine()
            METHOD(startNewLine_,rawOut)(rawOut,0,NULL);
          }
//a simple string, out the string
          //else if type of item is 'string'
          
          else if (__is(_typeof(item),any_LTR("string")))  {
            //rawOut.put item
            METHOD(put_,rawOut)(rawOut,1,(any_arr){item
            });
          }
            
//if the object is an array, resolve with a recursive call
          //else if item instance of Array
          
          else if (_instanceof(item,Array))  {
              //# Recursive #
              //ASTBase.prototype.out.apply this,item 
              __applyArr(__classMethodFunc(out_ ,ASTBase),this,item);
          }
//else, Object codes
          //else if item instanceof Object
          
          else if (_instanceof(item,Object))  {
            //// expected keys:
            ////  COMMENT:string, NLI, CSL:Object array, freeForm, h
            
//{CSL:arr} -> output the array as Comma Separated List (note: CSL can be present and undefined)
 
              //if item.hasProperty('CSL') 
              var comment=undefined;
              var header=undefined;
              if (_anyToBool(METHOD(hasProperty_,item)(item,1,(any_arr){any_LTR("CSL")
              })))  {
                  //var CSL:array = item.tryGetProperty("CSL")
                  var CSL = METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("CSL")
                  });
                  //if CSL 
                  if (_anyToBool(CSL))  {
                      //// additional keys: pre,post,separator
                      //var separator = item.tryGetProperty('separator') or ', '
                      var separator = (_anyToBool(__or10=METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("separator")
                      }))? __or10 : any_LTR(", "));
                      
                      //for each inx,listItem in CSL
                      any _list12=CSL;
                      { var listItem=undefined;
                      for(int inx=0 ; inx<_list12.value.arr->length ; inx++){listItem=ITEM(inx,_list12);
                      
                        //declare valid listItem.out
                        
                        //if inx>0 
                        if (inx > 0)  {
                          //rawOut.put separator
                          METHOD(put_,rawOut)(rawOut,1,(any_arr){separator
                          });
                        };
                        //if item.tryGetProperty('freeForm')
                        if (_anyToBool(METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("freeForm")
                        })))  {
                            //rawOut.put '\n        '
                            METHOD(put_,rawOut)(rawOut,1,(any_arr){any_LTR("\n        ")
                            });
                        };
                        //#recurse
                        //.out item.tryGetProperty('pre'), listItem, item.tryGetProperty('post')
                        METHOD(out_,this)(this,3,(any_arr){METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("pre")
                        })
, listItem
, METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("post")
                        })
                        });
                      }};// end for each in
                      //end for
                      
                      //if item.tryGetProperty('freeForm'), rawOut.put '\n' # (prettier generated code)
                      if (_anyToBool(METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("freeForm")
                      }))) {METHOD(put_,rawOut)(rawOut,1,(any_arr){any_LTR("\n")
                      });};
                  };
              }
//{COMMENT:text} --> output text as a comment 
 
              //else if item.tryGetProperty('COMMENT') into var comment:string
              
              else if (_anyToBool((comment=METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("COMMENT")
              }))))  {
                  //if no .lexer or .lexer.options.comments #comments level > 0
                  if (_anyToBool((_anyToBool(__or11=any_number(!_anyToBool(PROP(lexer_,this))))? __or11 : PROP(comments_,PROP(options_,PROP(lexer_,this))))))  {// #comments level > 0
                      //# prepend // if necessary
                      //if type of item isnt 'string' or not comment.startsWith("//"), rawOut.put "// "
                      if (_anyToBool((_anyToBool(__or12=any_number(!__is(_typeof(item),any_LTR("string"))))? __or12 : any_number(!(_anyToBool(METHOD(startsWith_,comment)(comment,1,(any_arr){any_LTR("//")
                      }))))))) {METHOD(put_,rawOut)(rawOut,1,(any_arr){any_LTR("// ")
                      });};
                      //.out comment
                      METHOD(out_,this)(this,1,(any_arr){comment
                      });
                  };
              }
//{h:1/0} --> enable/disabe output to header file
 
              //else if item.tryGetProperty('h') into var header:number isnt undefined
              
              else if (!__is((header=METHOD(tryGetProperty_,item)(item,1,(any_arr){any_LTR("h")
              })),undefined))  {
                  //rawOut.setHeader header
                  METHOD(setHeader_,rawOut)(rawOut,1,(any_arr){header
                  });
              }
              //else 
              
              else {
                  //.sayErr "ASTBase method out Map|Object: unrecognized keys: #{item.getObjectKeys()}"
                  METHOD(sayErr_,this)(this,1,(any_arr){_concatAny(2,any_LTR("ASTBase method out Map|Object: unrecognized keys: ")
, (METHOD(getObjectKeys_,item)(item,0,NULL))
                  )
                  });
              };
          }
//Last option, out item.toString()
          //else
          
          else {
              //rawOut.put item.toString() # try item.toString()
              METHOD(put_,rawOut)(rawOut,1,(any_arr){METHOD(toString_,item)(item,0,NULL)
              });// # try item.toString()
          };
          //end if
          
        }};// end for each in
        //end loop, next item
        
     return undefined;
     }
//#### helper method outSourceLineAsComment(sourceLineNum)
     any ASTBase_outSourceLineAsComment(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var sourceLineNum= argc? arguments[0] : undefined;
        //---------
//Note: check if we can remove "outLineAsComment" and use this instead
        //if .lexer.outCode.lastOutCommentLine < sourceLineNum
        if (_anyToNumber(PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this)))) < _anyToNumber(sourceLineNum))  {
            //.lexer.outCode.lastOutCommentLine = sourceLineNum
            PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this))) = sourceLineNum;
        };
        
        //if sourceLineNum<1, return 
        if (_anyToNumber(sourceLineNum) < 1) {return undefined;};
        //var line = .lexer.lines[sourceLineNum-1]
        var line = ITEM(_anyToNumber(sourceLineNum) - 1,PROP(lines_,PROP(lexer_,this)));
        //if typeof line is 'undefined', return
        if (__is(_typeof(line),any_LTR("undefined"))) {return undefined;};
        //.lexer.outCode.ensureNewLine
        __call(ensureNewLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);
        //if line.trim() is ""
        if (__is(METHOD(trim_,line)(line,0,NULL),any_EMPTY_STR))  {
            //.lexer.outCode.put line
            __call(put_,PROP(outCode_,PROP(lexer_,this)),1,(any_arr){line
            });
        }
        //else
        
        else {
            //var indent = line.countSpaces()
            var indent = METHOD(countSpaces_,line)(line,0,NULL);
            //.lexer.outCode.put line.slice(0,indent)
            __call(put_,PROP(outCode_,PROP(lexer_,this)),1,(any_arr){METHOD(slice_,line)(line,2,(any_arr){any_number(0)
, indent
            })
            });
            //.lexer.outCode.put "//"
            __call(put_,PROP(outCode_,PROP(lexer_,this)),1,(any_arr){any_LTR("//")
            });
            //.lexer.outCode.put line.slice(indent)
            __call(put_,PROP(outCode_,PROP(lexer_,this)),1,(any_arr){METHOD(slice_,line)(line,1,(any_arr){indent
            })
            });
        };
        //.lexer.outCode.startNewLine
        __call(startNewLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);
     return undefined;
     }
//#### helper method outSourceLinesAsComment(upTo, fromLineNum)
     any ASTBase_outSourceLinesAsComment(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var upTo, fromLineNum;
        upTo=fromLineNum=undefined;
        switch(argc){
          case 2:fromLineNum=arguments[1];
          case 1:upTo=arguments[0];
        }
        //---------
        //if no .lexer.options.comments, return 
        if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};
        //if no upTo, upTo = .sourceLineNum-1 //all previous comments before this statement
        if (!_anyToBool(upTo)) {upTo = any_number(_anyToNumber(PROP(sourceLineNum_,this)) - 1);};
        //if no fromLineNum or fromLineNum<.lexer.outCode.lastOutCommentLine+1
        if (_anyToBool((_anyToBool(__or13=any_number(!_anyToBool(fromLineNum)))? __or13 : any_number(_anyToNumber(fromLineNum) < _anyToNumber(PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this)))) + 1))))  {
              //fromLineNum = .lexer.outCode.lastOutCommentLine+1
              fromLineNum = any_number(_anyToNumber(PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this)))) + 1);
        };
        //for i=fromLineNum to upTo
        int64_t _end3=_anyToNumber(upTo);
        for(int64_t i=_anyToNumber(fromLineNum); i<=_end3; i++){
            //.outSourceLineAsComment i
            METHOD(outSourceLineAsComment_,this)(this,1,(any_arr){any_number(i)
            });
        };// end for i
        
     return undefined;
     }
//#### helper method getEOLComment() 
     any ASTBase_getEOLComment(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//getEOLComment: get the comment at the end of the line
//Check for "postfix" comments. These are comments that occur at the end of the line,
//such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.
        //if no .lexer.options.comments, return 
        if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};
        //var inx = .lineInx
        var inx = PROP(lineInx_,this);
        //var infoLine = .lexer.infoLines[inx]
        var infoLine = ITEM(_anyToNumber(inx),PROP(infoLines_,PROP(lexer_,this)));
        //if infoLine.tokens and infoLine.tokens.length
        if (_anyToBool(PROP(tokens_,infoLine)) && _length(PROP(tokens_,infoLine)))  {
            //var lastToken = infoLine.tokens[infoLine.tokens.length-1]
            var lastToken = ITEM(_length(PROP(tokens_,infoLine)) - 1,PROP(tokens_,infoLine));
            //if lastToken.type is 'COMMENT'
            if (__is(PROP(type_,lastToken),any_LTR("COMMENT")))  {
                //return "#{lastToken.value.startsWith('//')? '' else '//'} #{lastToken.value}"
                return _concatAny(3,(_anyToBool(__call(startsWith_,PROP(value_,lastToken),1,(any_arr){any_LTR("//")
                })) ? any_EMPTY_STR : any_LTR("//"))
, any_LTR(" ")
, PROP(value_,lastToken)
                );
            };
        };
     return undefined;
     }
//#### helper method addSourceMap(mark)
     any ASTBase_addSourceMap(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
        // define named params
        var mark= argc? arguments[0] : undefined;
        //---------
        //.lexer.outCode.addSourceMap mark, .sourceLineNum, .column, .indent
        __call(addSourceMap_,PROP(outCode_,PROP(lexer_,this)),4,(any_arr){mark
, PROP(sourceLineNum_,this)
, PROP(column_,this)
, PROP(indent_,this)
        });
     return undefined;
     }
//#### helper method levelIndent()
     any ASTBase_levelIndent(DEFAULT_ARGUMENTS){
        assert(_instanceof(this,ASTBase));
        //---------
//show indented messaged for debugging
        //var indent = 0
        var indent = any_number(0);
        //var node = this
        var node = this;
        //while node.parent into node
        while(_anyToBool((node=PROP(parent_,node)))){
            //indent += 2 //add 2 spaces
            indent.value.number += 2; //add 2 spaces
        };// end loop
        //return String.spaces(indent)
        return String_spaces(undefined,1,(any_arr){indent
        });
     return undefined;
     }
    
    
    

//-------------------------
void ASTBase__moduleInit(void){
        ASTBase =_newClass("ASTBase", ASTBase__init, sizeof(struct ASTBase_s), Object);
        _declareMethods(ASTBase, ASTBase_METHODS);
        _declareProps(ASTBase, ASTBase_PROPS, sizeof ASTBase_PROPS);
    
    
    //end class ASTBase
    
};
