

//Dependencies
//------------

   var ASTBase = require('./ASTBase');
   var Grammar = require('./Grammar');
   var log = require('./log');
   var debug = log.debug;

   // Class NameDeclaration, constructor:
   function NameDeclaration(name, options, node){

     this.name = name;
     this.members = {};
     this.nodeDeclared = node;

//      declare on options
//        pointsTo:NameDeclaration, type, itemType, value, isForward, isDummy

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

     //NameDeclaration.allOfThem.push this
     NameDeclaration.allOfThem.push(this);
    };
   
   // declared properties & methods
//          namespace properties # Namespace "NameDeclaration" (singleton) properties

//        allOfThem: NameDeclaration array = [] #array with all NameDeclarations created
    NameDeclaration.allOfThem=[];

//          properties

//      name: string
//      members
//      nodeDeclared: ASTBase
//      parent: NameDeclaration
//      type, itemType
//      converted
//      value
//      isForward
//      isDummy

//     declare name affinity nameDecl


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
         //return .members[normalized]
         return this.members[normalized];
       };
    };



    //helper method ownMember(name)
    NameDeclaration.prototype.ownMember = function(name){
//this method looks for a specific member, throws if not found

       var normalized = normalizePropName(name);
       //if .members.hasOwnProperty(normalized)
       if (this.members.hasOwnProperty(normalized)) {
         //return .members[normalized]
         return this.members[normalized];
       };

       //.sayErr "No member named '#{name}' on #{.info()}"
       this.sayErr("No member named '" + (name) + "' on " + (this.info()));
    };


    //helper method replaceForward ( realNameDecl: NameDeclaration )
    NameDeclaration.prototype.replaceForward = function(realNameDecl){
//This method is called on a 'forward' NameDeclaration
//when the real declaration is found.
//We mix in all members from realNameDecl to this declaration
//and maybe remove the forward flag.

//        declare on realNameDecl
//          members

//mix in members

       //for each member in Object.keys(realNameDecl.members)
       var list__1=Object.keys(realNameDecl.members);
       for( var member__inx=0,member=undefined; member__inx<list__1.length; member__inx++){member=list__1[member__inx];
       
         //.addMember(member,{replaceSameName:true})
         this.addMember(member, {replaceSameName: true});
       }; // end for each in Object.keys(realNameDecl.members)

       this.isForward = realNameDecl.isForward;

       //if realNameDecl.nodeDeclared
       if (realNameDecl.nodeDeclared) {
         this.nodeDeclared = realNameDecl.nodeDeclared;
       };

       //return true
       return true;
    };




    //helper method makePointTo(nameDecl:NameDeclaration)
    NameDeclaration.prototype.makePointTo = function(nameDecl){

       //if nameDecl isnt instance of NameDeclaration, fail with "makePointTo: not a NameDeclaration"
       if (!(nameDecl instanceof NameDeclaration)) {
           throw new Error("makePointTo: not a NameDeclaration")};

//        # remove existing members from nameDeclarations[]
       this.isForward = false;
       //for each property name in .members
       for ( var name in this.members){
         var memberDecl = this.members[name];
         //NameDeclaration.allOfThem.remove memberDecl
         NameDeclaration.allOfThem.remove(memberDecl);
       }
       //end for each property

//        #save a copy of this.members pointer
       var thisMembers = this.members;

//        #"point to" means share "members" object
       this.members = nameDecl.members;

//        #other nameDecl pointing here are redirected
       //for each other in NameDeclaration.allOfThem
       for( var other__inx=0,other=undefined; other__inx<NameDeclaration.allOfThem.length; other__inx++){other=NameDeclaration.allOfThem[other__inx];
       
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
           //return .nodeDeclared.positionText()
           return this.nodeDeclared.positionText();
       }
       else {
         //return "(compiler-defined)"
         return "(compiler-defined)";
       };
    };


    //helper method originalDeclarationPosition
    NameDeclaration.prototype.originalDeclarationPosition = function(){
       //return "#{.positionText()} for reference: original declaration of '#{.name}'"
       return "" + (this.positionText()) + " for reference: original declaration of '" + (this.name) + "'";
    };


    //helper method sayErr(msg)
    NameDeclaration.prototype.sayErr = function(msg){
       //log.error "#{.positionText()} #{.info()} #{msg}"
       log.error("" + (this.positionText()) + " " + (this.info()) + " " + (msg));
    };

    //helper method warn(msg)
    NameDeclaration.prototype.warn = function(msg){
       //log.warning "#{.positionText()} #{.info()} #{msg}"
       log.warning("" + (this.positionText()) + " " + (this.info()) + " " + (msg));
    };

    //helper method caseMismatch(text, actualNode:ASTBase)
    NameDeclaration.prototype.caseMismatch = function(text, actualNode){
//If this item has a different case than the name we're adding, emit error

       //if .name isnt text # if there is a case mismatch
       if (this.name !== text) {// # if there is a case mismatch

           //log.error "#{actualNode? actualNode.positionText():.positionText()} CASE MISMATCH: '#{text}'/'#{.name}'"
           log.error("" + (actualNode ? actualNode.positionText() : this.positionText()) + " CASE MISMATCH: '" + (text) + "'/'" + (this.name) + "'");
           //log.error .originalDeclarationPosition() #add original declaration line info
           log.error(this.originalDeclarationPosition());// #add original declaration line info
           //return true
           return true;
       };
    };


    //helper method addMember(nameDecl:NameDeclaration, options, nodeDeclared)
    NameDeclaration.prototype.addMember = function(nameDecl, options, nodeDeclared){
//Adds passed NameDeclaration to .members[].
//Reports duplicated.
//returns: Identifier

//        declare valid options.replaceSameName

//        declare dest:NameDeclaration
//        declare found:NameDeclaration

       //if not (nameDecl instanceof NameDeclaration)
       if (!((nameDecl instanceof NameDeclaration))) {
         nameDecl = new NameDeclaration(nameDecl, options, nodeDeclared || this.nodeDeclared);
       };
          //fail with "not nameDecl instanceof NameDeclaration"

       //if no options
       if (!options) {
         options = {};
       };

       //debug "addMember: '#{nameDecl.name}' to '#{.name}'" #[#{.constructor.name}] name:
       debug("addMember: '" + (nameDecl.name) + "' to '" + (this.name) + "'");// #[#{.constructor.name}] name:

       var dest = this;
       //if no .members
       if (!this.members) {
         //fail with "no .members in [#{.constructor.name}]"
         throw new Error("no .members in [" + (this.constructor.name) + "]");
       };

       var normalized = normalizePropName(nameDecl.name);

       //if dest.members.hasOwnProperty(normalized)
       if (dest.members.hasOwnProperty(normalized)) {
         var found = dest.members[normalized];
       };

       //if not found
       if (!(found)) {
         dest.members[normalized] = nameDecl;
         nameDecl.parent = dest;
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

           dest.members[normalized] = nameDecl;
       }
       else if (found.isForward) {
           //found.replaceForward nameDecl
           found.replaceForward(nameDecl);
           //return found
           return found;
       }
       else {
           //log.error "#{nameDecl.positionText()}. DUPLICATED property name: '#{nameDecl.name}'"
           log.error("" + (nameDecl.positionText()) + ". DUPLICATED property name: '" + (nameDecl.name) + "'");
           //log.error found.originalDeclarationPosition() #add extra information line
           log.error(found.originalDeclarationPosition());// #add extra information line
           //if no nameDecl.nodeDeclared, console.trace
           if (!nameDecl.nodeDeclared) {
               console.trace()};
       };

       //return nameDecl
       return nameDecl;
    };


    //helper method toString()
    NameDeclaration.prototype.toString = function(){
//        #note: parent may point to a different node than the original declaration, if makePointTo() was used
       //return .name
       return this.name;
    };

    //helper method composedName()
    NameDeclaration.prototype.composedName = function(){
       var name = this.name;
       //if .parent and .parent.name isnt "Project Root Scope"
       if (this.parent && this.parent.name !== "Project Root Scope") {
         name = this.parent.name + '.' + name;
       };
       //return name
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
                 type = "" + (nameDecltype.parent.name) + "." + (type);
             };
             //end if
             
         };
       }
       else {
         type = 'Object';
       };

       //return "'#{.composedName()}:#{type}'"
       return "'" + (this.composedName()) + ":" + (type) + "'";
    };
   exports.NameDeclaration = NameDeclaration;
   //end class NameDeclaration


//#Module helper functions

   //helper function fixSpecialNames(text:string)
   function fixSpecialNames(text){

     //if text in ['__proto__','NaN','Infinity','undefined','null','false','true'] # not good names
     if (['__proto__', 'NaN', 'Infinity', 'undefined', 'null', 'false', 'true'].indexOf(text)>=0) {// # not good names
       //return '|'+text+'|'
       return '|' + text + '|';
     }
     else {
       //return text
       return text;
     };
   };

   //helper function normalizePropName(text:string) returns string
   function normalizePropName(text){

//we do not allow two names differing only in upper/lower case letters

     //if text[0] is "'" or text[0] is '"' #Except for quoted names
     if (text[0] === "'" || text[0] === '"') {// #Except for quoted names
         //return text
         return text;
     };

     //return fixSpecialNames(text.toLowerCase())
     return fixSpecialNames(text.toLowerCase());
   };


//include module helper functions: "normalizePropName" and "fixSpecialNames"
//as properties of namespace/class NameDeclaration

   //append to namespace NameDeclaration
   
//      properties
//        normalizePropName = normalizePropName
//        fixSpecialNames = fixSpecialNames
     NameDeclaration.normalizePropName=normalizePropName;
     NameDeclaration.fixSpecialNames=fixSpecialNames;
     

//##Exports is namespace/class NameDeclaration

   module.exports = NameDeclaration;
