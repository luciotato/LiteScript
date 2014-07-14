#include "ASTBase.h"
//-------------------------
//Module ASTBase
//-------------------------
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
     { outLineAsComment_, ASTBase_outLineAsComment },
     { outLinesAsComment_, ASTBase_outLinesAsComment },
     { outPrevLinesComments_, ASTBase_outPrevLinesComments },
     { getEOLComment_, ASTBase_getEOLComment },
     { addSourceMap_, ASTBase_addSourceMap },
     { levelIndent_, ASTBase_levelIndent },
     { callOnSubTree_, ASTBase_callOnSubTree },
     { getRootNode_, ASTBase_getRootNode },
     { compilerVar_, ASTBase_compilerVar },
     { parseAccessors_, ASTBase_parseAccessors },
     { insertAccessorAt_, ASTBase_insertAccessorAt },
     { addAccessor_, ASTBase_addAccessor },
     { reqBody_, ASTBase_reqBody },
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
     { addToExport_, ASTBase_addToExport },
     { createScope_, ASTBase_createScope },
     { tryGetOwnerNameDecl_, ASTBase_tryGetOwnerNameDecl },
     { lastLineInxOf_, ASTBase_lastLineInxOf },
     { assignIfUndefined_, ASTBase_assignIfUndefined },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t ASTBase_PROPS[] = {
   parent_
    , name_
    , keyword_
    , type_
    , keyType_
    , itemType_
    , extraInfo_
    , lexer_
    , lineInx_
    , sourceLineNum_
    , column_
    , indent_
    , locked_
    , accessors_
    , executes_
    , hasSideEffects_
    , isMap_
    , scope_
    , skipSemiColon_
    };
   
   // ASTBase
   
   any ASTBase; //Class Object

// This class serves as a base class on top of which Grammar classes are defined.
// It contains basic functions to parse a token stream.

    // properties
    ;

    // constructor (parent:ASTBase, name)
    void ASTBase__init(DEFAULT_ARGUMENTS){
       // define named params
       var parent, name;
       parent=name=undefined;
       switch(argc){
         case 2:name=arguments[1];
         case 1:parent=arguments[0];
       }
       //---------

       // .parent = parent
       PROP(parent_,this) = parent;
       // .name = name
       PROP(name_,this) = name;

// Get lexer from parent

       // if parent
       if (_anyToBool(parent))  {
           // .lexer = parent.lexer
           PROP(lexer_,this) = PROP(lexer_,parent);

// Remember this node source position.
// Also remember line index in tokenized lines, and indent

           // if .lexer
           if (_anyToBool(PROP(lexer_,this)))  {
               // .sourceLineNum = .lexer.sourceLineNum
               PROP(sourceLineNum_,this) = PROP(sourceLineNum_,PROP(lexer_,this));
               // .column = .lexer.token.column
               PROP(column_,this) = PROP(column_,PROP(token_,PROP(lexer_,this)));
               // .indent = .lexer.indent
               PROP(indent_,this) = PROP(indent_,PROP(lexer_,this));
               // .lineInx = .lexer.lineInx
               PROP(lineInx_,this) = PROP(lineInx_,PROP(lexer_,this));
           };
       };
    }

        // #debug "created [#.constructor.name] indent #.indent col:#.column #{.lexer? .lexer.token:''}"

// ------------------------------------------------------------------------
    // method lock()
    any ASTBase_lock(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// **lock** marks this node as "locked", meaning we are certain this is the right class
// for the given syntax. For example, if the `FunctionDeclaration` class see the token `function`,
// we are certain this is the right class to use, so we 'lock()'.
// Once locked, any **req**uired token not present causes compilation to fail.

       // .locked = true
       PROP(locked_,this) = true;
    return undefined;
    }

    // helper method getParent(searchedClass)
    any ASTBase_getParent(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var searchedClass= argc? arguments[0] : undefined;
       //---------
// **getParent** method searchs up the AST tree until a specfied node class is found

       // var node = this.parent
       var node = PROP(parent_,this);
       // while node and not(node instanceof searchedClass)
       while(_anyToBool(node) && !((_instanceof(node,searchedClass)))){
           // node = node.parent # move to parent
           node = PROP(parent_,node);// # move to parent
       };// end loop
       // return node
       return node;
    return undefined;
    }


    // helper method positionText()
    any ASTBase_positionText(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

       // if not .lexer or no .sourceLineNum, return "(compiler-defined)"
       if (_anyToBool(__or(any_number(!(_anyToBool(PROP(lexer_,this)))),any_number(!_anyToBool(PROP(sourceLineNum_,this)))))) {return any_str("(compiler-defined)");};
       // return "#{.lexer.filename}:#{.sourceLineNum}:#{.column or 0}"
       return _concatAny(5,(any_arr){PROP(filename_,PROP(lexer_,this)), any_str(":"), PROP(sourceLineNum_,this), any_str(":"), (__or(PROP(column_,this),any_number(0)))});
    return undefined;
    }

    // helper method toString()
    any ASTBase_toString(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

       // return "[#{.constructor.name}]"
       return _concatAny(3,(any_arr){any_str("["), PROP(name_,any_class(this.class)), any_str("]")});
    return undefined;
    }


    // helper method sayErr(msg)
    any ASTBase_sayErr(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------

       // logger.error .positionText(), msg
       logger_error(undefined,2,(any_arr){CALL0(positionText_,this), msg});
    return undefined;
    }

    // helper method warn(msg)
    any ASTBase_warn(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------

       // logger.warning .positionText(), msg
       logger_warning(undefined,2,(any_arr){CALL0(positionText_,this), msg});
    return undefined;
    }

    // method throwError(msg)
    any ASTBase_throwError(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------
// **throwError** add node position info and throws a 'controlled' error.

// A 'controlled' error, shows only err.message

// A 'un-controlled' error is an unhandled exception in the compiler code itself,
// and it shows error message *and stack trace*.

       // logger.throwControlled "#{.positionText()}. #{msg}"
       logger_throwControlled(undefined,1,(any_arr){_concatAny(3,(any_arr){(CALL0(positionText_,this)), any_str(". "), msg})});
    return undefined;
    }

    // method throwParseFailed(msg)
    any ASTBase_throwParseFailed(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------
// throws a parseFailed-error

// During a node.parse(), if there is a token mismatch, a "parse failed" is raised.
// "parse failed" signals a failure to parse the tokens from the stream,
// however the syntax might still be valid for another AST node.
// If the AST node was locked-on-target, it is a hard-error.
// If the AST node was NOT locked, it's a soft-error, and will not abort compilation
// as the parent node will try other AST classes against the token stream before failing.

        //var err = new Error("#{.positionText()}. #{msg}")
       // var cErr = new ControlledError("#{.lexer.posToString()}. #{msg}")
       var cErr = new(ControlledError,1,(any_arr){_concatAny(3,(any_arr){(CALL0(posToString_,PROP(lexer_,this))), any_str(". "), msg})});
       // cErr.soft = not .locked
       PROP(soft_,cErr) = any_number(!(_anyToBool(PROP(locked_,this))));
       // throw cErr
       throw(cErr);
    return undefined;
    }

    // method parse()
    any ASTBase_parse(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// abstract method representing the TRY-Parse of the node.
// Child classes _must_ override this method

       // .throwError 'Parser Not Implemented'
       CALL1(throwError_,this,any_str("Parser Not Implemented"));
    return undefined;
    }

    // method produce()
    any ASTBase_produce(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// **produce()** is the method to produce target code
// Target code produces should override this, if the default production isnt: `.out .name`

       // .out .name
       CALL1(out_,this,PROP(name_,this));
    return undefined;
    }

    // method parseDirect(key, directMap)
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

// We use a DIRECT associative array to pick the exact AST node to parse
// based on the actual token value or type.
// This speeds up parsing, avoiding parsing by trial & error

// Check keyword

       // if directMap.get(key) into var param
       var param=undefined;
       if (_anyToBool((param=CALL1(get_,directMap,key))))  {

// try parse by calling .opt, accept Array as param

           // var statement = param instance of Array ?
           var statement = _instanceof(param,Array) ? __applyArr(__classMethodFunc(opt_ ,ASTBase),this,param) : CALL1(opt_,this,param);

// return parsed statement or nothing

           // return statement
           return statement;
       };
    return undefined;
    }



    // method opt() returns ASTBase
    any ASTBase_opt(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// **opt** (optional) is for optional parts of a grammar. It attempts to parse
// the token stream using one of the classes or token types specified.
// This method takes a variable number of arguments.
// For example:
  // calling `.opt IfStatement, Expression, 'IDENTIFIER'`
  // would attempt to parse the token stream first as an `IfStatement`. If that fails, it would attempt
  // to use the `Expression` class. If that fails, it will accept a token of type `IDENTIFIER`.
  // If all of those fail, it will return `undefined`.

// Method start:
// Remember the actual position, to rewind if all the arguments to `opt` fail

       // var startPos = .lexer.getPos()
       var startPos = CALL0(getPos_,PROP(lexer_,this));

        // declare on startPos
          // index,sourceLineNum,column,token
        // declare valid startPos.token.column

        // #debug
       // var spaces = .levelIndent()
       var spaces = CALL0(levelIndent_,this);

// For each argument, -a class or a string-, we will attempt to parse the token stream
// with the class, or match the token type to the string.

       // for each searched in arguments.toArray()
       any _list9=_newArray(argc,arguments);
       { var searched=undefined;
       for(int searched__inx=0 ; searched__inx<_list9.value.arr->length ; searched__inx++){searched=ITEM(searched__inx,_list9);

// skip empty, null & undefined

         // if no searched, continue
         if (!_anyToBool(searched)) {continue;};

// determine value or type
// For strings we check the token **value** or **TYPE** (if searched is all-uppercase)

         // if typeof searched is 'string'
         if (__is(_typeof(searched),any_str("string")))  {

            // declare searched:string

            // #debug spaces, .constructor.name,'TRY',searched, 'on', .lexer.token.toString()

           // var isTYPE = searched.charAt(0)>="A" and searched.charAt(0)<="Z" and searched is searched.toUpperCase()
           var isTYPE = any_number(_anyToNumber(CALL1(charAt_,searched,any_number(0))) >= 'A' && _anyToNumber(CALL1(charAt_,searched,any_number(0))) <= 'Z' && __is(searched,CALL0(toUpperCase_,searched)));
           // var found
           var found = undefined;

           // if isTYPE
           if (_anyToBool(isTYPE))  {
             // found = .lexer.token.type is searched
             found = any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),searched));
           }
           
           else {
             // found = .lexer.token.value is searched
             found = any_number(__is(PROP(value_,PROP(token_,PROP(lexer_,this))),searched));
           };

           // if found
           if (_anyToBool(found))  {

// Ok, type/value found! now we return: token.value
// Note: we shouldnt return the 'token' object, because returning objects (here and in js)
// is a "pass by reference". You return a "pointer" to the object.
// If we return the 'token' object, the calling function will recive a "pointer"
// and it can inadvertedly alter the token object in the token stream. (it should not, leads to subtle bugs)

             // logger.debug spaces, .constructor.name,'matched OK:',searched, .lexer.token.value
             logger_debug(undefined,5,(any_arr){spaces, PROP(name_,any_class(this.class)), any_str("matched OK:"), searched, PROP(value_,PROP(token_,PROP(lexer_,this)))});
             // var result = .lexer.token.value
             var result = PROP(value_,PROP(token_,PROP(lexer_,this)));

// Advance a token, .lexer.token always has next token

             // .lexer.nextToken()
             CALL0(nextToken_,PROP(lexer_,this));
             // return result
             return result;
           };
         }
         
         else {

// "searched" is an AST class

            // declare searched:Function //class

           // logger.debug spaces, .constructor.name,'TRY',searched.name, 'on', .lexer.token.toString()
           logger_debug(undefined,6,(any_arr){spaces, PROP(name_,any_class(this.class)), any_str("TRY"), PROP(name_,searched), any_str("on"), CALL0(toString_,PROP(token_,PROP(lexer_,this)))});

// if the argument is an AST node class, we instantiate the class and try the `parse()` method.
// `parse()` can fail with `ParseFailed` if the syntax do not match

           // try
           try{

               // var astNode:ASTBase = new searched(this) # create required ASTNode, to try parse
               var astNode = new(searched,1,(any_arr){this});// # create required ASTNode, to try parse

               // astNode.parse() # if it can't parse, will raise an exception
               CALL0(parse_,astNode);// # if it can't parse, will raise an exception

               // logger.debug spaces, 'Parsed OK!->',searched.name
               logger_debug(undefined,3,(any_arr){spaces, any_str("Parsed OK!->"), PROP(name_,searched)});

               // return astNode # parsed ok!, return instance
               {e4c_exitTry(1);return astNode;};// # parsed ok!, return instance
           
           }catch(err){
               // if err isnt instance of ControlledError, throw err //re-raise if not ControlledError
               if (!(_instanceof(err,ControlledError))) {throw(err);};
                // declare err:ControlledError

// If parsing fail, but the AST node were not 'locked' on target, (a soft-error),
// we will try other AST nodes.

               // if err.soft
               if (_anyToBool(PROP(soft_,err)))  {
                   // .lexer.softError = err
                   PROP(softError_,PROP(lexer_,this)) = err;
                   // logger.debug spaces, searched.name,'parse failed.',err.message
                   logger_debug(undefined,4,(any_arr){spaces, PROP(name_,searched), any_str("parse failed."), PROP(message_,err)});

// rewind the token stream, to try other AST nodes

                   // logger.debug "<<REW to", "#{startPos.sourceLineNum}:#{startPos.token.column or 0} [#{startPos.index}]", startPos.token.toString()
                   logger_debug(undefined,3,(any_arr){any_str("<<REW to"), _concatAny(6,(any_arr){PROP(sourceLineNum_,startPos), any_str(":"), (__or(PROP(column_,PROP(token_,startPos)),any_number(0))), any_str(" ["), PROP(index_,startPos), any_str("]")}), CALL0(toString_,PROP(token_,startPos))});
                   // .lexer.setPos startPos
                   CALL1(setPos_,PROP(lexer_,this),startPos);
               }
               
               else {

// else: it's a hard-error. The AST node were locked-on-target.
// We abort parsing and throw.

                    // # the first hard-error is the most informative, the others are cascading ones
                   // if .lexer.hardError is null, .lexer.hardError = err
                   if (__is(PROP(hardError_,PROP(lexer_,this)),null)) {PROP(hardError_,PROP(lexer_,this)) = err;};

// raise up, abort parsing

                   // raise err
                   throw(err);
               };

               // end if - type of error
               
           };

           // end catch
           
         };

         // end if - string or class
         
       }};// end for each in _newArray(argc,arguments)

       // end loop - try the next argument

// No more arguments.
// `opt` returns `undefined` if none of the arguments can be use to parse the token stream.

       // return undefined
       return undefined;
    return undefined;
    }

    // end method opt


    // method req() returns ASTBase
    any ASTBase_req(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

// **req** (required) if for required symbols of the grammar. It works the same way as `opt`
// except that it throws an error if none of the arguments can be used to parse the stream.

// We first call `opt` to see what we get. If a value is returned, the function was successful,
// so we just return the node that `opt` found.

// else, If `opt` returned nothing, we give the user a useful error.

       // var result = ASTBase.prototype.opt.apply(this,arguments)
       var result = __applyArr(__classMethodFunc(opt_ ,ASTBase),this,_newArray(argc,arguments));

       // if no result
       if (!_anyToBool(result))  {
         // .throwParseFailed "#{.constructor.name}:#{.extraInfo or ''} found #{.lexer.token.toString()} but #{.listArgs(arguments)} required"
         CALL1(throwParseFailed_,this,_concatAny(8,(any_arr){PROP(name_,any_class(this.class)), any_str(":"), (__or(PROP(extraInfo_,this),any_EMPTY_STR)), any_str(" found "), (CALL0(toString_,PROP(token_,PROP(lexer_,this)))), any_str(" but "), (CALL1(listArgs_,this,_newArray(argc,arguments))), any_str(" required")}));
       };

       // return result
       return result;
    return undefined;
    }


    // method reqOneOf(arr)
    any ASTBase_reqOneOf(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var arr= argc? arguments[0] : undefined;
       //---------
// (performance) call req only if next token (value) in list

       // if .lexer.token.value in arr
       if (CALL1(indexOf_,arr,PROP(value_,PROP(token_,PROP(lexer_,this)))).value.number>=0)  {
           // return ASTBase.prototype.req.apply(this,arr)
           return __applyArr(__classMethodFunc(req_ ,ASTBase),this,arr);
       }
       
       else {
           // .throwParseFailed "not in list"
           CALL1(throwParseFailed_,this,any_str("not in list"));
       };
    return undefined;
    }


    // method optList()
    any ASTBase_optList(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// this generic method will look for zero or more of the requested classes,

       // var item
       var item = undefined;
       // var list=[]
       var list = _newArray(0,NULL);

       // do
       while(TRUE){
         // item = ASTBase.prototype.opt.apply(this,arguments)
         item = __applyArr(__classMethodFunc(opt_ ,ASTBase),this,_newArray(argc,arguments));
         // if no item then break
         if (!_anyToBool(item)) {break;};
         // list.push item
         CALL1(push_,list,item);
       };// end loop

       // return list.length? list : undefined
       return _length(list) ? list : undefined;
    return undefined;
    }


    // method optSeparatedList(astClass:ASTBase, separator, closer) #[Separated Lists]
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

// Start optSeparatedList

       // var result = []
       var result = _newArray(0,NULL);
       // var optSepar
       var optSepar = undefined;

// except the requested closer is NEWLINE,
// NEWLINE is included as an optional extra separator
// and also we allow a free-form mode list

       // if closer isnt 'NEWLINE' #Except required closer *IS* NEWLINE
       if (!__is(closer,any_str("NEWLINE")))  {// #Except required closer *IS* NEWLINE

// if the list starts with a NEWLINE,
// assume an indented free-form mode separated list,
// where NEWLINE is a valid separator.

           // if .lexer.token.type is 'NEWLINE'
           if (__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("NEWLINE")))  {
               // return .optFreeFormList( astClass, separator, closer )
               return CALL3(optFreeFormList_,this,astClass, separator, closer);
           };

// else normal list, but NEWLINE is accepted as optional before and after separator

           // optSepar = 'NEWLINE' #newline is optional before and after separator
           optSepar = any_str("NEWLINE");// #newline is optional before and after separator
       };

// normal separated list,
// loop until closer found

       // logger.debug "optSeparatedList [#{.constructor.name}] indent:#{.indent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'
       logger_debug(undefined,2,(any_arr){_concatAny(9,(any_arr){any_str("optSeparatedList ["), PROP(name_,any_class(this.class)), any_str("] indent:"), PROP(indent_,this), any_str(", get SeparatedList of ["), PROP(name_,astClass), any_str("] by '"), separator, any_str("' closer:")}), __or(closer,any_str("-no closer-"))});

       // var startLine = .lexer.sourceLineNum
       var startLine = PROP(sourceLineNum_,PROP(lexer_,this));
       // do until .opt(closer) or .lexer.token.type is 'EOF'
       while(!(_anyToBool(__or(CALL1(opt_,this,closer),any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("EOF"))))))){

// get a item

           // var item = .req(astClass)
           var item = CALL1(req_,this,astClass);
           // .lock()
           CALL0(lock_,this);

// add item to result

           // result.push(item)
           CALL1(push_,result,item);

// newline after item (before comma or closer) is optional

           // var consumedNewLine = .opt(optSepar)
           var consumedNewLine = CALL1(opt_,this,optSepar);

// if, after newline, we got the closer, then exit.

           // if .opt(closer) then break #closer found
           if (_anyToBool(CALL1(opt_,this,closer))) {break;};

// here, a 'separator' (comma/semicolon) means: 'there is another item'.
// Any token other than 'separator' means 'end of list'

           // if no .opt(separator)
           if (!_anyToBool(CALL1(opt_,this,separator)))  {
                // # any token other than comma/semicolon means 'end of comma separated list'
                // # but if a closer was required, then "other" token is an error
               // if closer, .throwError "Expected '#{closer}' to end list started at line #{startLine}, got '#{.lexer.token.value}'"
               if (_anyToBool(closer)) {CALL1(throwError_,this,_concatAny(7,(any_arr){any_str("Expected '"), closer, any_str("' to end list started at line "), startLine, any_str(", got '"), PROP(value_,PROP(token_,PROP(lexer_,this))), any_str("'")}));};
               // if consumedNewLine, .lexer.returnToken()
               if (_anyToBool(consumedNewLine)) {CALL0(returnToken_,PROP(lexer_,this));};
               // break # if no error, end of list
               break;// # if no error, end of list
           };
           // end if

// optional newline after comma

           // .opt(optSepar)
           CALL1(opt_,this,optSepar);
       };// end loop

       // return result
       return result;
    return undefined;
    }

    // method optFreeFormList(astClass:ASTBase, separator, closer)
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

// In "freeForm Mode", each item stands in its own line, and commas (separators) are optional.
// The item list ends when a closer is found or when indentation changes

       // var result = []
       var result = _newArray(0,NULL);
       // var lastItemSourceLine = -1
       var lastItemSourceLine = any_number(-1);
       // var separatorAfterItem
       var separatorAfterItem = undefined;
       // var parentIndent = .parent.indent
       var parentIndent = PROP(indent_,PROP(parent_,this));

// FreeFormList should start with NEWLINE
// First line sets indent level

       // .req "NEWLINE"
       CALL1(req_,this,any_str("NEWLINE"));
       // var startLine = .lexer.sourceLineNum
       var startLine = PROP(sourceLineNum_,PROP(lexer_,this));
       // var blockIndent = .lexer.indent
       var blockIndent = PROP(indent_,PROP(lexer_,this));

       // logger.debug "optFreeFormList [#{.constructor.name}] parentname:#{.parent.name} parentIndent:#{parentIndent}, blockIndent:#{blockIndent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no-'
       logger_debug(undefined,2,(any_arr){_concatAny(13,(any_arr){any_str("optFreeFormList ["), PROP(name_,any_class(this.class)), any_str("] parentname:"), PROP(name_,PROP(parent_,this)), any_str(" parentIndent:"), parentIndent, any_str(", blockIndent:"), blockIndent, any_str(", get SeparatedList of ["), PROP(name_,astClass), any_str("] by '"), separator, any_str("' closer:")}), __or(closer,any_str("-no-"))});

       // if blockIndent <= parentIndent #first line is same or less indented than parent - assume empty list
       if (_anyToNumber(blockIndent) <= _anyToNumber(parentIndent))  {// #first line is same or less indented than parent - assume empty list
         // .lexer.sayErr "free-form SeparatedList: next line is same or less indented (#{blockIndent}) than parent indent (#{parentIndent}) - assume empty list"
         CALL1(sayErr_,PROP(lexer_,this),_concatAny(5,(any_arr){any_str("free-form SeparatedList: next line is same or less indented ("), blockIndent, any_str(") than parent indent ("), parentIndent, any_str(") - assume empty list")}));
         // return result
         return result;
       };

// now loop until closer or an indent change

        // #if closer found (`]`, `)`, `}`), end of list
       // do until .opt(closer) or .lexer.token.type is 'EOF'
       while(!(_anyToBool(__or(CALL1(opt_,this,closer),any_number(__is(PROP(type_,PROP(token_,PROP(lexer_,this))),any_str("EOF"))))))){

// check for indent changes

           // logger.debug "freeForm Mode .lexer.indent:#{.lexer.indent} block indent:#{blockIndent} parentIndent:#{parentIndent}"
           logger_debug(undefined,1,(any_arr){_concatAny(6,(any_arr){any_str("freeForm Mode .lexer.indent:"), PROP(indent_,PROP(lexer_,this)), any_str(" block indent:"), blockIndent, any_str(" parentIndent:"), parentIndent})});
           // if .lexer.indent isnt blockIndent
           if (!__is(PROP(indent_,PROP(lexer_,this)),blockIndent))  {

// indent changed:
// if a closer was specified, indent change before the closer means error (line misaligned)

                 // if closer
                 if (_anyToBool(closer))  {
                   // .lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent}, or '#{closer}' to end block started at line #{startLine}"
                   CALL1(throwErr_,PROP(lexer_,this),_concatAny(8,(any_arr){any_str("Misaligned indent: "), PROP(indent_,PROP(lexer_,this)), any_str(". Expected "), blockIndent, any_str(", or '"), closer, any_str("' to end block started at line "), startLine}));
                 };

// check for excesive indent

                 // if .lexer.indent > blockIndent
                 if (_anyToNumber(PROP(indent_,PROP(lexer_,this))) > _anyToNumber(blockIndent))  {
                   // .lexer.throwErr "Misaligned indent: #{.lexer.indent}. Expected #{blockIndent} to continue block, or #{parentIndent} to close block started at line #{startLine}"
                   CALL1(throwErr_,PROP(lexer_,this),_concatAny(8,(any_arr){any_str("Misaligned indent: "), PROP(indent_,PROP(lexer_,this)), any_str(". Expected "), blockIndent, any_str(" to continue block, or "), parentIndent, any_str(" to close block started at line "), startLine}));
                 };

// else, if no closer specified, and indent decreased => end of list

                 // break #end of list
                 break;// #end of list
           };

           // end if

// check for more than one statement on the same line, with no separator

           // if not separatorAfterItem and .lexer.sourceLineNum is lastItemSourceLine
           if (!(_anyToBool(separatorAfterItem)) && __is(PROP(sourceLineNum_,PROP(lexer_,this)),lastItemSourceLine))  {
               // .lexer.sayErr "More than one [#{astClass.name}] on line #{lastItemSourceLine}. Missing ( ) on function call?"
               CALL1(sayErr_,PROP(lexer_,this),_concatAny(5,(any_arr){any_str("More than one ["), PROP(name_,astClass), any_str("] on line "), lastItemSourceLine, any_str(". Missing ( ) on function call?")}));
           };

           // lastItemSourceLine = .lexer.sourceLineNum
           lastItemSourceLine = PROP(sourceLineNum_,PROP(lexer_,this));

// else, get a item

           // var item = .req(astClass)
           var item = CALL1(req_,this,astClass);
           // .lock()
           CALL0(lock_,this);

// add item to result

           // result.push(item)
           CALL1(push_,result,item);

// newline after item (before comma or closer) is optional

           // if item.sourceLineNum>.lexer.maxSourceLineNum, .lexer.maxSourceLineNum=item.sourceLineNum
           if (_anyToNumber(PROP(sourceLineNum_,item)) > _anyToNumber(PROP(maxSourceLineNum_,PROP(lexer_,this)))) {PROP(maxSourceLineNum_,PROP(lexer_,this)) = PROP(sourceLineNum_,item);};
           // .opt('NEWLINE')
           CALL1(opt_,this,any_str("NEWLINE"));

// separator (comma|semicolon) is optional,
// NEWLINE also is optional and valid

           // separatorAfterItem = .opt(separator)
           separatorAfterItem = CALL1(opt_,this,separator);
           // .opt('NEWLINE')
           CALL1(opt_,this,any_str("NEWLINE"));
       };// end loop

       // logger.debug "END freeFormMode [#{.constructor.name}] blockIndent:#{blockIndent}, get SeparatedList of [#{astClass.name}] by '#{separator}' closer:", closer or '-no closer-'
       logger_debug(undefined,2,(any_arr){_concatAny(9,(any_arr){any_str("END freeFormMode ["), PROP(name_,any_class(this.class)), any_str("] blockIndent:"), blockIndent, any_str(", get SeparatedList of ["), PROP(name_,astClass), any_str("] by '"), separator, any_str("' closer:")}), __or(closer,any_str("-no closer-"))});

        //if closer then .opt('NEWLINE') # consume optional newline after closer in free-form mode

       // return result
       return result;
    return undefined;
    }


    // method reqSeparatedList(astClass:ASTBase, separator, closer)
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
// **reqSeparatedList** is the same as `optSeparatedList` except that it throws an error
// if the list is empty

// First, call optSeparatedList

       // var result:ASTBase array = .optSeparatedList(astClass, separator, closer)
       var result = CALL3(optSeparatedList_,this,astClass, separator, closer);
       // if result.length is 0, .throwParseFailed "#{.constructor.name}: Get list: At least one [#{astClass.name}] was expected"
       if (__is(any_number(_length(result)),any_number(0))) {CALL1(throwParseFailed_,this,_concatAny(4,(any_arr){PROP(name_,any_class(this.class)), any_str(": Get list: At least one ["), PROP(name_,astClass), any_str("] was expected")}));};

       // return result
       return result;
    return undefined;
    }


    // helper method listArgs(args:Object array)
    any ASTBase_listArgs(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var args= argc? arguments[0] : undefined;
       //---------
// listArgs list arguments (from opt or req). used for debugging
// and syntax error reporting

       // var msg = []
       var msg = _newArray(0,NULL);
       // for each i in args
       any _list10=args;
       { var i=undefined;
       for(int i__inx=0 ; i__inx<_list10.value.arr->length ; i__inx++){i=ITEM(i__inx,_list10);

            // declare valid i.name

           // if typeof i is 'string'
           if (__is(_typeof(i),any_str("string")))  {
               // msg.push("'#{i}'")
               CALL1(push_,msg,_concatAny(3,(any_arr){any_str("'"), i, any_str("'")}));
           }
           
           else if (_anyToBool(i))  {
               // if typeof i is 'function'
               if (__is(_typeof(i),any_str("function")))  {
                 // msg.push("[#{i.name}]")
                 CALL1(push_,msg,_concatAny(3,(any_arr){any_str("["), PROP(name_,i), any_str("]")}));
               }
               
               else {
                 // msg.push("<#{i.name}>")
                 CALL1(push_,msg,_concatAny(3,(any_arr){any_str("<"), PROP(name_,i), any_str(">")}));
               };
           }
           
           else {
               // msg.push("[null]")
               CALL1(push_,msg,any_str("[null]"));
           };
       }};// end for each in args

       // return msg.join('|')
       return CALL1(join_,msg,any_str("|"));
    return undefined;
    }



// Helper functions for code generation
// =====================================

    // helper method out()
    any ASTBase_out(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

// *out* is a helper function for code generation
// It evaluates and output its arguments. uses .lexer.out

       // var rawOut = .lexer.outCode
       var rawOut = PROP(outCode_,PROP(lexer_,this));

       // for each item in arguments.toArray()
       any _list11=_newArray(argc,arguments);
       { var item=undefined;
       for(int item__inx=0 ; item__inx<_list11.value.arr->length ; item__inx++){item=ITEM(item__inx,_list11);

// skip empty items

         // if no item, continue
         if (!_anyToBool(item)) {continue;};

// if it is the first thing in the line, out indentation

         // if not rawOut.currLine and .indent > 1
         if (!(_anyToBool(PROP(currLine_,rawOut))) && _anyToNumber(PROP(indent_,this)) > 1)  {
             // rawOut.put Strings.spaces(.indent-1)
             CALL1(put_,rawOut,Strings_spaces(undefined,1,(any_arr){any_number(_anyToNumber(PROP(indent_,this)) - 1)}));
         };

// if it is an AST node, call .produce()

         // if item instance of ASTBase
         if (_instanceof(item,ASTBase))  {
              // declare item:ASTBase
             // item.produce()
             CALL0(produce_,item);
         }

// New line char means "start new line"
         
         else if (__is(item,any_str("\n")))  {
           // rawOut.startNewLine()
           CALL0(startNewLine_,rawOut);
         }

// a simple string, out the string
         
         else if (__is(_typeof(item),any_str("string")))  {
           // rawOut.put item
           CALL1(put_,rawOut,item);
         }

// if the object is an array, resolve with a recursive call
         
         else if (_instanceof(item,Array))  {
              // # Recursive #
             // ASTBase.prototype.out.apply this,item
             __applyArr(__classMethodFunc(out_ ,ASTBase),this,item);
         }

// else, Object codes
         
         else if (_instanceof(item,Map))  {

              // declare item: Map string to any

            // expected keys:
            //  COMMENT:string, NLI, CSL:Object array, freeForm, h

// {CSL:arr} -> output the array as Comma Separated List

             // if item.get('CSL') into var CSL:array
             var CSL=undefined;
             var comment=undefined;
             var header=undefined;
             if (_anyToBool((CSL=CALL1(get_,item,any_str("CSL")))))  {

                  // additional keys: pre,post,separator
                 // var separator = item.get('separator') or ', '
                 var separator = __or(CALL1(get_,item,any_str("separator")),any_str(", "));

                 // for each inx,listItem in CSL
                 any _list12=CSL;
                 { var listItem=undefined;
                 for(int inx=0 ; inx<_list12.value.arr->length ; inx++){listItem=ITEM(inx,_list12);

                    // declare valid listItem.out

                   // if inx>0
                   if (inx > 0)  {
                     // rawOut.put separator
                     CALL1(put_,rawOut,separator);
                   };

                   // if item.get('freeForm')
                   if (_anyToBool(CALL1(get_,item,any_str("freeForm"))))  {
                       // rawOut.put '\n        '
                       CALL1(put_,rawOut,any_str("\n        "));
                   };

                    // #recurse
                   // .out item.get('pre'), listItem, item.get('post')
                   CALL3(out_,this,CALL1(get_,item,any_str("pre")), listItem, CALL1(get_,item,any_str("post")));
                 }};// end for each in CSL

                 // end for

                 // if item.get('freeForm'), rawOut.put '\n' # (prettier generated code)
                 if (_anyToBool(CALL1(get_,item,any_str("freeForm")))) {CALL1(put_,rawOut,any_str("\n"));};
             }

// {COMMENT:text} --> output text as a comment
             
             else if (_anyToBool((comment=CALL1(get_,item,any_str("COMMENT")))))  {

                 // if no .lexer or .lexer.options.comments #comments level > 0
                 if (_anyToBool(__or(any_number(!_anyToBool(PROP(lexer_,this))),PROP(comments_,PROP(options_,PROP(lexer_,this))))))  {// #comments level > 0

                      // # prepend // if necessary
                     // if type of item isnt 'string' or not comment.startsWith("//"), rawOut.put "// "
                     if (_anyToBool(__or(any_number(!__is(_typeof(item),any_str("string"))),any_number(!(_anyToBool(CALL1(startsWith_,comment,any_str("//")))))))) {CALL1(put_,rawOut,any_str("// "));};
                     // .out comment
                     CALL1(out_,this,comment);
                 };
             }

// {h:1/0} --> enable/disabe output to header file
             
             else if (!__is((header=CALL1(get_,item,any_str("h"))),undefined))  {
                 // rawOut.startNewLine
                 __call(startNewLine_,rawOut,0,NULL);
                 // rawOut.toHeader = header
                 PROP(toHeader_,rawOut) = header;
             }
             
             else {
                 // .sayErr "ASTBase method out, item:map: unrecognized map keys: #{item}"
                 CALL1(sayErr_,this,_concatAny(2,(any_arr){any_str("ASTBase method out, item:map: unrecognized map keys: "), item}));
             };
         }

// Last option, out item.toString()
         
         else {
             // rawOut.put item.toString() # try item.toString()
             CALL1(put_,rawOut,CALL0(toString_,item));// # try item.toString()
         };

         // end if
         
       }};// end for each in _newArray(argc,arguments)

       // end loop, next item
       
    return undefined;
    }


    // helper method outLineAsComment(preComment,lineInx)
    any ASTBase_outLineAsComment(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var preComment, lineInx;
       preComment=lineInx=undefined;
       switch(argc){
         case 2:lineInx=arguments[1];
         case 1:preComment=arguments[0];
       }
       //---------
// out a full source line as comment into produced code

       // if no .lexer.options.comments, return
       if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};

// manage optional parameters

       // if no lineInx
       if (!_anyToBool(lineInx))  {
         // lineInx = preComment
         lineInx = preComment;
         // preComment = ""
         preComment = any_EMPTY_STR;
       }
       
       else {
         // preComment="#{preComment}: "
         preComment = _concatAny(2,(any_arr){preComment, any_str(": ")});
       };

// validate index

       // if no .lexer, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LEXER")
       if (!_anyToBool(PROP(lexer_,this))) {return logger_error(undefined,1,(any_arr){_concatAny(3,(any_arr){any_str("ASTBase.outLineAsComment "), lineInx, any_str(": NO LEXER")})});};

       // var line = .lexer.infoLines[lineInx]
       var line = ITEM(_anyToNumber(lineInx),PROP(infoLines_,PROP(lexer_,this)));
       // if no line, return logger.error("ASTBase.outLineAsComment #{lineInx}: NO LINE")
       if (!_anyToBool(line)) {return logger_error(undefined,1,(any_arr){_concatAny(3,(any_arr){any_str("ASTBase.outLineAsComment "), lineInx, any_str(": NO LINE")})});};

       // if line.type is Parser.LineTypes.BLANK
       if (__is(PROP(type_,line),Parser_LineTypes_BLANK))  {
           // .lexer.outCode.blankLine
           __call(blankLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);
           // return
           return undefined;
       };

// out as comment

       // var prepend=""
       var prepend = any_EMPTY_STR;
       // if preComment or not line.text.startsWith("//"), prepend="// "
       if (_anyToBool(__or(preComment,any_number(!(_anyToBool(CALL1(startsWith_,PROP(text_,line),any_str("//")))))))) {prepend = any_str("// ");};
       // if no .lexer.outCode.currLine, prepend="#{Strings.spaces(line.indent)}#{prepend}"
       if (!_anyToBool(PROP(currLine_,PROP(outCode_,PROP(lexer_,this))))) {prepend = _concatAny(2,(any_arr){(Strings_spaces(undefined,1,(any_arr){PROP(indent_,line)})), prepend});};
       // if preComment or line.text, .lexer.outCode.put "#{prepend}#{preComment}#{line.text}"
       if (_anyToBool(__or(preComment,PROP(text_,line)))) {CALL1(put_,PROP(outCode_,PROP(lexer_,this)),_concatAny(3,(any_arr){prepend, preComment, PROP(text_,line)}));};

       // .lexer.outCode.startNewLine
       __call(startNewLine_,PROP(outCode_,PROP(lexer_,this)),0,NULL);

       // .lexer.outCode.lastOutCommentLine = lineInx
       PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this))) = lineInx;
    return undefined;
    }


    // helper method outLinesAsComment(fromLine,toLine)
    any ASTBase_outLinesAsComment(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var fromLine, toLine;
       fromLine=toLine=undefined;
       switch(argc){
         case 2:toLine=arguments[1];
         case 1:fromLine=arguments[0];
       }
       //---------

       // if no .lexer.options.comments, return
       if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};

        // # if line has something and is not spaces
       // if .lexer.outCode.currLine and .lexer.outCode.currLine.trim()
       if (_anyToBool(PROP(currLine_,PROP(outCode_,PROP(lexer_,this)))) && _anyToBool(CALL0(trim_,PROP(currLine_,PROP(outCode_,PROP(lexer_,this))))))  {
           // .lexer.outCode.startNewLine()
           CALL0(startNewLine_,PROP(outCode_,PROP(lexer_,this)));
       };

       // .lexer.outCode.currLine = undefined #clear indents
       PROP(currLine_,PROP(outCode_,PROP(lexer_,this))) = undefined;// #clear indents

       // for i=fromLine to toLine
       int64_t _end3=_anyToNumber(toLine);
       for(int64_t i=_anyToNumber(fromLine); i<=_end3; i++) {
           // .outLineAsComment i
           CALL1(outLineAsComment_,this,any_number(i));
       };// end for i
       
    return undefined;
    }


    // helper method outPrevLinesComments(startFrom)
    any ASTBase_outPrevLinesComments(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,ASTBase));
     //---------
     // define named params
     var startFrom= argc? arguments[0] : undefined;
     //---------

// outPrevLinesComments helper method: output comments from previous lines
// before the statement

     // if no .lexer.options.comments, return
     if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};

     // var inx = startFrom or .lineInx or 0
     var inx = __or(__or(startFrom,PROP(lineInx_,this)),any_number(0));
     // if inx<1, return
     if (_anyToNumber(inx) < 1) {return undefined;};

     // default .lexer.outCode.lastOutCommentLine = -1
     _default(&PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this))),any_number(-1));

// find comment lines in the previous lines of code.

     // var preInx = inx
     var preInx = inx;
     // while preInx and preInx>.lexer.outCode.lastOutCommentLine
     while(_anyToBool(preInx) && _anyToNumber(preInx) > _anyToNumber(PROP(lastOutCommentLine_,PROP(outCode_,PROP(lexer_,this))))){
         // preInx--
         preInx.value.number--;
         // if .lexer.infoLines[preInx].type is Parser.LineTypes.CODE
         if (__is(PROP(type_,ITEM(_anyToNumber(preInx),PROP(infoLines_,PROP(lexer_,this)))),Parser_LineTypes_CODE))  {
             // preInx++
             preInx.value.number++;
             // break
             break;
         };
     };// end loop

// Output prev comments lines (also blank lines)

     // .outLinesAsComment preInx, inx-1
     CALL2(outLinesAsComment_,this,preInx, any_number(_anyToNumber(inx) - 1));
    return undefined;
    }

    // #end method


    // helper method getEOLComment()
    any ASTBase_getEOLComment(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// getEOLComment: get the comment at the end of the line

// Check for "postfix" comments. These are comments that occur at the end of the line,
// such as `a = 1 #comment`. We want to try to add these at the end of the current JavaScript line.

       // if no .lexer.options.comments, return
       if (!_anyToBool(PROP(comments_,PROP(options_,PROP(lexer_,this))))) {return undefined;};

       // var inx = .lineInx
       var inx = PROP(lineInx_,this);
       // var infoLine = .lexer.infoLines[inx]
       var infoLine = ITEM(_anyToNumber(inx),PROP(infoLines_,PROP(lexer_,this)));

       // if infoLine.tokens and infoLine.tokens.length
       if (_anyToBool(PROP(tokens_,infoLine)) && _length(PROP(tokens_,infoLine)))  {
           // var lastToken = infoLine.tokens[infoLine.tokens.length-1]
           var lastToken = ITEM(_length(PROP(tokens_,infoLine)) - 1,PROP(tokens_,infoLine));
           // if lastToken.type is 'COMMENT'
           if (__is(PROP(type_,lastToken),any_str("COMMENT")))  {
               // return "#{lastToken.value.startsWith('//')? '' else '//'} #{lastToken.value}"
               return _concatAny(3,(any_arr){(_anyToBool(CALL1(startsWith_,PROP(value_,lastToken),any_str("//"))) ? any_EMPTY_STR : any_str("//")), any_str(" "), PROP(value_,lastToken)});
           };
       };
    return undefined;
    }

    // helper method addSourceMap(mark)
    any ASTBase_addSourceMap(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var mark= argc? arguments[0] : undefined;
       //---------

       // .lexer.outCode.addSourceMap mark, .sourceLineNum, .column, .indent
       CALL4(addSourceMap_,PROP(outCode_,PROP(lexer_,this)),mark, PROP(sourceLineNum_,this), PROP(column_,this), PROP(indent_,this));
    return undefined;
    }


    // helper method levelIndent()
    any ASTBase_levelIndent(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
// show indented messaged for debugging

       // var indent = ' '
       var indent = any_str(" ");
       // var node = .parent
       var node = PROP(parent_,this);
       // while node
       while(_anyToBool(node)){
         // node = node.parent
         node = PROP(parent_,node);
         // indent = '#{indent}  ' //add 2 spaces
         indent = _concatAny(2,(any_arr){indent, any_str("  ")}); //add 2 spaces
       };// end loop
       // return indent
       return indent;
    return undefined;
    }

    // helper method callOnSubTree(methodSymbol,excludeClass) # recursive
    any ASTBase_callOnSubTree(DEFAULT_ARGUMENTS){
     assert(_instanceof(this,ASTBase));
     //---------
     // define named params
     var methodSymbol, excludeClass;
     methodSymbol=excludeClass=undefined;
     switch(argc){
       case 2:excludeClass=arguments[1];
       case 1:methodSymbol=arguments[0];
     }
     //---------

// This is instance has the method, call the method on the instance

     // if this.tryGetMethod(methodSymbol) into var theFunction, theFunction.call(this)
     var theFunction=undefined;
     if (_anyToBool((theFunction=CALL1(tryGetMethod_,this,methodSymbol)))) {__apply(theFunction,this,0,NULL);};

     // if excludeClass and this is instance of excludeClass, return #do not recurse on filtered's childs
     if (_anyToBool(excludeClass) && _instanceof(this,excludeClass)) {return undefined;};

// recurse on this properties and Arrays (exclude 'parent' and 'importedModule')

     // for each property name,value in this
     len_t _list13_len=this.class->instanceSize / sizeof(any);
     any name=undefined;
     any value=undefined;
     for(int value__inx=0 ; value__inx<_list13_len ; value__inx++){value=this.value.prop[value__inx];
           name= _getPropertyName(this,value__inx);
       // where name not in ['parent','importedModule','requireCallNodes','exportDefault']
       if(CALL1(indexOf_,_newArray(4,(any_arr){any_str("parent"), any_str("importedModule"), any_str("requireCallNodes"), any_str("exportDefault")}),name).value.number==-1){

           // if value instance of ASTBase
           if (_instanceof(value,ASTBase))  {
                // declare value:ASTBase
               // value.callOnSubTree methodSymbol,excludeClass #recurse
               CALL2(callOnSubTree_,value,methodSymbol, excludeClass);// #recurse
           }
           
           else if (_instanceof(value,Array))  {
                // declare value:array
               // for each item in value where item instance of ASTBase
               any _list14=value;
               { var item=undefined;
               for(int item__inx=0 ; item__inx<_list14.value.arr->length ; item__inx++){item=ITEM(item__inx,_list14);
                 // for each item in value where item instance of ASTBase
               if(_instanceof(item,ASTBase)){
                    // declare item:ASTBase
                   // item.callOnSubTree methodSymbol,excludeClass
                   CALL2(callOnSubTree_,item,methodSymbol, excludeClass);
               }}};// end for each in value
               
           };
     }};// end for each property in this
     // end for
     
    return undefined;
    }


    // helper method getRootNode()
    any ASTBase_getRootNode(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------

// **getRootNode** method moves up in the AST up to the node holding the global scope ("root").
// "root" node has parent = Project

       // var node = this
       var node = this;
       // while node.parent instanceof ASTBase
       while(_instanceof(PROP(parent_,node),ASTBase)){
           // node = node.parent # move up
           node = PROP(parent_,node);// # move up
       };// end loop
       // return node
       return node;
    return undefined;
    }


    // helper method compilerVar(name)
    any ASTBase_compilerVar(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,ASTBase));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------

// helper function compilerVar(name)
// return root.compilerVars.members.get(name)

       // return .getRootNode().parent.compilerVars.members.get(name)
       return CALL1(get_,PROP(members_,PROP(compilerVars_,PROP(parent_,CALL0(getRootNode_,this)))),name);
    return undefined;
    }
   // import logger, Strings
   // shim import LiteCore, Map
   

//-------------------------
void ASTBase__moduleInit(void){
       ASTBase =_newClass("ASTBase", ASTBase__init, sizeof(struct ASTBase_s), Object.value.classINFOptr);
   
       _declareMethods(ASTBase, ASTBase_METHODS);
       _declareProps(ASTBase, ASTBase_PROPS, sizeof ASTBase_PROPS);

   // end class ASTBase
   
};