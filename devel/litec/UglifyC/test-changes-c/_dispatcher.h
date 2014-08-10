#ifndef _DISPATCHER_C__H
#define _DISPATCHER_C__H
#include "LiteC-core.h"
// core support and defined classes init
extern void __declareClasses();
// methods
enum _VERBS { //a symbol for each distinct method name
    isDirectory_ = -_CORE_METHODS_MAX-14,
    isFile_,
    clone_,
    to_array_,
    add_,
    initialize_,
    getValue_,
    _visit_,
    parent_,
    self_,
    find_parent_,
    has_directive_,
    in_boolean_context_,
    loopcontrol_target_,
_LAST_VERB};
// propery names
enum _THINGS { //a symbol for each distinct property name
    mtime_= _CORE_PROPS_LENGTH,
    mode_,
    line_,
    col_,
    pos_,
    strict_,
    filename_,
    toplevel_,
    expression_,
    html5_comments_,
    file_,
    comments_before_,
    nlb_,
    endpos_,
    type_,
    start_,
    scope_,
    body_,
    label_,
    condition_,
    step_,
    init_,
    object_,
    cname_,
    enclosed_,
    parent_scope_,
    uses_eval_,
    uses_with_,
    functions_,
    variables_,
    directives_,
    globals_,
    uses_arguments_,
    argnames_,
    alternative_,
    bfinally_,
    bcatch_,
    argname_,
    definitions_,
    args_,
    cdr_,
    car_,
    prop_,
    operator_,
    right_,
    left_,
    consequent_,
    elements_,
    props_,
    thedef_,
    references_,
    visit_,
_LAST_THING};
#include "Test3.h"
#include "C_standalone/fs.h"
#include "TestOut.h"
#include "mkPath.h"
#include "C_standalone/path.h"
#include "ParserWithIterable.h"
#include "Utils.h"
#include "AST.h"
#endif
