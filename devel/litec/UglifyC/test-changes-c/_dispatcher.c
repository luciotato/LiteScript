#include "_dispatcher.h"
// methods
static str _ADD_VERBS[] = { //string name for each distinct method name
    "isDirectory"
,     "isFile"
,     "clone"
,     "to_array"
,     "add"
,     "initialize"
,     "getValue"
,     "_visit"
,     "parent"
,     "self"
,     "find_parent"
,     "has_directive"
,     "in_boolean_context"
,     "loopcontrol_target"
};
// propery names
static str _ADD_THINGS[] = { //string name for each distinct property name
    "mtime"
,     "mode"
,     "line"
,     "col"
,     "pos"
,     "strict"
,     "filename"
,     "toplevel"
,     "expression"
,     "html5_comments"
,     "file"
,     "comments_before"
,     "nlb"
,     "endpos"
,     "type"
,     "start"
,     "scope"
,     "body"
,     "label"
,     "condition"
,     "step"
,     "init"
,     "object"
,     "cname"
,     "enclosed"
,     "parent_scope"
,     "uses_eval"
,     "uses_with"
,     "functions"
,     "variables"
,     "directives"
,     "globals"
,     "uses_arguments"
,     "argnames"
,     "alternative"
,     "bfinally"
,     "bcatch"
,     "argname"
,     "definitions"
,     "args"
,     "cdr"
,     "car"
,     "prop"
,     "operator"
,     "right"
,     "left"
,     "consequent"
,     "elements"
,     "props"
,     "thedef"
,     "references"
,     "visit"
};



//-------------------------------
int main(int argc, char** argv) {
    LiteC_init( 91, argc,argv);
    LiteC_addMethodSymbols( 14, _ADD_VERBS);
    LiteC_addPropSymbols( 52, _ADD_THINGS);
    fs__moduleInit();
    TestOut__moduleInit();
    mkPath__moduleInit();
    path__moduleInit();
    ParserWithIterable__moduleInit();
    Utils__moduleInit();
    AST__moduleInit();


    Test3__moduleInit();


    LiteC_finish();
} //end main
