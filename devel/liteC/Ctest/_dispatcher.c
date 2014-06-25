#include "_dispatcher.h"
void __init_core_support(int argc, char** argv){
    LiteC_registerCoreClasses(argc,argv);
    __registerClass(LiteC_Options_TYPEID,"LiteC_Options", UNDEFINED, LiteC_Options__init, sizeof(struct LiteC_Options_s));
    __registerClass(path_TYPEID,"path", UNDEFINED, path__init, sizeof(struct path_s));
    __registerClass(fs_TYPEID,"fs", UNDEFINED, fs__init, sizeof(struct fs_s));
    __registerClass(Stat_TYPEID,"Stat", UNDEFINED, Stat__init, sizeof(struct Stat_s));
    __registerClass(LogOptions_TYPEID,"LogOptions", UNDEFINED, LogOptions__init, sizeof(struct LogOptions_s));
    __registerClass(LogOptionsDebug_TYPEID,"LogOptionsDebug", UNDEFINED, LogOptionsDebug__init, sizeof(struct LogOptionsDebug_s));
    __registerClass(log_TYPEID,"log", UNDEFINED, log__init, sizeof(struct log_s));
    __registerClass(color_TYPEID,"color", UNDEFINED, color__init, sizeof(struct color_s));
    __registerClass(OptionsParser_TYPEID,"OptionsParser", UNDEFINED, OptionsParser__init, sizeof(struct OptionsParser_s));
    path__init_singleton();
    fs__init_singleton();
    log__init_singleton();
    color__init_singleton();
};
// method dispatchers
any _toString(any this, len_t argc, any* arguments){
    switch(this.type){
      case LiteC_Options_TYPEID:
         return LiteC_Options_toString(this,argc,arguments);
      default:
         return _default_toString(this,argc,arguments);
    };
};
any _join(any this, len_t argc, any* arguments){
    switch(this.type){
      case path_TYPEID:
         return path_join(this,argc,arguments);
      case Array_TYPEID:
         return Array_join(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"join"));
    };
};
any _resolve(any this, len_t argc, any* arguments){
    switch(this.type){
      case path_TYPEID:
         return path_resolve(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"resolve"));
    };
};
any _dirname(any this, len_t argc, any* arguments){
    switch(this.type){
      case path_TYPEID:
         return path_dirname(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"dirname"));
    };
};
any _extname(any this, len_t argc, any* arguments){
    switch(this.type){
      case path_TYPEID:
         return path_extname(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"extname"));
    };
};
any _basename(any this, len_t argc, any* arguments){
    switch(this.type){
      case path_TYPEID:
         return path_basename(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"basename"));
    };
};
any _existsSync(any this, len_t argc, any* arguments){
    switch(this.type){
      case fs_TYPEID:
         return fs_existsSync(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"existsSync"));
    };
};
any _readFileSync(any this, len_t argc, any* arguments){
    switch(this.type){
      case fs_TYPEID:
         return fs_readFileSync(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"readFileSync"));
    };
};
any _writeFileSync(any this, len_t argc, any* arguments){
    switch(this.type){
      case fs_TYPEID:
         return fs_writeFileSync(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"writeFileSync"));
    };
};
any _throwTextErr(any this, len_t argc, any* arguments){
    switch(this.type){
      case fs_TYPEID:
         return fs_throwTextErr(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"throwTextErr"));
    };
};
any _debug(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_debug(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"debug"));
    };
};
any _debugClear(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_debugClear(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"debugClear"));
    };
};
any _error_(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_error_(this,argc,arguments);
      case console_TYPEID:
         return console_error_(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"error_"));
    };
};
any _warning(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_warning(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"warning"));
    };
};
any _message(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_message(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"message"));
    };
};
any _info(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_info(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"info"));
    };
};
any _extra(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_extra(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"extra"));
    };
};
any _getMessages(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_getMessages(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"getMessages"));
    };
};
any _throwControled(any this, len_t argc, any* arguments){
    switch(this.type){
      case log_TYPEID:
         return log_throwControled(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"throwControled"));
    };
};
any _option(any this, len_t argc, any* arguments){
    switch(this.type){
      case OptionsParser_TYPEID:
         return OptionsParser_option(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"option"));
    };
};
any _value(any this, len_t argc, any* arguments){
    switch(this.type){
      case OptionsParser_TYPEID:
         return OptionsParser_value(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"value"));
    };
};
any _getPos(any this, len_t argc, any* arguments){
    switch(this.type){
      case OptionsParser_TYPEID:
         return OptionsParser_getPos(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"getPos"));
    };
};
any _search(any this, len_t argc, any* arguments){
    switch(this.type){
      case OptionsParser_TYPEID:
         return OptionsParser_search(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"search"));
    };
};
any _slice(any this, len_t argc, any* arguments){
    switch(this.type){
      case String_TYPEID:
         return String_slice(this,argc,arguments);
      case Array_TYPEID:
         return Array_slice(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"slice"));
    };
};
any _split(any this, len_t argc, any* arguments){
    switch(this.type){
      case String_TYPEID:
         return String_split(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"split"));
    };
};
any _indexOf(any this, len_t argc, any* arguments){
    switch(this.type){
      case String_TYPEID:
         return String_indexOf(this,argc,arguments);
      case Array_TYPEID:
         return Array_indexOf(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"indexOf"));
    };
};
any _lastIndexOf(any this, len_t argc, any* arguments){
    switch(this.type){
      case String_TYPEID:
         return String_lastIndexOf(this,argc,arguments);
      case Array_TYPEID:
         return Array_lastIndexOf(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"lastIndexOf"));
    };
};
any _concat(any this, len_t argc, any* arguments){
    switch(this.type){
      case String_TYPEID:
         return String_concat(this,argc,arguments);
      case Array_TYPEID:
         return Array_concat(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"concat"));
    };
};
any _splice(any this, len_t argc, any* arguments){
    switch(this.type){
      case Array_TYPEID:
         return Array_splice(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"splice"));
    };
};
any _push(any this, len_t argc, any* arguments){
    switch(this.type){
      case Array_TYPEID:
         return Array_push(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"push"));
    };
};
any _unshift(any this, len_t argc, any* arguments){
    switch(this.type){
      case Array_TYPEID:
         return Array_unshift(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"unshift"));
    };
};
any _pop(any this, len_t argc, any* arguments){
    switch(this.type){
      case Array_TYPEID:
         return Array_pop(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"pop"));
    };
};
any _get(any this, len_t argc, any* arguments){
    switch(this.type){
      case Map_TYPEID:
         return Map_get(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"get"));
    };
};
any _has(any this, len_t argc, any* arguments){
    switch(this.type){
      case Map_TYPEID:
         return Map_has(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"has"));
    };
};
any _set(any this, len_t argc, any* arguments){
    switch(this.type){
      case Map_TYPEID:
         return Map_set(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"set"));
    };
};
any _clear(any this, len_t argc, any* arguments){
    switch(this.type){
      case Map_TYPEID:
         return Map_clear(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"clear"));
    };
};
any _delete(any this, len_t argc, any* arguments){
    switch(this.type){
      case Map_TYPEID:
         return Map_delete(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"delete"));
    };
};
any _log_(any this, len_t argc, any* arguments){
    switch(this.type){
      case console_TYPEID:
         return console_log_(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"log_"));
    };
};
any _exit_(any this, len_t argc, any* arguments){
    switch(this.type){
      case process_TYPEID:
         return process_exit_(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"exit_"));
    };
};
any _cwd(any this, len_t argc, any* arguments){
    switch(this.type){
      case process_TYPEID:
         return process_cwd(this,argc,arguments);
      default:
         throw(_noMethod(this.type,"cwd"));
    };
};