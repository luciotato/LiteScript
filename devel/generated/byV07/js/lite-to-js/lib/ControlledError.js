//Compiled by LiteScript compiler v0.7.9, source: /home/ltato/LiteScript/devel/source/v0.8/lib/ControlledError.md

   // class ControlledError extends Error
   // constructor
   function ControlledError(msg){// default constructor: call super.constructor
       Error.prototype.constructor.apply(this,arguments)
        // properties
            // soft: boolean
            // declare valid Error.apply
            // declare valid this.__proto__.__proto__
           this.__proto__.__proto__ = Error.apply(null, Array.prototype.slice.call(arguments));
       };
   // ControlledError (extends|proto is) Error
   ControlledError.prototype.__proto__ = Error.prototype;
   
   // end class ControlledError

// Note: we're setting the class.prototype.__proto__

// There will be only one instance of ControlledError with useful info.


        //endif

module.exports=ControlledError;
//# sourceMappingURL=ControlledError.js.map