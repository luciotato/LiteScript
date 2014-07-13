//Compiled by LiteScript compiler v0.7.0, source: /home/ltato/LiteScript/devel/source-v0.8/lib/StringShims.md
// # String namespace helpers

// Helper methods added to String.prototype or String namespace
// also add 'remove' to Array

// ## Additions (to the prototype)

   // append to class String

       // shim method startsWith(text:string)
       if (!String.prototype.startsWith)
       String.prototype.startsWith = function(text){
           return this.slice(0, text.length) === text;
       };

       // shim method endsWith(text:string)
       if (!String.prototype.endsWith)
       String.prototype.endsWith = function(text){
           return this.slice(-text.length) === text;
       };

// .capitalized

       // method capitalized returns string
       String.prototype.capitalized = function(){
          // if this, return this.charAt(0).toUpperCase()+this.slice(1)
          if (this) {return this.charAt(0).toUpperCase() + this.slice(1);};
       };

// .replaceAll, equiv. to .replace(/./g, newStr)

       // shim method replaceAll(searched,newStr)
       if (!String.prototype.replaceAll)
       String.prototype.replaceAll = function(searched, newStr){
          return this.replace(new RegExp(searched, "g"), newStr);
       };

// .quoted(quotechar)

       // method quoted(quoteChar)
       String.prototype.quoted = function(quoteChar){
           return quoteChar + this + quoteChar;
       };

// .repeat(howMany)

       // shim method repeat(howMany)
       if (!String.prototype.repeat)
       String.prototype.repeat = function(howMany){
           // if howMany<=0, return
           if (howMany <= 0) {return;};
           var a = [];
           a[howMany] = "";
           return a.join(this);
       };

       // shim method rpad(howMany)
       if (!String.prototype.rpad)
       String.prototype.rpad = function(howMany){
           return this.concat(String.spaces(howMany - this.length));
       };


   // append to class Array

// method remove(element)

       // method remove(element)  [not enumerable, not writable, configurable]
       Object.defineProperty(
       Array.prototype,'remove',{value:function(element){

           // if this.indexOf(element) into var inx >= 0
           var inx=undefined;
           if ((inx=this.indexOf(element)) >= 0) {
                return this.splice(inx, 1);
           };
       }
       ,enumerable:false
       ,writable:false
       ,configurable:true
       });

       // end method
       

        //property last [not enumerable]
        //    get: function
        //        return .length-1

