/* Primitive support for exceptions in C. Coded just for fun
   on 2003-07-13 by admp.
   Use, share and modify under GNU General Public License.

   This header file uses many GCC extensions, and therefore is
   unportable. So use GCC.
 */

/* Generally, this implementation is very limited. All after
   all, there is one MAIN restriction: TRY without EXCEPT
   will not even compile or something strange will happen at run time.
   Anyway, there isn't much point in using TRY without EXCEPT, I think.
 */

#if defined (__EXCEPTION_H__)
  lose!
#endif

#define __EXCEPTION_H__

/* All code is based on this. */
#include <setjmp.h>

/* Prefix for all names here is `__exception_' (and __EXCEPTION_ for
   macros) to leave namespace clean. */

/* Type of exception structure. */
#ifndef __EXCEPTION_TYPE
#  define __EXCEPTION_TYPE             int
#endif

/* This makes exception structure from exception code.
   May use as much arguments as you want. */
#ifndef __EXCEPTION_MAKE
#  define __EXCEPTION_MAKE(code)      code
#endif

/* Function for comparing exception structure with exception
   code. */
#ifndef __EXCEPTION_EQ
#  define __EXCEPTION_EQ(f, b)        ((f) == (b))
#endif

/* The top CATCHER. */
static jmp_buf __exception_catcher;

/* The raised exception.*/
static __EXCEPTION_TYPE __exception;

/* File and line where exception was raised. */
static int __exception_line;
static char *__exception_file;

/* The TRY. */
#define try                                  \
  if (setjmp (__exception_catcher) == 0)

/* The EXCEPT. */
#define except                               \
  else

/* The RAISE (EXCEPTION). */
#define raise(code...)                       \
  do {                                       \
   __exception = __EXCEPTION_MAKE (code);    \
   __exception_line = __LINE__;              \
   __exception_file = __FILE__;              \
   longjmp (__exception_catcher, 1);         \
  } while (0)

/* The ON. */
#define on(code...)                          \
  if (__EXCEPTION_EQ (__exception,           \
        __EXCEPTION_MAKE (code)))
