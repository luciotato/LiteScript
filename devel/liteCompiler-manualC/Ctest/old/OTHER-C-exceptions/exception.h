/* exception.h --- header implementing lightweight, but featured
                   exception handling.

Time-stamp: "2005-04-10 17:06:31 admp"

Copyright (C) 2003-5 Adomas P. <adomas.paltanavicius@gmail.com>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA. */

/* Summary.

To understand all this, you should be experienced in C, and also
know the setjmp interface.  (Unixers do.)

Implemented:
  1. TRY --- a catcher block.
  2. EXCEPT, EXPECT, CATCH --- a handler block.
  3. THROW --- throws an exception.
  4. ON --- a handler.

IMPORTANT:
  TRY without EXCEPT does not work properly.  This is impossible
  to fix, at least I don't see the way.  Anyway, if you don't
  want to break the whole system, I see no other need for
  such a construct.

Syntax:
  1. TRY
  The syntax is:
    try { statements; } except { handler blocks; }

  2. EXCEPT, EXPECT, CATCH
  The syntax is:
    except { handler blocks; }

  3. THROW
  The syntax is: 
    THROW (params)
  PARAMS depend on your local implementation.  By default, it is a
  number (int).
  
  4. ON
  The syntax is:
    on (params) { statements; }
  PARAMS are the same as for THROW.

Supports:
  1. Nested catcher blocks.
  2. Raising an exception outside catcher block (this results in an 
     unhandled exception.)
  3. Raising an exception in function called from catcher block.
  4. Different types for exception structures.
  5. Reporting file and line where exception was thrown/handled. */

/* Search for TODO and FIXME tags if you want to enchance this.
   (This would be nice.) */

/* TODO: since customized exceptions usually allocate memory
   dynamically, it would be nice to have support for freeing
   function, which would be called after it's not needed
   anymore: __EXC_FREE.  I. e. after exception is handled. */

#if !defined __EXCEPTION_H__
#define __EXCEPTION_H__

#include <setjmp.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

/* The default prefix is `__exc' for functions and `__EXC' for
   macros.  Underscores mean you shouldn't touch 'em! */



/* C syntax hacks.

   Oh, god, I felt like an inventor after writing these.
   Clearly, code

     for (start (), J = 1; J; end (), J = 0)
       code ();

   Does this:
   1) Executes START
   2) Executes CODE
   3) Executes END
   4) ...And terminates.

   It also works if nested (think why yourself.)
*/

/* Execute START, then block after the macro, and finally END. */

#define __EXC_BLOCK(start, end)              \
  for (start, __exc_block_pass = 1;          \
       __exc_block_pass;                     \
       end, __exc_block_pass = 0)

/* Likewise, but START block is empty. */

#define __EXC_END(end)                       \
  for (__exc_block_pass = 1;                 \
       __exc_block_pass;                     \
       end, __exc_block_pass = 0)



/* For function name.  GCC includes things which expand to
   the name of current function's name.  */

#if (!defined (__GNUC__) || __GNUC__ < 2 || \
     __GNUC_MINOR__ < (defined (__cplusplus) ? 6 : 4))
   /* Otherwise stick to unknown. */
#  define __EXC_FUNCTION               (char *) 0
#else
#  define __EXC_FUNCTION	       __PRETTY_FUNCTION__
#endif



/* The exception value. */

/* You'll want to make local changes to these.  For example, to use
   your own exception structure. */

/* Exception is by default an int.  Anyway, it can be anything from
   string to some structure.

   Whatever the implementation you choose, type name should be
   defined as __EXC_TYPE.  The THROW (and ON) macro accepts as
   many arguments, s it is given, so your function may use all
   the power of argument passing.  Define your function's name
   as __EXC_MAKE. Exceptions are compared in ON macro.  You
   should define comparing function as __EXC_EQ.

   For example, if you'd like to use strings in place of numbers,
   use this snippet:

   1) #define __EXC_TYPE         char *
   2) #define __EXC_EQ(s1, s2)   (strcasecmp (s1, s2) == 0)
   3) #define __EXC_PRINT(e, stream) \
	         fprintf (stream, "%s", e)

*/

#ifndef __EXC_TYPE
#  define __EXC_TYPE               int

/* Include the default __EXC_PRINT. */
#  define __EXC_TYPE_DEFAULT
#endif

#ifndef __EXC_MAKE
#  define __EXC_MAKE(code...)      code
#endif

#ifndef __EXC_ON
#  define __EXC_ON                 __EXC_MAKE
#endif

#ifndef __EXC_EQ
#  define __EXC_EQ(c1, c2)         ((c1) == (c2))
#endif


/* Optional exception printer.  This is used for debugging purposes
   only.  Define yourself's one as __EXC_PRINT. Arguments are
   exception of type __EXC_TYPE and stream to print to. */

#if !defined (__EXC_PRINT) && defined (__EXC_TYPE_DEFAULT)
#  define __EXC_PRINT(e, stream)             \
     fprintf (stream, "%d", e)
#endif



/* All variables are declared volatile to force non-optimization. 
   They should also be declared as thread-local. */

/* This counter is used by __EXC_BLOCK.  It works well even if nested. */
extern volatile int __exc_block_pass;

/* Flag to be set by ON? */
extern volatile int __exc_handled;

/* For indexing every call to TRY. */
extern volatile unsigned __exc_tries;

/* These identify the thrown exception.  File, function, line and
   the exception itself. */
extern char *__exc_file;
extern char *__exc_function;
extern unsigned __exc_line;
extern volatile __EXC_TYPE __exc_code;

/* Stack is actually a linked list of catcher cells. */
struct __exc_stack
{
  unsigned num;
  jmp_buf j;
  struct __exc_stack *prev;
};

/* This is the global stack of catchers. */
extern struct __exc_stack *__exc_global;



/* Debugging of exceptions.  Nothing interesting for you.  (Just for me.) 
   Anyway, it generates many (really) messages telling what is going
   to happen.  I order to work with it successfully, you should define
   __EXC_PRINT (see above.)
*/
#ifdef __EXC_DEBUG
#  include <stdarg.h>
#  ifndef __EXC_STREAM
/* I often redirect debugging information to a file. */
#    define __EXC_STREAM                     stdout
#  endif

/* Prints error message. */
extern void __exc_debug(char *, ...);

/* For printing __exc_global. */
extern void __exc_print_global(void);

#else
#  define __exc_debug(args...)
#  define __exc_print_global()
#endif



/* Prints information about exception.  Called in debug mode, or when
   no handler is found. */
extern void __exc_print (FILE *, char *, char *,
			 unsigned, __EXC_TYPE);

/* Pop exception from stack, putting into J (if nonzero).  If stack is
   empty, print error message and exit.  Used in EXCEPT. */
extern void __exc_pop (jmp_buf *);



/* Push J onto the stack, with RETURNED as value from SETJMP.  Return
   nonzero, if RETURNED is 0.  If RETURNED is nonzero, returns 0.
   Used in TRY. */
extern int __exc_push (jmp_buf *, int);



/* Throw an exception in FILE at LINE, with code CODE.  Used in THROW. */
extern __attribute__((noreturn)) void __exc_throw (char *, char *, unsigned, __EXC_TYPE);

/* Throw it in upper level of catcher blocks. */
extern void __exc_rethrow ();



/* What a f...  Somewhy I can't get GCC's __attribute__ working here
   to tell that FILE and LINE are unused in non-debuging mode. */

/* TODO: define __attribute__ (foo) to do nothing if this is not GCC.
   (Check if GNUC is predefined.) */

extern int __exc_on (char *, char *, unsigned, __EXC_TYPE);



/* Start catching. */

/* Obviously, there is no way to check if appropriate EXCEPT exists.
   Its non-exsistence won't do segfault etc.; program will simply do
   the thing after TRY, without any error handling.  Raising from
   there works. */

#define try                                  \
  if (({jmp_buf __exc_j;                     \
        int __exc_ret;                       \
        __exc_ret = setjmp (__exc_j);        \
        __exc_push (&__exc_j, __exc_ret);})) \
    __EXC_END(__exc_pop (0))

#define throw(code...)                       \
  __exc_throw (__FILE__, __EXC_FUNCTION,     \
	       __LINE__, __EXC_MAKE (code))

/* THROW in EXCEPT block won't go into itself, because corresping item
   from __EXC_GLOBAL was already popped. */

#define except                               \
  else                                       \
    __EXC_BLOCK (__exc_handled = 0,          \
                 ({ if (__exc_handled == 0)  \
                     __exc_rethrow (); }))

/* EXPECT is an alias for EXCEPT. */

#define expect                         except

/* CATCH is an alias for EXCEPT. */

#define catch                          except

/* Try to handle an exception. */

#define on(code...)                          \
  if (__exc_on (__FILE__, __EXC_FUNCTION,    \
		__LINE__, __EXC_ON (code)))

#endif
/* End. */
