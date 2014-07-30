//Dependencies
//------------
    //import ASTBase,Grammar,logger
    var ASTBase = require('./ASTBase.js');
    var Grammar = require('./Grammar.js');
    var logger = require('./lib/logger.js');
    //shim import Map
    var Map = require('./lib/Map.js');
//Module vars
    //public var allNameDeclarations: Declaration array = [] #array with all NameDeclarations created
    var allNameDeclarations = [];
    // export
    module.exports.allNameDeclarations = allNameDeclarations;
//### public Class Declaration
    // constructor
    function Declaration(name, options, node){
//#### properties
        //name: string
        //members: Map string to Declaration
        //nodeDeclared: ASTBase
        //parent: Declaration
        //normalizeModeKeepFirstCase: boolean
        //isScope: boolean
        
        //nodeClass //VariableDecl(var&props)|MethodDeclaration|NamespaceDeclaration|ClassDeclaration
        //isPublicVar: boolean
        //type, itemType
        //value
        //isForward
        //isDummy
     //declare name affinity nameDecl
//#### constructor new Declaration(name, options:NameDeclOptions, node:ASTBase)
      
      //.name = name
      this.name = name;
      //.members = new Map // JSON, is "Map string to any" literal notation
      this.members = new Map(); // JSON, is "Map string to any" literal notation
      //.nodeDeclared = node
      this.nodeDeclared = node;
      //if node 
      if (node) {
          //.nodeClass = node.constructor
          this.nodeClass = node.constructor;
          //if .nodeClass is Grammar.Module //module as namespace declaration
          if (this.nodeClass === Grammar.Module) { //module as namespace declaration
              //.nodeClass = Grammar.NamespaceDeclaration //treat as a namespace
              this.nodeClass = Grammar.NamespaceDeclaration; //treat as a namespace
          };
      };
      //if options 
      if (options) {
          //if options.normalizeModeKeepFirstCase, .normalizeModeKeepFirstCase=true
          if (options.normalizeModeKeepFirstCase) {this.normalizeModeKeepFirstCase = true};
//if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
//effectively working as a pointer
          //if options.pointsTo 
          if (options.pointsTo) {
              //.members = options.pointsTo.members
              this.members = options.pointsTo.members;
          }
          else {
          //else 
            //if options.type, .setMember('**proto**',options.type)
            if (options.type) {this.setMember('**proto**', options.type)};
            //if options.itemType, .setMember('**item type**',options.itemType)
            if (options.itemType) {this.setMember('**item type**', options.itemType)};
            //if options.returnType, .setMember('**return type**',options.returnType)
            if (options.returnType) {this.setMember('**return type**', options.returnType)};
            //if options.value, .setMember('**value**',options.value)
            if (options.value) {this.setMember('**value**', options.value)};
          };
              
          //if options.isForward, .isForward = true
          if (options.isForward) {this.isForward = true};
          //if options.isDummy, .isDummy = true
          if (options.isDummy) {this.isDummy = true};
      };
//keep a list of all NameDeclarations
      //allNameDeclarations.push this
      module.exports.allNameDeclarations.push(this);
     };
     
//#### Helper method normalize(name)
     Declaration.prototype.normalize = function(name){
        //if .normalizeModeKeepFirstCase 
        if (this.normalizeModeKeepFirstCase) {
            //return normalizeKeepFirst(name)
            return normalizeKeepFirst(name);
        }
        else {
        //else
            //return normalizeToLower(name)
            return normalizeToLower(name);
        };
     };
//#### Helper method setMember(name,value)
     Declaration.prototype.setMember = function(name, value){
//force set a member
        //if name is '**proto**'
        if (name === '**proto**') {
            //# walk all the **proto** chain to avoid circular references
            //var nameDecl = value
            var nameDecl = value;
            //do 
            do{
                //if nameDecl isnt instance of Declaration, break #a nameDecl with a string yet to be de-reference
                if (!(nameDecl instanceof Declaration)) {break};
                //if nameDecl is this, return #circular ref, abort setting 
                if (nameDecl === this) {return};
            } while ((nameDecl=nameDecl.members.get(name)));// end loop
            
        };
            //loop while nameDecl.members.get(name) into nameDecl #next in chain
        //end if #avoid circular references
        
        //#set member
        //.members.set .normalize(name), value
        this.members.set(this.normalize(name), value);
     };
//#### Helper method findOwnMember(name) returns Declaration
     Declaration.prototype.findOwnMember = function(name){
//this method looks for 'name' in Declaration members
        //return .members.get(.normalize(name))
        return this.members.get(this.normalize(name));
     };
//#### Helper method ownMember(name) returns Declaration
     Declaration.prototype.ownMember = function(name){
//this method looks for a specific member, throws if not found
        //if no .findOwnMember(name) into var result
        var result=undefined;
        if (!((result=this.findOwnMember(name)))) {
          //.sayErr "No member named '#{name}' on #{.info()}"
          this.sayErr("No member named '" + name + "' on " + (this.info()));
        };
        //return result
        return result;
     };
//#### Helper method getMemberCount 
     Declaration.prototype.getMemberCount = function(){
        //return .members.size
        return this.members.size;
     };
//#### Helper method replaceForward ( realNameDecl: Declaration )
     Declaration.prototype.replaceForward = function(realNameDecl){
//This method is called on a 'forward' Declaration
//when the real declaration is found.
//We mix in all members from realNameDecl to this declaration 
//and maybe remove the forward flag.
        //declare on realNameDecl
          //members
        
//mix in found namedecl here
        //for each key,member in map realNameDecl.members
        var member=undefined;
        if(!realNameDecl.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var key in realNameDecl.members.dict) if (realNameDecl.members.dict.hasOwnProperty(key)){member=realNameDecl.members.dict[key];
          {
          //declare member:Declaration
          
          //member.parent = this
          member.parent = this;
          //.members.set key,member
          this.members.set(key, member);
          }
          
          }// end for each property
        //.isForward = realNameDecl.isForward
        this.isForward = realNameDecl.isForward;
        //if realNameDecl.nodeDeclared
        if (realNameDecl.nodeDeclared) {
          //.nodeDeclared = realNameDecl.nodeDeclared
          this.nodeDeclared = realNameDecl.nodeDeclared;
        };
        //return true
        return true;
     };
//#### helper method makePointTo(nameDecl:Declaration)
     Declaration.prototype.makePointTo = function(nameDecl){
        
        //if nameDecl isnt instance of Declaration, fail with "makePointTo: not a Declaration"
        if (!(nameDecl instanceof Declaration)) {throw new Error("makePointTo: not a Declaration")};
        //# remove existing members from nameDeclarations[]
        //.isForward = false
        this.isForward = false;
        //for each memberDecl in map .members
        var memberDecl=undefined;
        if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
        for ( var memberDecl__propName in this.members.dict) if (this.members.dict.hasOwnProperty(memberDecl__propName)){memberDecl=this.members.dict[memberDecl__propName];
          {
          //allNameDeclarations.remove memberDecl
          module.exports.allNameDeclarations.remove(memberDecl);
          }
          
          }// end for each property
        //#save a copy of this.members pointer
        //var thisMembers = this.members
        var thisMembers = this.members;
        //#"point to" means share "members" object 
        //this.members = nameDecl.members
        this.members = nameDecl.members;
        ////since we get the members, we must also respect the same normalization mode
        //this.normalizeModeKeepFirstCase = nameDecl.normalizeModeKeepFirstCase
        this.normalizeModeKeepFirstCase = nameDecl.normalizeModeKeepFirstCase;
        //this.nodeClass = nameDecl.nodeClass //and other data
        this.nodeClass = nameDecl.nodeClass; //and other data
        //this.isPublicVar = nameDecl.isPublicVar
        this.isPublicVar = nameDecl.isPublicVar;
        //#other nameDecl pointing here are redirected
        //for each other in allNameDeclarations
        for( var other__inx=0,other ; other__inx<module.exports.allNameDeclarations.length ; other__inx++){other=module.exports.allNameDeclarations[other__inx];
        
            //if other.members is thisMembers
            if (other.members === thisMembers) {
                //other.members = nameDecl.members
                other.members = nameDecl.members;
            };
        };// end for each in module.exports.allNameDeclarations
        
     };
//#### helper method positionText 
     Declaration.prototype.positionText = function(){
        //if .nodeDeclared
        if (this.nodeDeclared) {
            //return .nodeDeclared.positionText()
            return this.nodeDeclared.positionText();
        }
        else {
        //else
          //return "(compiler-defined)"
          return "(compiler-defined)";
        };
     };
//#### helper method originalDeclarationPosition 
     Declaration.prototype.originalDeclarationPosition = function(){
        //return "#{.positionText()} for reference: original declaration of '#{.name}'"
        return '' + (this.positionText()) + " for reference: original declaration of '" + this.name + "'";
     };
//#### helper method sayErr(msg) 
     Declaration.prototype.sayErr = function(msg){
        //logger.error "#{.positionText()} #{.info()} #{msg}"
        logger.error('' + (this.positionText()) + " " + (this.info()) + " " + msg);
     };
//#### helper method warn(msg) 
     Declaration.prototype.warn = function(msg){
        //logger.warning "#{.positionText()} #{.info()} #{msg}"
        logger.warning('' + (this.positionText()) + " " + (this.info()) + " " + msg);
     };
//#### helper method caseMismatch(text, actualNode:ASTBase) 
     Declaration.prototype.caseMismatch = function(text, actualNode){
//If this item has a different case than the name we're adding, emit error
        //if .name isnt text # if there is a case mismatch
        if (this.name !== text) {// # if there is a case mismatch
            //logger.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
            logger.error('' + (actualNode ? actualNode.positionText() : this.positionText()) + " CASE MISMATCH: '" + text + "'/'" + this.name + "'");
            //logger.error .originalDeclarationPosition() #add original declaration line info
            logger.error(this.originalDeclarationPosition());// #add original declaration line info
            //return true
            return true;
        };
     };
//#### helper method addMember(nameDecl:Declaration, options:NameDeclOptions, nodeDeclared) returns Declaration
     Declaration.prototype.addMember = function(nameDecl, options, nodeDeclared){
//Adds passed Declaration to .members
//Reports duplicated.
//returns: Identifier
        
        //declare valid options.replaceSameName
        
        //if typeof nameDecl is 'string'
        if (typeof nameDecl === 'string') {
            //nameDecl = new Declaration(nameDecl, options, nodeDeclared or .nodeDeclared)
            nameDecl = new Declaration(nameDecl, options, nodeDeclared || this.nodeDeclared);
        };
        //logger.debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:
        logger.debug("addMember: '" + nameDecl.name + "' to '" + this.name + "'");// #[#{.constructor.name}] name:
        //if no .members
        if (!this.members) {
          //fail with "no .members in [#{.constructor.name}]"
          throw new Error("no .members in [" + this.constructor.name + "]");
        };
        //var normalized = .normalize(nameDecl.name) 
        var normalized = this.normalize(nameDecl.name);
        //if not .members.get(normalized) into var found:Declaration
        var found=undefined;
        if (!((found=this.members.get(normalized)))) {
            //.members.set normalized, nameDecl
            this.members.set(normalized, nameDecl);
            //nameDecl.parent = this
            nameDecl.parent = this;
            //return nameDecl
            return nameDecl;
        };
//else, found.
//If the found item has a different case than the name we're adding, emit error & return
        //if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
        if (found.caseMismatch(nameDecl.name, nodeDeclared || nameDecl.nodeDeclared)) {
            //return nameDecl
            return nameDecl;
//if replaceSameName option set, replace found item with new item
            //.members.set normalized, nameDecl
            this.members.set(normalized, nameDecl);
        }
        else if (found.isForward) {
//else, if the previously defined found item was a "forward" declaration, we add the nameDecl 
//"childs" to pre-existent found declaration and remove the forward flag
        //else if found.isForward
            //found.replaceForward nameDecl
            found.replaceForward(nameDecl);
            //return found
            return found;
        }
        else {
//else, if it wasnt a forward declaration, then is a duplicated error
        //else 
            //logger.error "#{nameDecl.positionText()}. DUPLICATED name: '#{nameDecl.name}'"
            logger.error('' + (nameDecl.positionText()) + ". DUPLICATED name: '" + nameDecl.name + "'");
            //logger.error "adding member '#{nameDecl.name}' to '#{.name}'"
            logger.error("adding member '" + nameDecl.name + "' to '" + this.name + "'");
            //logger.error found.originalDeclarationPosition() #add extra information line
            logger.error(found.originalDeclarationPosition());// #add extra information line
        };
        //return nameDecl
        return nameDecl;
     };
//#### helper method toString() 
     Declaration.prototype.toString = function(){
        //#note: parent may point to a different node than the original declaration, if makePointTo() was used
        //return .name
        return this.name;
     };
  
//#### helper method composedName() 
     Declaration.prototype.composedName = function(){
        //var name = .name
        var name = this.name;
        //if .parent and .parent.name isnt 'prototype' and not .parent.name.endsWith('Scope]')
        if (this.parent && this.parent.name !== 'prototype' && !(this.parent.name.endsWith('Scope]'))) {
          //name = "#{.parent.name}.#{name}"
          name = '' + this.parent.name + "." + name;
        };
        //return name
        return name;
     };
//#### helper method info() 
     Declaration.prototype.info = function(){
        //var type = ""
        var type = "";
        
        //if .nodeClass is Grammar.ClassDeclaration
        if (this.nodeClass === Grammar.ClassDeclaration) {
            //type = 'Class'
            type = 'Class';
        }
        else {
        //else
            //var nameDecltype = .findOwnMember('**proto**')
            var nameDecltype = this.findOwnMember('**proto**');
            //if nameDecltype instanceof Declaration
            if (nameDecltype instanceof Declaration) {
                //type = nameDecltype.name
                type = nameDecltype.name;
                //if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope" 
                if (nameDecltype.parent && nameDecltype.parent.name !== "Project Root Scope") {
                    //if type is 'prototype'
                    if (type === 'prototype') {
                        //type = nameDecltype.parent.name
                        type = nameDecltype.parent.name;
                    }
                    else {
                    //else
                        //type = "#{nameDecltype.parent.name}.#{type}"
                        type = '' + nameDecltype.parent.name + "." + type;
                    };
                    //end if 
                    
                };
                
                //if no type and .nodeClass is Grammar.ImportStatement, type="import"
                if (!type && this.nodeClass === Grammar.ImportStatement) {type = "import"};
            }
            else {
            //else
                //if .nodeDeclared and .nodeDeclared.type, type=.nodeDeclared.type
                if (this.nodeDeclared && this.nodeDeclared.type) {type = this.nodeDeclared.type};
            };
        };
        //end if
        
        //if type, type=":#{type}" //prepend :
        if (type) {type = ":" + type};
        //return "'#{.composedName()}#{type}'"
        return "'" + (this.composedName()) + type + "'";
     };
    // export
    module.exports.Declaration = Declaration;
    
    // end class Declaration
//#Module helper functions 
//exported as members of export default class Declaration
//### helper function fixSpecialNames(text:string)
    function fixSpecialNames(text){
      //if text in ['__proto__','NaN','Infinity','undefined','null','false','true','constructor'] # not good names
      if (['__proto__', 'NaN', 'Infinity', 'undefined', 'null', 'false', 'true', 'constructor'].indexOf(text)>=0) {// # not good names
        //return '|#{text}|'
        return '|' + text + '|';
      }
      else {
      //else
        //return text
        return text;
      };
    };
//### helper function normalizeToLower(text:string) returns string
    function normalizeToLower(text){
//we do not allow two names differing only in upper/lower case letters
      //if text.charAt(0) is "'" or text.charAt(0) is '"' #Except for quoted names
      if (text.charAt(0) === "'" || text.charAt(0) === '"') {// #Except for quoted names
          //return text
          return text;
      };
      //return fixSpecialNames(text.toLowerCase())
      return fixSpecialNames(text.toLowerCase());
    };
//### helper function normalizeKeepFirst(text:string) returns String
    function normalizeKeepFirst(text){
//Normalization for vars means: 1st char untouched, rest to to lower case.
//By keeping 1st char untouched, we allow "token" and "Token" to co-exists in the same scope.
//'token', by name affinity, will default to type:'Token'
      //return fixSpecialNames( "#{text.slice(0,1)}#{text.slice(1).toLowerCase()}" )
      return fixSpecialNames('' + (text.slice(0, 1)) + (text.slice(1).toLowerCase()));
    };
//### helper function isCapitalized(text:string) returns boolean 
    function isCapitalized(text){
      //if text and text.charAt(0) is text.charAt(0).toUpperCase()  and 
      if (text && text.charAt(0) === text.charAt(0).toUpperCase() && (text.length === 1 || text.charAt(1) === text.charAt(1).toLowerCase())) {
          //( text.length is 1 or text.charAt(1) is text.charAt(1).toLowerCase()) 
              //return true
              return true;
      };
      //return false
      return false;
    };
//### export class NameDeclOptions
    // constructor
    function NameDeclOptions(){ // default constructor
        //properties
            //normalizeModeKeepFirstCase: boolean
            //pointsTo : Declaration
            //type, itemType, returnType 
            //value, isForward, isDummy
            //informError: boolean
    };
    
    // export
    module.exports.NameDeclOptions = NameDeclOptions;
    
    // end class NameDeclOptions
