//Compiled by LiteScript compiler v0.4.0, source: /home/ltato/LiteScript/source-v0.5.0/NameDeclaration.lite.md

//Dependencies
//------------

   //import ASTBase,Grammar,log
   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var log = require('./log');
   var debug = log.debug;

   //export default class NameDeclaration
   //constructor
   function NameDeclaration(name, options, node){

     this.name = name;
     this.members = {};
     this.nodeDeclared = node;

      //declare on options
        //pointsTo:NameDeclaration, type, itemType, value, isForward, isDummy

     //if options
     if (options) {

//if it 'points' to another namedecl, it uses other nameDecl's '.members={}'
//effectively working as a pointer

       //if options.pointsTo
       if (options.pointsTo) {
           this.members = options.pointsTo.members;
       }
       
       else {
         //if options.type, .setMember('**proto**',options.type)
         if (options.type) {
             this.setMember('**proto**', options.type)};
         //if options.itemType, .setMember('**item type**',options.itemType)
         if (options.itemType) {
             this.setMember('**item type**', options.itemType)};
         //if options.hasOwnProperty('value'), .setMember('**value**',options.value)
         if (options.hasOwnProperty('value')) {
             this.setMember('**value**', options.value)};
       };

       //if options.isForward, .isForward = true
       if (options.isForward) {
           this.isForward = true};
       //if options.isDummy, .isDummy = true
       if (options.isDummy) {
           this.isDummy = true};
     };

//keep a list of all NameDeclarations

     NameDeclaration.allOfThem.push(this);
    };
     //     properties

      //name: string
      //members
      //nodeDeclared: ASTBase
      //parent: NameDeclaration
      //type, itemType
      //converted
      //value
      //isForward
      //isDummy

     //declare name affinity nameDecl


    //helper method setMember(name,nameDecl)
    NameDeclaration.prototype.setMember = function(name, nameDecl){
//force set a member

       //if name is '**proto**' #setting type
       if (name === '**proto**') {// #setting type
         //if nameDecl is this, return  #avoid circular type defs
         if (nameDecl === this) {
             return};
       };

       this.members[normalizePropName(name)] = nameDecl;
    };

    //helper method findOwnMember(name) returns NameDeclaration
    NameDeclaration.prototype.findOwnMember = function(name){
//this method looks for 'name' in NameDeclaration members

       var normalized = normalizePropName(name);
       //if .members.hasOwnProperty(normalized)
       if (this.members.hasOwnProperty(normalized)) {
         return this.members[normalized];
       };
    };



    //helper method ownMember(name)
    NameDeclaration.prototype.ownMember = function(name){
//this method looks for a specific member, throws if not found

       var normalized = normalizePropName(name);
       //if .members.hasOwnProperty(normalized)
       if (this.members.hasOwnProperty(normalized)) {
         return this.members[normalized];
       };

       this.sayErr("No member named '" + name + "' on " + (this.info()));
    };


    //helper method replaceForward ( realNameDecl: NameDeclaration )
    NameDeclaration.prototype.replaceForward = function(realNameDecl){
//This method is called on a 'forward' NameDeclaration
//when the real declaration is found.
//We mix in all members from realNameDecl to this declaration
//and maybe remove the forward flag.

        //declare on realNameDecl
          //members

//mix in members

       //for each member in Object.keys(realNameDecl.members)
       var list__1=Object.keys(realNameDecl.members);
       for( var member__inx=0,member ; member__inx<list__1.length ; member__inx++){member=list__1[member__inx];
       
         this.addMember(member, {replaceSameName: true});
       }; // end for each in Object.keys(realNameDecl.members)

       this.isForward = realNameDecl.isForward;

       //if realNameDecl.nodeDeclared
       if (realNameDecl.nodeDeclared) {
         this.nodeDeclared = realNameDecl.nodeDeclared;
       };

       return true;
    };




    //helper method makePointTo(nameDecl:NameDeclaration)
    NameDeclaration.prototype.makePointTo = function(nameDecl){

       //if nameDecl isnt instance of NameDeclaration, fail with "makePointTo: not a NameDeclaration"
       if (!(nameDecl instanceof NameDeclaration)) {
           throw new Error("makePointTo: not a NameDeclaration")};

        //# remove existing members from nameDeclarations[]
       this.isForward = false;
       //for each property name in .members
       for ( var name in this.members){
         var memberDecl = this.members[name];
         NameDeclaration.allOfThem.remove(memberDecl);
         }
       //end for each property

        //#save a copy of this.members pointer
       var thisMembers = this.members;

        //#"point to" means share "members" object
       this.members = nameDecl.members;

        //#other nameDecl pointing here are redirected
       //for each other in NameDeclaration.allOfThem
       for( var other__inx=0,other ; other__inx<NameDeclaration.allOfThem.length ; other__inx++){other=NameDeclaration.allOfThem[other__inx];
       
           //if other.members is thisMembers
           if (other.members === thisMembers) {
               other.members = nameDecl.members;
           };
       }; // end for each in NameDeclaration.allOfThem
       
    };

    //helper method positionText
    NameDeclaration.prototype.positionText = function(){

       //if .nodeDeclared
       if (this.nodeDeclared) {
           return this.nodeDeclared.positionText();
       }
       
       else {
         return "(compiler-defined)";
       };
    };


    //helper method originalDeclarationPosition
    NameDeclaration.prototype.originalDeclarationPosition = function(){
       return "" + (this.positionText()) + " for reference: original declaration of '" + this.name + "'";
    };


    //helper method sayErr(msg)
    NameDeclaration.prototype.sayErr = function(msg){
       log.error("" + (this.positionText()) + " " + (this.info()) + " " + msg);
    };

    //helper method warn(msg)
    NameDeclaration.prototype.warn = function(msg){
       log.warning("" + (this.positionText()) + " " + (this.info()) + " " + msg);
    };

    //helper method caseMismatch(text, actualNode:ASTBase)
    NameDeclaration.prototype.caseMismatch = function(text, actualNode){
//If this item has a different case than the name we're adding, emit error

       //if .name isnt text # if there is a case mismatch
       if (this.name !== text) {// # if there is a case mismatch

           log.error("" + (actualNode ? actualNode.positionText() : this.positionText()) + " CASE MISMATCH: '" + text + "'/'" + this.name + "'");
           log.error(this.originalDeclarationPosition());// #add original declaration line info
           return true;
       };
    };


    //helper method addMember(nameDecl:NameDeclaration, options, nodeDeclared)
    NameDeclaration.prototype.addMember = function(nameDecl, options, nodeDeclared){
//Adds passed NameDeclaration to .members[].
//Reports duplicated.
//returns: Identifier

        //declare valid options.replaceSameName

        //declare dest:NameDeclaration
        //declare found:NameDeclaration

       //if not (nameDecl instanceof NameDeclaration)
       if (!((nameDecl instanceof NameDeclaration))) {
         nameDecl = new NameDeclaration(nameDecl, options, nodeDeclared || this.nodeDeclared);
       };
          //fail with "not nameDecl instanceof NameDeclaration"

       //default options =
       if(!options) options={};
       // options.scopeCase: undefined

       debug("addMember: '" + nameDecl.name + "' to '" + this.name + "'");// #[#{.constructor.name}] name:

       var dest = this;
       //if no .members
       if (!this.members) {
         //fail with "no .members in [#{.constructor.name}]"
         throw new Error("no .members in [" + this.constructor.name + "]");
       };

       var normalized = options.scopeCase ? normalizeVarName(nameDecl.name) : normalizePropName(nameDecl.name);

       //if dest.members.hasOwnProperty(normalized)
       if (dest.members.hasOwnProperty(normalized)) {
         var found = dest.members[normalized];
       };

       //if not found
       if (!(found)) {
         dest.members[normalized] = nameDecl;
         nameDecl.parent = dest;
         return nameDecl;
       };

//else, found.
//If the found item has a different case than the name we're adding, emit error & return

       //if found.caseMismatch(nameDecl.name, nodeDeclared or nameDecl.nodeDeclared)
       if (found.caseMismatch(nameDecl.name, nodeDeclared || nameDecl.nodeDeclared)) {
           return nameDecl;

//if replaceSameName option set, replace found item with new item

           dest.members[normalized] = nameDecl;
       }

//else, if the previously defined found item was a "forward" declaration, we add the nameDecl
//"childs" to pre-existent found declaration and remove the forward flag
       
       else if (found.isForward) {
           found.replaceForward(nameDecl);
           return found;
       }

//else, if it wasnt a forward declaration, then is a duplicated error
       
       else {
           log.error("" + (nameDecl.positionText()) + ". DUPLICATED property name: '" + nameDecl.name + "'");
           log.error(found.originalDeclarationPosition());// #add extra information line
           //if no nameDecl.nodeDeclared, console.trace
           if (!nameDecl.nodeDeclared) {
               console.trace()};
       };

       return nameDecl;
    };


    //helper method toString()
    NameDeclaration.prototype.toString = function(){
        //#note: parent may point to a different node than the original declaration, if makePointTo() was used
       return this.name;
    };

    //helper method composedName()
    NameDeclaration.prototype.composedName = function(){
       var name = this.name;
       //if .parent and .parent.name isnt "Project Root Scope"
       if (this.parent && this.parent.name !== "Project Root Scope") {
         name = this.parent.name + '.' + name;
       };
       return name;
    };

    //helper method info()
    NameDeclaration.prototype.info = function(){

       var type = "";

       var nameDecltype = this.findOwnMember('**proto**');
       //if nameDecltype instanceof NameDeclaration
       if (nameDecltype instanceof NameDeclaration) {
         type = nameDecltype.name;
         //if nameDecltype.parent and nameDecltype.parent.name isnt "Project Root Scope"
         if (nameDecltype.parent && nameDecltype.parent.name !== "Project Root Scope") {
             //if type is 'prototype'
             if (type === 'prototype') {
                 type = nameDecltype.parent.name;
             }
             
             else {
                 type = "" + nameDecltype.parent.name + "." + type;
             };
             //end if
             
         };
       }
       
       else {
         type = 'Object';
       };

       return "'" + (this.composedName()) + ":" + type + "'";
    };
   //end class NameDeclaration


//## Namespace (singleton) properties

   //Append to namespace NameDeclaration
   
      //properties
        //allOfThem: NameDeclaration array = [] #array with all NameDeclarations created
     NameDeclaration.allOfThem=[];
     


//#Module helper functions
//exported as members of export default class NameDeclaration

   //export helper function fixSpecialNames(text:string)
   function fixSpecialNames(text){

     //if text in ['__proto__','NaN','Infinity','undefined','null','false','true'] # not good names
     if (['__proto__', 'NaN', 'Infinity', 'undefined', 'null', 'false', 'true'].indexOf(text)>=0) {// # not good names
       return '|' + text + '|';
     }
     
     else {
       return text;
     };
   };
   //export
   NameDeclaration.fixSpecialNames=fixSpecialNames;

   //export helper function normalizePropName(text:string) returns string
   function normalizePropName(text){
//we do not allow two names differing only in upper/lower case letters

     //if text[0] is "'" or text[0] is '"' #Except for quoted names
     if (text[0] === "'" || text[0] === '"') {// #Except for quoted names
         return text;
     };

     return fixSpecialNames(text.toLowerCase());
   };
   //export
   NameDeclaration.normalizePropName=normalizePropName;

   //export helper function normalizeVarName(text:string) returns String
   function normalizeVarName(text){
//Normalization for vars means: 1st char untouched, rest to to lower case.

//By keeping 1st char untouched, we allow "token" and "Token" to co-exists in the same scope.
//'token', by name affinity, will default to type:'Token'

     return fixSpecialNames(text.slice(0, 1) + text.slice(1).toLowerCase());
   };
   //export
   NameDeclaration.normalizeVarName=normalizeVarName;



module.exports=NameDeclaration;
