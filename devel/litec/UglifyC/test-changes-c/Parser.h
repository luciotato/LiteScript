#ifndef PARSER_C__H
#define PARSER_C__H
#include "_dispatcher.h"
//-------------------------
//Module Parser
//-------------------------
extern void Parser__moduleInit(void);
    //-------------------------
    // namespace Parser_UNICODE
    //-------------------------
        extern var Parser_UNICODE_letter;
        extern var Parser_UNICODE_non_spacing_mark;
        extern var Parser_UNICODE_space_combining_mark;
        extern var Parser_UNICODE_connector_punctuation;
    

//--------------
    // Parser_JS_Parse_Error
    any Parser_JS_Parse_Error; //Class Parser_JS_Parse_Error extends Error
    
    typedef struct Parser_JS_Parse_Error_s * Parser_JS_Parse_Error_ptr;
    typedef struct Parser_JS_Parse_Error_s {
        //Error
        any name;
        any message;
        any stack;
        any code;
        //JS_Parse_Error
        any line;
        any col;
        any pos;
    
    } Parser_JS_Parse_Error_s;
    
    extern void Parser_JS_Parse_Error__init(DEFAULT_ARGUMENTS);
    extern any Parser_JS_Parse_Error_newFromObject(DEFAULT_ARGUMENTS);
    extern any Parser_JS_Parse_Error_toString(DEFAULT_ARGUMENTS);
    //-------------------------
    // namespace Parser_TKZ
    //-------------------------
        extern var Parser_TKZ_text;
        extern var Parser_TKZ_filename;
        extern var Parser_TKZ_textLen;
        extern var Parser_TKZ_pos;
        extern var Parser_TKZ_tokpos;
        extern var Parser_TKZ_line;
        extern var Parser_TKZ_tokline;
        extern var Parser_TKZ_col;
        extern var Parser_TKZ_tokcol;
        extern var Parser_TKZ_newline_before;
        extern var Parser_TKZ_regex_allowed;
        extern var Parser_TKZ_comments_before;
        extern var Parser_TKZ_html5_comments;
        extern var Parser_TKZ_prev_was_dot;
        extern any Parser_TKZ_tokenize(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_next(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_peek(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_forward(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_looking_at(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_findByteIndex(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_start_token(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_token(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_whitespace(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_parse_error(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_num(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_escaped_char(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_hex_bytes(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_string(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_line_comment(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_multiline_comment(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_name(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_regexp(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_operator(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_handle_slash(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_handle_dot(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_word(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_next_token(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_tokenize(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_next(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_peek(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_forward(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_looking_at(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_findByteIndex(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_start_token(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_token(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_whitespace(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_parse_error(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_num(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_escaped_char(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_hex_bytes(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_string(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_line_comment(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_skip_multiline_comment(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_name(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_regexp(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_operator(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_handle_slash(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_handle_dot(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_read_word(DEFAULT_ARGUMENTS);
        extern any Parser_TKZ_next_token(DEFAULT_ARGUMENTS);
    

//--------------
    // Parser_PRSOptions
    any Parser_PRSOptions; //Class Parser_PRSOptions
    typedef struct Parser_PRSOptions_s * Parser_PRSOptions_ptr;
    typedef struct Parser_PRSOptions_s {
        //PRSOptions
        any strict;
        any filename;
        any toplevel;
        any expression;
        any html5_comments;
    
    } Parser_PRSOptions_s;
    
    extern void Parser_PRSOptions__init(DEFAULT_ARGUMENTS);
    extern any Parser_PRSOptions_newFromObject(DEFAULT_ARGUMENTS);
    //-------------------------
    // namespace Parser_PRS
    //-------------------------
        extern var Parser_PRS_input;
        extern var Parser_PRS_token;
        extern var Parser_PRS_prev;
        extern var Parser_PRS_peeked;
        extern var Parser_PRS_in_function;
        extern var Parser_PRS_in_directives;
        extern var Parser_PRS_in_loop;
        extern var Parser_PRS_labels;
        extern var Parser_PRS_options;
        extern any Parser_PRS_parse(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_isToken(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_peek(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_next(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_getPrev(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_croak(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_token_error(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_unexpected(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expect_token(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expect(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_can_insert_semicolon(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_semicolon(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_parenthesised(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_handle_regexp(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_embed_tokens(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_statement_parser_fn(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_labeled_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_simple_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_break_cont(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_for_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_regular_for(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_for_in(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_function_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_if_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_block_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_switch_body_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_try_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_vardefs(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_var_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_const_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_new_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_atom_node(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_atom(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_list(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_array_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_array_parser(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_object_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_object_parser(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_property_name(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_name(DEFAULT_ARGUMENTS);
        extern any Parser_PRS__make_symbol(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_symbol(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_subscripts(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_unary(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_make_unary(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_op(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_ops(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_conditional(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_is_assignable(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_assign(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expression(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_in_loop_call(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_parse(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_isToken(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_peek(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_next(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_getPrev(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_croak(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_token_error(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_unexpected(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expect_token(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expect(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_can_insert_semicolon(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_semicolon(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_parenthesised(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_handle_regexp(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_embed_tokens(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_statement_parser_fn(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_labeled_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_simple_statement(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_break_cont(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_for_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_regular_for(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_for_in(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_function_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_if_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_block_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_switch_body_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_try_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_vardefs(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_var_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_const_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_new_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_atom_node(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_atom(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_list(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_array_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_array_parser(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_object_(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_object_parser(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_property_name(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_name(DEFAULT_ARGUMENTS);
        extern any Parser_PRS__make_symbol(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_as_symbol(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_subscripts(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_unary(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_make_unary(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_op(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expr_ops(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_conditional(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_is_assignable(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_maybe_assign(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_expression(DEFAULT_ARGUMENTS);
        extern any Parser_PRS_in_loop_call(DEFAULT_ARGUMENTS);
#endif
