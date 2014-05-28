/* Use this header to make local modifications to macros.
 * `exception.c' depends on this file, and must be rebuilt
 * once it changes (Makefile does this for you.)
*/

#define __EXC_TYPE          int
#define __EXC_MAKE(code)    (code)
#define __EXC_ON(code)      __EXC_MAKE(code)
#define __EXC_EQ(a,b)       ((a) == (b))
#define __EXC_PRINT(e, fp)  fprintf(fp, "Exception %d", e)

/* Turn debugging off.
*/
#undef __EXC_DEBUG

#include "exception.h"
