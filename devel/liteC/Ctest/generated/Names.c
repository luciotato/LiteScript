#include "Names.h"
//-------------------------
//Module Names
//-------------------------
var Names_allNameDeclarations;
   //-----------------------
   // Class Names_Declaration: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr Names_Declaration_METHODS = {
     { normalize_, Names_Declaration_normalize },
     { setMember_, Names_Declaration_setMember },
     { findOwnMember_, Names_Declaration_findOwnMember },
     { ownMember_, Names_Declaration_ownMember },
     { getMemberCount_, Names_Declaration_getMemberCount },
     { replaceForward_, Names_Declaration_replaceForward },
     { makePointTo_, Names_Declaration_makePointTo },
     { positionText_, Names_Declaration_positionText },
     { originalDeclarationPosition_, Names_Declaration_originalDeclarationPosition },
     { sayErr_, Names_Declaration_sayErr },
     { warn_, Names_Declaration_warn },
     { caseMismatch_, Names_Declaration_caseMismatch },
     { addMember_, Names_Declaration_addMember },
     { toString_, Names_Declaration_toString },
     { composedName_, Names_Declaration_composedName },
     { info_, Names_Declaration_info },
     { findMember_, Names_Declaration_findMember },
     { isInstanceof_, Names_Declaration_isInstanceof },
     { getMembersFromObjProperties_, Names_Declaration_getMembersFromObjProperties },
     { isInParents_, Names_Declaration_isInParents },
     { processConvertTypes_, Names_Declaration_processConvertTypes },
     { convertType_, Names_Declaration_convertType },
     { assignTypeFromValue_, Names_Declaration_assignTypeFromValue },
     { assignTypebyNameAffinity_, Names_Declaration_assignTypebyNameAffinity },
     { addToAllProperties_, Names_Declaration_addToAllProperties },
     { getComposedName_, Names_Declaration_getComposedName },
     { isClass_, Names_Declaration_isClass },
     { isMethod_, Names_Declaration_isMethod },
     { isProperty_, Names_Declaration_isProperty },
     { addToAllMethodNames_, Names_Declaration_addToAllMethodNames },
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t Names_Declaration_PROPS[] = {
   name_
    , members_
    , nodeDeclared_
    , parent_
    , normalizeModeKeepFirstCase_
    , type_
    , itemType_
    , value_
    , isScope_
    , isNamespace_
    , isForward_
    , isDummy_
    };
   
any Names_fixSpecialNames(DEFAULT_ARGUMENTS); //forward declare
any Names_normalizeToLower(DEFAULT_ARGUMENTS); //forward declare
any Names_normalizeKeepFirst(DEFAULT_ARGUMENTS); //forward declare
any Names_isCapitalized(DEFAULT_ARGUMENTS); //forward declare
   //-----------------------
   // Class Names_NameDeclOptions: static list of METHODS(verbs) and PROPS(things)
   //-----------------------
   
   static _methodInfoArr Names_NameDeclOptions_METHODS = {
   
   {0,0}}; //method jmp table initializer end mark
   
   static _posTableItem_t Names_NameDeclOptions_PROPS[] = {
   normalizeModeKeepFirstCase_
    , pointsTo_
    , type_
    , itemType_
    , returnType_
    , value_
    , isForward_
    , isDummy_
    , informError_
    };
   
   // Names_Declaration
   
   any Names_Declaration; //Class Object

    // properties
    ;

     // declare name affinity nameDecl

    // constructor new Declaration(name, options:NameDeclOptions, node)
    void Names_Declaration__init(DEFAULT_ARGUMENTS){
     // define named params
     var name, options, node;
     name=options=node=undefined;
     switch(argc){
       case 3:node=arguments[2];
       case 2:options=arguments[1];
       case 1:name=arguments[0];
     }
     //---------

     // .name = name
     PROP(name_,this) = name;
     // .members = new Map // JSON, is "Map string to any" literal notation
     PROP(members_,this) = new(Map,0,NULL); // JSON, is "Map string to any" literal notation
     // .nodeDeclared = node
     PROP(nodeDeclared_,this) = node;

     // if options
     if (_anyToBool(options))  {
         // if options.normalizeModeKeepFirstCase, .normalizeModeKeepFirstCase=true
         if (_anyToBool(PROP(normalizeModeKeepFirstCase_,options))) {PROP(normalizeModeKeepFirstCase_,this) = true;};

// if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
// effectively working as a pointer

         // if options.pointsTo
         if (_anyToBool(PROP(pointsTo_,options)))  {
             // .members = options.pointsTo.members
             PROP(members_,this) = PROP(members_,PROP(pointsTo_,options));
         }
         
         else {
           // if options.type, .setMember('**proto**',options.type)
           if (_anyToBool(PROP(type_,options))) {CALL2(setMember_,this,any_str("**proto**"), PROP(type_,options));};
           // if options.itemType, .setMember('**item type**',options.itemType)
           if (_anyToBool(PROP(itemType_,options))) {CALL2(setMember_,this,any_str("**item type**"), PROP(itemType_,options));};
           // if options.returnType, .setMember('**return type**',options.returnType)
           if (_anyToBool(PROP(returnType_,options))) {CALL2(setMember_,this,any_str("**return type**"), PROP(returnType_,options));};
           // if options.value, .setMember('**value**',options.value)
           if (_anyToBool(PROP(value_,options))) {CALL2(setMember_,this,any_str("**value**"), PROP(value_,options));};
         };

         // if options.isForward, .isForward = true
         if (_anyToBool(PROP(isForward_,options))) {PROP(isForward_,this) = true;};
         // if options.isDummy, .isDummy = true
         if (_anyToBool(PROP(isDummy_,options))) {PROP(isDummy_,this) = true;};
     };

// keep a list of all NameDeclarations

     // allNameDeclarations.push this
     CALL1(push_,Names_allNameDeclarations,this);
    }

    // helper method normalize(name)
    any Names_Declaration_normalize(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
       // if .normalizeModeKeepFirstCase
       if (_anyToBool(PROP(normalizeModeKeepFirstCase_,this)))  {
           // return normalizeKeepFirst(name)
           return Names_normalizeKeepFirst(undefined,1,(any_arr){name});
       }
       
       else {
           // return normalizeToLower(name)
           return Names_normalizeToLower(undefined,1,(any_arr){name});
       };
    }


    // helper method setMember(name,nameDecl)
    any Names_Declaration_setMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name, nameDecl;
       name=nameDecl=undefined;
       switch(argc){
         case 2:nameDecl=arguments[1];
         case 1:name=arguments[0];
       }
       //---------
// force set a member

       // if name is '**proto**' #setting type
       if (__is(name,any_str("**proto**")))  {// #setting type

            // # walk all the **proto** chain to avoid circular references
           // var actual = nameDecl
           var actual = nameDecl;
           // do
           do{
               // if no actual or no actual.members, break #end of chain
               if (_anyToBool(__or(any_number(!_anyToBool(actual)),any_number(!_anyToBool(PROP(members_,actual)))))) {break;};
               // if actual is this, return #circular ref, abort setting
               if (__is(actual,this)) {return undefined;};
           } while (_anyToBool((actual=CALL1(get_,PROP(members_,actual),name))));// end loop
           
       };

       // end if #avoid circular references

        // #set member
       // .members.set .normalize(name), nameDecl
       CALL2(set_,PROP(members_,this),CALL1(normalize_,this,name), nameDecl);
    }

    // helper method findOwnMember(name) returns Declaration
    any Names_Declaration_findOwnMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// this method looks for 'name' in Declaration members

       // return .members.get(.normalize(name))
       return CALL1(get_,PROP(members_,this),CALL1(normalize_,this,name));
    }

    // helper method ownMember(name)
    any Names_Declaration_ownMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var name= argc? arguments[0] : undefined;
       //---------
// this method looks for a specific member, throws if not found

       // if no .findOwnMember(name) into var result
       var result=undefined;
       if (!(_anyToBool((result=CALL1(findOwnMember_,this,name)))))  {
         // .sayErr "No member named '#{name}' on #{.info()}"
         CALL1(sayErr_,this,_concatAny(4,(any_arr){any_str("No member named '"), name, any_str("' on "), (CALL0(info_,this))}));
       };

       // return result
       return result;
    }

    // helper method getMemberCount
    any Names_Declaration_getMemberCount(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // return .members.size
       return PROP(size_,PROP(members_,this));
    }

    // helper method replaceForward ( realNameDecl: Declaration )
    any Names_Declaration_replaceForward(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var realNameDecl= argc? arguments[0] : undefined;
       //---------
// This method is called on a 'forward' Declaration
// when the real declaration is found.
// We mix in all members from realNameDecl to this declaration
// and maybe remove the forward flag.

        // declare on realNameDecl
          // members

// mix in found namedecl here

       // for each key,member in map realNameDecl.members
       any _list28=PROP(members_,realNameDecl);
       { NameValuePair_ptr _nvp4=NULL; //name:value pair
          var key=undefined; //key
        var member=undefined; //value
       for(int64_t member__inx=0 ; member__inx<_list28.value.arr->length ; member__inx++){
         assert(ITEM(member__inx,_list28).value.class==&NameValuePair_CLASSINFO);
       _nvp4 = ITEM(member__inx,_list28).value.ptr;
         key=_nvp4->name;
         member=_nvp4->value;
          // declare member:Declaration
         // member.parent = this
         PROP(parent_,member) = this;
         // .members.set key,member
         CALL2(set_,PROP(members_,this),key, member);
       }};// end for each in map PROP(members_,realNameDecl)

       // .isForward = realNameDecl.isForward
       PROP(isForward_,this) = PROP(isForward_,realNameDecl);

       // if realNameDecl.nodeDeclared
       if (_anyToBool(PROP(nodeDeclared_,realNameDecl)))  {
         // .nodeDeclared = realNameDecl.nodeDeclared
         PROP(nodeDeclared_,this) = PROP(nodeDeclared_,realNameDecl);
       };

       // return true
       return true;
    }

    // helper method makePointTo(nameDecl:Declaration)
    any Names_Declaration_makePointTo(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var nameDecl= argc? arguments[0] : undefined;
       //---------

       // if nameDecl isnt instance of Declaration, fail with "makePointTo: not a Declaration"
       if (!(_instanceof(nameDecl,Names_Declaration))) {throw(new(Error,1,(any_arr){any_str("makePointTo: not a Declaration")}));;};

        // # remove existing members from nameDeclarations[]
       // .isForward = false
       PROP(isForward_,this) = false;
       // for each memberDecl in map .members
       any _list29=PROP(members_,this);
       { NameValuePair_ptr _nvp5=NULL; //name:value pair
        var memberDecl=undefined; //value
       for(int64_t memberDecl__inx=0 ; memberDecl__inx<_list29.value.arr->length ; memberDecl__inx++){
         assert(ITEM(memberDecl__inx,_list29).value.class==&NameValuePair_CLASSINFO);
       _nvp5 = ITEM(memberDecl__inx,_list29).value.ptr;
         memberDecl=_nvp5->value;
         // allNameDeclarations.remove memberDecl
         CALL1(remove_,Names_allNameDeclarations,memberDecl);
       }};// end for each in map PROP(members_,this)

        // #save a copy of this.members pointer
       // var thisMembers = this.members
       var thisMembers = PROP(members_,this);

        // #"point to" means share "members" object
       // this.members = nameDecl.members
       PROP(members_,this) = PROP(members_,nameDecl);
        //since we get the memebers, we must also respect the sme normalization mode
       // this.normalizeModeKeepFirstCase = nameDecl.normalizeModeKeepFirstCase
       PROP(normalizeModeKeepFirstCase_,this) = PROP(normalizeModeKeepFirstCase_,nameDecl);

        // #other nameDecl pointing here are redirected
       // for each other in allNameDeclarations
       any _list30=Names_allNameDeclarations;
       { var other=undefined;
       for(int other__inx=0 ; other__inx<_list30.value.arr->length ; other__inx++){other=ITEM(other__inx,_list30);
           // if other.members is thisMembers
           if (__is(PROP(members_,other),thisMembers))  {
               // other.members = nameDecl.members
               PROP(members_,other) = PROP(members_,nameDecl);
           };
       }};// end for each in Names_allNameDeclarations
       
    }

    // helper method positionText
    any Names_Declaration_positionText(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------

       // if .nodeDeclared
       if (_anyToBool(PROP(nodeDeclared_,this)))  {
           // return .nodeDeclared.positionText()
           return CALL0(positionText_,PROP(nodeDeclared_,this));
       }
       
       else {
         // return "(compiler-defined)"
         return any_str("(compiler-defined)");
       };
    }


    // helper method originalDeclarationPosition
    any Names_Declaration_originalDeclarationPosition(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // return "#{.positionText()} for reference: original declaration of '#{.name}'"
       return _concatAny(4,(any_arr){(CALL0(positionText_,this)), any_str(" for reference: original declaration of '"), PROP(name_,this), any_str("'")});
    }


    // helper method sayErr(msg)
    any Names_Declaration_sayErr(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------
       // logger.error "#{.positionText()} #{.info()} #{msg}"
       logger_error(undefined,1,(any_arr){_concatAny(5,(any_arr){(CALL0(positionText_,this)), any_str(" "), (CALL0(info_,this)), any_str(" "), msg})});
    }

    // helper method warn(msg)
    any Names_Declaration_warn(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var msg= argc? arguments[0] : undefined;
       //---------
       // logger.warning "#{.positionText()} #{.info()} #{msg}"
       logger_warning(undefined,1,(any_arr){_concatAny(5,(any_arr){(CALL0(positionText_,this)), any_str(" "), (CALL0(info_,this)), any_str(" "), msg})});
    }

    // helper method caseMismatch(text, actualNode:ASTBase)
    any Names_Declaration_caseMismatch(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var text, actualNode;
       text=actualNode=undefined;
       switch(argc){
         case 2:actualNode=arguments[1];
         case 1:text=arguments[0];
       }
       //---------
// If this item has a different case than the name we're adding, emit error

       // if .name isnt text # if there is a case mismatch
       if (!__is(PROP(name_,this),text))  {// # if there is a case mismatch

           // logger.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
           logger_error(undefined,1,(any_arr){_concatAny(6,(any_arr){(_anyToBool(actualNode) ? CALL0(positionText_,actualNode) : CALL0(positionText_,this)), any_str(" CASE MISMATCH: '"), text, any_str("'/'"), PROP(name_,this), any_str("'")})});
           // logger.error .originalDeclarationPosition() #add original declaration line info
           logger_error(undefined,1,(any_arr){CALL0(originalDeclarationPosition_,this)});// #add original declaration line info
           // return true
           return true;
       };
    }

    // helper method addMember(nameDecl:Declaration, options:NameDeclOptions, nodeDeclared) returns Declaration
    any Names_Declaration_addMember(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // define named params
       var nameDecl, options, nodeDeclared;
       nameDecl=options=nodeDeclared=undefined;
       switch(argc){
         case 3:nodeDeclared=arguments[2];
         case 2:options=arguments[1];
         case 1:nameDecl=arguments[0];
       }
       //---------
// Adds passed Declaration to .members
// Reports duplicated.
// returns: Identifier

        // declare valid options.replaceSameName

       // if typeof nameDecl is 'string'
       if (__is(_typeof(nameDecl),any_str("string")))  {
           // nameDecl = new Declaration(nameDecl, options, nodeDeclared or .nodeDeclared)
           nameDecl = new(Names_Declaration,3,(any_arr){nameDecl, options, __or(nodeDeclared,PROP(nodeDeclared_,this))});
       };

       // logger.debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:
       logger_debug(undefined,1,(any_arr){_concatAny(5,(any_arr){any_str("addMember: '"), PROP(name_,nameDecl), any_str("' to '"), PROP(name_,this), any_str("'")})});// #[#{.constructor.name}] name:

       // if no .members
       if (!_anyToBool(PROP(members_,this)))  {
         // fail with "no .members in [#{.constructor.name}]"
         throw(new(Error,1,(any_arr){_concatAny(3,(any_arr){any_str("no .members in ["), PROP(name_,any_class(this.class)), any_str("]")})}));;
       };

       // var normalized = .normalize(nameDecl.name)
       var normalized = CALL1(normalize_,this,PROP(name_,nameDecl));

       // if not .members.get(normalized) into var found:Declaration
       var found=undefined;
       if (!(_anyToBool((found=CALL1(get_,PROP(members_,this),normalized)))))  {
           // .members.set normalized, nameDecl
           CALL2(set_,PROP(members_,this),normalized, nameDecl);
           // nameDecl.parent = this
           PROP(parent_,nameDecl) = this;
           // return nameDecl
           return nameDecl;
       };

// else, found.

// If the found item has a different case than the name we're adding, emit error & return

       // if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
       if (_anyToBool(CALL2(caseMismatch_,found,PROP(name_,nameDecl), __or(nodeDeclared,PROP(nodeDeclared_,nameDecl)))))  {
           // return nameDecl
           return nameDecl;

// if replaceSameName option set, replace found item with new item

           // .members.set normalized, nameDecl
           CALL2(set_,PROP(members_,this),normalized, nameDecl);
       }

// else, if the previously defined found item was a "forward" declaration, we add the nameDecl
// "childs" to pre-existent found declaration and remove the forward flag
       
       else if (_anyToBool(PROP(isForward_,found)))  {
           // found.replaceForward nameDecl
           CALL1(replaceForward_,found,nameDecl);
           // return found
           return found;
       }

// else, if it wasnt a forward declaration, then is a duplicated error
       
       else {
           // logger.error "#{nameDecl.positionText()}. DUPLICATED name: '#{nameDecl.name}'"
           logger_error(undefined,1,(any_arr){_concatAny(4,(any_arr){(CALL0(positionText_,nameDecl)), any_str(". DUPLICATED name: '"), PROP(name_,nameDecl), any_str("'")})});
           // logger.error "adding member '#{nameDecl.name}' to '#{.name}'"
           logger_error(undefined,1,(any_arr){_concatAny(5,(any_arr){any_str("adding member '"), PROP(name_,nameDecl), any_str("' to '"), PROP(name_,this), any_str("'")})});
           // logger.error found.originalDeclarationPosition() #add extra information line
           logger_error(undefined,1,(any_arr){CALL0(originalDeclarationPosition_,found)});// #add extra information line
       };

       // return nameDecl
       return nameDecl;
    }


    // helper method toString()
    any Names_Declaration_toString(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
        // #note: parent may point to a different node than the original declaration, if makePointTo() was used
       // return .name
       return PROP(name_,this);
    }

    // helper method composedName()
    any Names_Declaration_composedName(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------
       // var name = .name
       var name = PROP(name_,this);
       // if .parent and .parent.name isnt 'prototype' and not .parent.name.endsWith('Scope]')
       if (_anyToBool(PROP(parent_,this)) && !__is(PROP(name_,PROP(parent_,this)),any_str("prototype")) && !(_anyToBool(CALL1(endsWith_,PROP(name_,PROP(parent_,this)),any_str("Scope]")))))  {
         // name = "#{.parent.name}.#{name}"
         name = _concatAny(3,(any_arr){PROP(name_,PROP(parent_,this)), any_str("."), name});
       };
       // return name
       return name;
    }

    // helper method info()
    any Names_Declaration_info(DEFAULT_ARGUMENTS){
       assert(_instanceof(this,Names_Declaration));
       //---------

       // var type = ""
       var type = any_EMPTY_STR;

       // var nameDecltype = .findOwnMember('**proto**')
       var nameDecltype = CALL1(findOwnMember_,this,any_str("**proto**"));
       // if nameDecltype instanceof Declaration
       if (_instanceof(nameDecltype,Names_Declaration))  {
         // type = nameDecltype.name
         type = PROP(name_,nameDecltype);
         // if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope"
         if (_anyToBool(PROP(parent_,nameDecltype)) && !__is(PROP(name_,PROP(parent_,nameDecltype)),any_str("Project Root Scope")))  {
             // if type is 'prototype'
             if (__is(type,any_str("prototype")))  {
                 // type = nameDecltype.parent.name
                 type = PROP(name_,PROP(parent_,nameDecltype));
             }
             
             else {
                 // type = "#{nameDecltype.parent.name}.#{type}"
                 type = _concatAny(3,(any_arr){PROP(name_,PROP(parent_,nameDecltype)), any_str("."), type});
             };
             // end if
             
         };
       }
       
       else {
         // type='Object'
         type = any_str("Object");
       };

       // return "'#{.composedName()}:#{type}'"
       return _concatAny(5,(any_arr){any_str("'"), (CALL0(composedName_,this)), any_str(":"), type, any_str("'")});
    }
   // Names_NameDeclOptions
   
   any Names_NameDeclOptions; //Class Object
   //auto Names_NameDeclOptions__init
   void Names_NameDeclOptions__init(any this, len_t argc, any* arguments){
   };
       // properties
       ;
   // shim import Map


// #Module helper functions
// exported as members of export default class Declaration

   // helper function fixSpecialNames(text:string)
   any Names_fixSpecialNames(DEFAULT_ARGUMENTS){// define named params
     var text= argc? arguments[0] : undefined;
     //---------

     // if text in ['__proto__','NaN','Infinity','undefined','null','false','true','constructor'] # not good names
     if (CALL1(indexOf_,_newArray(8,(any_arr){any_str("__proto__"), any_str("NaN"), any_str("Infinity"), any_str("undefined"), any_str("null"), any_str("false"), any_str("true"), any_str("constructor")}),text).value.number>=0)  {// # not good names
       // return '|#{text}|'
       return _concatAny(3,(any_arr){any_str("|"), text, any_str("|")});
     }
     
     else {
       // return text
       return text;
     };
   }

   // helper function normalizeToLower(text:string) returns string
   any Names_normalizeToLower(DEFAULT_ARGUMENTS){// define named params
     var text= argc? arguments[0] : undefined;
     //---------
// we do not allow two names differing only in upper/lower case letters

     // if text.charAt(0) is "'" or text.charAt(0) is '"' #Except for quoted names
     if (_anyToBool(__or(any_number(__is(CALL1(charAt_,text,any_number(0)),any_str("'"))),any_number(__is(CALL1(charAt_,text,any_number(0)),any_str("\""))))))  {// #Except for quoted names
         // return text
         return text;
     };

     // return fixSpecialNames(text.toLowerCase())
     return Names_fixSpecialNames(undefined,1,(any_arr){CALL0(toLowerCase_,text)});
   }

   // helper function normalizeKeepFirst(text:string) returns String
   any Names_normalizeKeepFirst(DEFAULT_ARGUMENTS){// define named params
     var text= argc? arguments[0] : undefined;
     //---------
// Normalization for vars means: 1st char untouched, rest to to lower case.

// By keeping 1st char untouched, we allow "token" and "Token" to co-exists in the same scope.
// 'token', by name affinity, will default to type:'Token'

     // return fixSpecialNames(text.slice(0,1)+text.slice(1).toLowerCase())
     return Names_fixSpecialNames(undefined,1,(any_arr){any_number(_anyToNumber(CALL2(slice_,text,any_number(0), any_number(1))) + _anyToNumber(CALL0(toLowerCase_,CALL1(slice_,text,any_number(1)))))});
   }

   // helper function isCapitalized(text:string) returns boolean
   any Names_isCapitalized(DEFAULT_ARGUMENTS){// define named params
     var text= argc? arguments[0] : undefined;
     //---------

     // if text and text.charAt(0) is text.charAt(0).toUpperCase()  and
     if (_anyToBool(text) && __is(CALL1(charAt_,text,any_number(0)),CALL0(toUpperCase_,CALL1(charAt_,text,any_number(0)))) && (_anyToBool(__or(any_number(__is(any_number(_length(text)),any_number(1))),any_number(__is(CALL1(charAt_,text,any_number(1)),CALL0(toLowerCase_,CALL1(charAt_,text,any_number(1)))))))))  {
             // return true
             return true;
     };

     // return false
     return false;
   }

//-------------------------
void Names__moduleInit(void){
Names_allNameDeclarations = _newArray(0,NULL);
       Names_Declaration =_newClass("Names_Declaration", Names_Declaration__init, sizeof(struct Names_Declaration_s), Object.value.class);
   
       _declareMethods(Names_Declaration.value.class, Names_Declaration_METHODS);
       _declareProps(Names_Declaration.value.class, Names_Declaration_PROPS, sizeof Names_Declaration_PROPS);
       Names_NameDeclOptions =_newClass("Names_NameDeclOptions", Names_NameDeclOptions__init, sizeof(struct Names_NameDeclOptions_s), Object.value.class);
   
       _declareMethods(Names_NameDeclOptions.value.class, Names_NameDeclOptions_METHODS);
       _declareProps(Names_NameDeclOptions.value.class, Names_NameDeclOptions_PROPS, sizeof Names_NameDeclOptions_PROPS);
};