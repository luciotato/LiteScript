// -----------
// Module Init
// -----------

    //var mainOut = new Output
    var mainOut = new Output();
    //var foundClasses = [] //clear
    var foundClasses = [];

    //var indent=0
    var indent = 0;

//##Main

    //function main
    // ---------------------------
    function main(){

        //var name = process.argv[2]
        var name = process.argv[2];

        //if no name
        if (!name) {
        
            //print "                usage: mkInterface name [-noreq]\n\n                where \"name\" is the name of the module to \"require()\"\n\n                if -noreq, no module is required, \"name\" is assumed a global object, e.g.: process\n\n                a .interface.md file will be generated for the loaded module\n"
            console.log("                usage: mkInterface name [-noreq]\n\n                where \"name\" is the name of the module to \"require()\"\n\n                if -noreq, no module is required, \"name\" is assumed a global object, e.g.: process\n\n                a .interface.md file will be generated for the loaded module\n");
            //process.exit 1
            process.exit(1);
        };

        //var requiredModule
        var requiredModule = undefined;
        //if process.argv[3] is '-noreq'
        if (process.argv[3] === '-noreq') {
        
            //requiredModule = global[name]
            requiredModule = global[name];
        }
        //if process.argv[3] is '-noreq'
        
        else {
            //requiredModule = require(name)
            requiredModule = require(name);
        };

        //var mainNameDecl = new NameDeclaration(name, requiredModule)
        var mainNameDecl = new NameDeclaration(name, requiredModule);

        //mainNameDecl.processMain mainOut
        mainNameDecl.processMain(mainOut);

        //mainOut.printAll
        mainOut.printAll();
    };


    //    class Output
    // constructor
    function Output(initializer){ // default constructor
        //properties

            //text: string array = []
            //indentSpace = '    '
            //headers: string array = []
            //pendingHeaders
            this.text=[];
            this.indentSpace='    ';
            this.headers=[];
        for(prop in initializer) if (initializer.hasOwnProperty(prop)) this[prop]=initializer[prop];};
        // ---------------------------
        Output.prototype.indent = function(){
            //.indentSpace += '    '
            this.indentSpace += '    ';
        }// ---------------------------
        Output.prototype.deindent = function(){
            //.indentSpace = .indentSpace.slice(4)
            this.indentSpace = this.indentSpace.slice(4);
        }// ---------------------------
        Output.prototype.setHeader = function(s){
            //.headers.push .indentSpace + s
            this.headers.push(this.indentSpace + s);
            //.pendingHeaders = .headers.length
            this.pendingHeaders = this.headers.length;
        }// ---------------------------
        Output.prototype.clearHeader = function(){
            //.headers.pop
            this.headers.pop();
            //.pendingHeaders = .headers.length
            this.pendingHeaders = this.headers.length;
        }// ---------------------------
        Output.prototype.push = function(s){

            //if s
            if (s) {
            
                //for inx=0 while inx<.pendingHeaders
                for( var inx=0; inx < this.pendingHeaders; inx++) {
                    //if .headers[inx], .text.push .headers[inx]
                    if (this.headers[inx]) {this.text.push(this.headers[inx])};
                    //.headers[inx]=undefined
                    this.headers[inx] = undefined;
                };// end for inx
                //end for
                //.pendingHeaders=0
                
                //.pendingHeaders=0
                this.pendingHeaders = 0;
            };

            //.text.push .indentSpace + s
            this.text.push(this.indentSpace + s);
        }// ---------------------------
        Output.prototype.printAll = function(){

            //for each string in .text
            for( var string__inx=0,string ; string__inx<this.text.length ; string__inx++){string=this.text[string__inx];
            
                //print string
                console.log(string);
            };// end for each in this.text
            
        }
    // end class Output



    //    class NameDeclaration
    // constructor
    function NameDeclaration(name, obj, parent){
        //properties
            //parent: NameDeclaration
            //name
            //type
            //params: string
            //members: map string to NameDeclaration
            //pointer
            //.name = name
            this.name = name;
            //.pointer = obj
            this.pointer = obj;
            //.parent = parent
            this.parent = parent;
            //.members = new Map
            this.members = new Map();

            //.type = typeof obj
            this.type = typeof obj;

            //if .type is 'function'
            if (this.type === 'function') {
            
                //var source= obj.toString()
                var source = obj.toString();
                //.params = source.slice(source.indexOf('('),source.indexOf('{'))
                this.params = source.slice(source.indexOf('('), source.indexOf('{'));
                //if .params.trim() is "()", .params = ""
                if (this.params.trim() === "()") {this.params = ""};
            };

            //declare valid obj.prototype
            
            //if .type is 'function' and obj.prototype and Object.getOwnPropertyNames(obj.prototype).length>4
            if (this.type === 'function' && obj.prototype && Object.getOwnPropertyNames(obj.prototype).length > 4) {
            
                //.type='class'
                this.type = 'class';
                //for each nameDecl in foundClasses
                for( var nameDecl__inx=0,nameDecl ; nameDecl__inx<foundClasses.length ; nameDecl__inx++){nameDecl=foundClasses[nameDecl__inx];
                
                    //if nameDecl.name is this.name, return #do not duplicate
                    if (nameDecl.name === this.name) {return};
                };// end for each in foundClasses
                //foundClasses.push this
                foundClasses.push(this);
            };
        };
        // ---------------------------
        NameDeclaration.prototype.processMain = function(out, comment){

                //.getMembersFromObjProperties
                this.getMembersFromObjProperties();

                //if .type isnt 'class'
                if (this.type !== 'class') {
                
                    //out.indentSpace = '    '
                    out.indentSpace = '    ';
                    //out.push ""
                    out.push("");
                    //out.push 'namespace '+.toString()
                    out.push('namespace ' + this.toString());
                    //.pushMethodsAndProperties out
                    this.pushMethodsAndProperties(out);
                };

                //while found classes
                //while foundClasses.length
                while(foundClasses.length){
                    //var nameDecl = foundClasses[0]
                    var nameDecl = foundClasses[0];
                    //nameDecl.processClass out
                    nameDecl.processClass(out);
                    //foundClasses.shift
                    foundClasses.shift();
                };// end loop
                
        }// ---------------------------
        NameDeclaration.prototype.processClass = function(out, comment){

                //.getMembersFromObjProperties
                this.getMembersFromObjProperties();

                //out.indentSpace = '    '
                out.indentSpace = '    ';
                //out.push ""
                out.push("");
                //out.push ""
                out.push("");
                //out.push 'public '+.type+' '+.name
                out.push('public ' + this.type + ' ' + this.name);

                // constructor
                //if .params
                if (this.params) {
                
                    //out.indent
                    out.indent();
                    //out.push 'constructor new '+.name+' '+.params
                    out.push('constructor new ' + this.name + ' ' + this.params);
                    //out.deindent
                    out.deindent();
                };

                // out props from prototype
                //var ptrNameDecl = .members.get("_prototype")
                var ptrNameDecl = this.members.get("_prototype");
                //if ptrNameDecl, ptrNameDecl.pushMethodsAndProperties out
                if (ptrNameDecl) {ptrNameDecl.pushMethodsAndProperties(out)};

                //now as namespace
                //.processAppendToNamespace out
                this.processAppendToNamespace(out);
        }// ---------------------------
        NameDeclaration.prototype.processAppendToNamespace = function(out){

                //out.indentSpace = '    '
                out.indentSpace = '    ';
                //out.setHeader ""
                out.setHeader("");
                //out.setHeader 'append to namespace '+.name
                out.setHeader('append to namespace ' + this.name);
                //.pushMethodsAndProperties out
                this.pushMethodsAndProperties(out);
                //out.clearHeader
                out.clearHeader();
                //out.clearHeader
                out.clearHeader();
        }// ---------------------------
        NameDeclaration.prototype.pushMethodsAndProperties = function(out, comment){

                //properties
                //out.indent
                out.indent();
                //out.setHeader 'properties'
                out.setHeader('properties');
                //out.indent
                out.indent();
                //for each key,nameDecl in map .members
                var nameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict){nameDecl=this.members.dict[key];
                if(nameDecl.type !== 'function' && nameDecl.type !== 'class' && nameDecl.name !== 'prototype'){

                        //nameDecl.pushMembers out
                        nameDecl.pushMembers(out);
                        }
                        
                        }// end for each property
                        //out.push indent+'#{protoypeMember.name}:#{protoypeMember.type}'

                //out.clearHeader
                out.clearHeader();
                //out.deindent
                out.deindent();

                //out.setHeader ""
                //out.setHeader "//methods"
                //out.setHeader ""
                out.setHeader("");

                //for each key,methodNameDecl in map .members
                var methodNameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict){methodNameDecl=this.members.dict[key];
                if(methodNameDecl.type === 'function'){
                        //out.push "method #{methodNameDecl.name}#{methodNameDecl.params or ''}"
                        out.push("method " + methodNameDecl.name + (methodNameDecl.params || ''));
                        }
                        
                        }// end for each property

                //out.clearHeader
                out.clearHeader();
                //out.clearHeader
                //out.clearHeader
                //out.push ""

                //out.deindent
                out.deindent();
        }// ---------------------------
        NameDeclaration.prototype.pushMembers = function(out){

//recursively writes a object declaration

            //if .name not like /^[a-zA-Z0-9$_]+$/, return # exclude strange/private names
            if (!(/^[a-zA-Z0-9$_]+$/.test(this.name))) {return};

            //if .type is 'object' and .members
            if (this.type === 'object' && this.members) {
            

                //out.setHeader '#{.name}:'
                out.setHeader('' + this.name + ':');
                //for each key,nameDecl in map .members
                var nameDecl=undefined;
                if(!this.members.dict) throw(new Error("for each in map: not a Map, no .dict property"));
                for ( var key in this.members.dict){nameDecl=this.members.dict[key];
                    {
                    //out.indent
                    out.indent();
                    //nameDecl.pushMembers out
                    nameDecl.pushMembers(out);
                    //out.deindent
                    out.deindent();
                    }
                    
                    }// end for each property
                //out.clearHeader
                out.clearHeader();
            }
            //if .type is 'object' and .members
            
            else if (this.type === 'class') {
            
                //do nothing
                null;
            }
            //else if .type is 'class'
            
            else {
                //if .pointer and typeof .pointer is "string"
                if (this.pointer && typeof this.pointer === "string") {
                
                    //out.push '#{.name}="#{.pointer}"'
                    out.push('' + this.name + '="' + this.pointer + '"');
                }
                //if .pointer and typeof .pointer is "string"
                
                else {
                    //out.push '#{.name}:#{.type}#{.params or ""}'
                    out.push('' + this.name + ':' + this.type + (this.params || ""));
                };
            };

            //end if


//----

        //helper method getMembersFromObjProperties() returns array #Recursive
            
        }// ---------------------------
        NameDeclaration.prototype.getMembersFromObjProperties = function(){

//Recursively converts a obj properties in NameDeclarations.
//it's used when a pure.js module is imported by 'require'
//to convert required 'exports' to LiteScript compiler usable NameDeclarations
//Also to load the global scope with built-in objects

            //if .pointer isnt instance of Object, return //or obj is Object.prototype
            if (!(this.pointer instanceof Object)) {return};

            //if no .members, .members = new Map
            if (!this.members) {this.members = new Map()};

            //if .pointer instanceof Array
            //    .type="Array"
            //    return

            //var list:array =  Object.getOwnPropertyNames(.pointer)
            var list = Object.getOwnPropertyNames(this.pointer);
            //##print " ".repeat(indent*4),.name,'has',list.length,'properties'

            //for each prop:string in list #even not enumerables
            for( var prop__inx=0,prop ; prop__inx<list.length ; prop__inx++){prop=list[prop__inx];
              if(prop.charAt(0) !== '_' && prop !== 'super_' && prop !== 'constructor' && !((typeof this.pointer === 'function' && ['caller', 'arguments', 'length', 'name'].indexOf(prop)>=0))){

                    //var value = .pointer[prop]
                    var value = this.pointer[prop];

                    //create
                    //##print " ".repeat(indent*4),"#{.name}.#{prop}"
                    //var newMember = new NameDeclaration(prop,value,this)
                    var newMember = new NameDeclaration(prop, value, this);

                    //print newMember.toString()
                    //if no .members, .members = new Map
                    if (!this.members) {this.members = new Map()};
                    //.members.set NameDeclaration.normalize(prop), newMember
                    this.members.set(NameDeclaration.normalize(prop), newMember);

                    //if newMember.type isnt 'function' and  .name isnt prop
                    if (newMember.type !== 'function' && this.name !== prop) {
                    

                        //if value instanceof Object
                        if (value instanceof Object && !(this.isInParents(value)) && this.countDepth() < 2) {
                        

                            //##print 'entering',prop
                            //indent++
                            indent++;
                            //newMember.getMembersFromObjProperties #recursive
                            newMember.getMembersFromObjProperties();
                            //indent--
                            indent--;
                        };
                    };
            }};// end for each in list
            
        }// ---------------------------
        NameDeclaration.prototype.countDepth = function(){
            //var result = 0
            var result = 0;
            //var nameDecl = this.parent
            var nameDecl = this.parent;
            //while nameDecl
            while(nameDecl){
              //result++
              result++;
              //nameDecl = nameDecl.parent
              nameDecl = nameDecl.parent;
            };// end loop
            //return result
            return result;
        }// ---------------------------
        NameDeclaration.prototype.isInParents = function(value){

//return true if a property name is in the parent chain.
//Used to avoid recursing circular properties

            //var nameDecl = this.parent
            var nameDecl = this.parent;
            //while nameDecl
            while(nameDecl){
              //if nameDecl.pointer is value,return true
              if (nameDecl.pointer === value) {return true};
              //nameDecl = nameDecl.parent
              nameDecl = nameDecl.parent;
            };// end loop
            
        }// ---------------------------
        NameDeclaration.prototype.toString = function(){

            //var result=.name
            var result = this.name;
            //var a=.parent
            var a = this.parent;
            //while a
            while(a){
                //result=a.name+'.'+result
                result = a.name + '.' + result;
                //a=a.parent
                a = a.parent;
            };// end loop

            //return "#{result}"
            return '' + result;
        }
    // end class NameDeclaration


    //Append to namespace NameDeclaration
    
        //method normalize(name)
        // ---------------------------
        NameDeclaration.normalize = function(name){
            //return "_"+name;
            return "_" + name;
        };



    //    helper class Map
    // constructor
    function Map(){
        //properties
            //dict:Object
            //size
            //.clear
            this.clear();
        };
        // ---------------------------
        Map.prototype.clear = function(){
            //.dict= new Object
            this.dict = new Object();
            //.size=0
            this.size = 0;
        }// ---------------------------
        Map.prototype.fromObject = function(object){
            //.dict = object
            this.dict = object;
            //.size = Object.keys(.dict).length
            this.size = Object.keys(this.dict).length;
            //return this
            return this;
        }// ---------------------------
        Map.prototype.set = function(key, value){
            //if no .dict.hasOwnProperty(key), .size++
            if (!this.dict.hasOwnProperty(key)) {this.size++};
            //.dict[key]=value
            this.dict[key] = value;
        }// ---------------------------
        Map.prototype.setProperty = function(name, value){
            //.dict[name] = value
            this.dict[name] = value;
        }// ---------------------------
        Map.prototype.delete = function(key){
            //if .dict.hasOwnProperty(key), .size--
            if (this.dict.hasOwnProperty(key)) {this.size--};
            //delete .dict[key]
            delete this.dict[key];
        }// ---------------------------
        Map.prototype.get = function(key){
            //return .dict[key]
            return this.dict[key];
        }// ---------------------------
        Map.prototype.tryGetProperty = function(key){
            //return .dict[key]
            return this.dict[key];
        }// ---------------------------
        Map.prototype.has = function(key){
            //return .dict has property key
            return key in this.dict;
        }// ---------------------------
        Map.prototype.hasProperty = function(key){
            //return .dict has property key
            return key in this.dict;
        }// ---------------------------
        Map.prototype.hasOwnProperty = function(key){
            //return .dict has property key
            return key in this.dict;
        }// ---------------------------
        Map.prototype.keys = function(){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        }// ---------------------------
        Map.prototype.allPropertyNames = function(){
            //return Object.keys(.dict)
            return Object.keys(this.dict);
        }// ---------------------------
        Map.prototype.forEach = function(callb){
            //for each property propName,value in .dict
            var value=undefined;
            for ( var propName in this.dict){value=this.dict[propName];
                {
                //callb(propName,value)
                callb(propName, value);
                }
                
                }// end for each property
            
        }
    // end class Map


    //    append to class String
    

        //shim method repeat(howMany)
        // ---------------------------
        if (!Object.prototype.hasOwnProperty.call(String.prototype,'repeat'))
        String.prototype.repeat = function(howMany){
            //var a =''
            var a = '';
            //if howMany<1, return a
            if (howMany < 1) {return a};
            //while howMany--
            while(howMany--){
                //a &= this
                a += this;
            };// end loop

            //return a
            return a;
        };
// -----------
// Module code
// -----------

    //main()
    main();
// end of module
