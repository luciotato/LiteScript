/*
 * exceptions4c lightweight version 1.0
 *
 * Copyright (c) 2014 Guillermo Calvo
 * Licensed under the GNU Lesser General Public License
 *
 * Simplified to dynC - LiteScript by Lucio M. Tato
 */

#ifndef EXCEPTIONS4C_LITE
#define EXCEPTIONS4C_LITE

#include "ScriptyC-core1.h"
#include <setjmp.h>

/* Maximum number of nested `try` blocks */
#ifndef E4C_MAX_FRAMES
# define E4C_MAX_FRAMES 32
#endif

/* Exception handling keywords: try/catch/finally/throw */
#ifndef E4C_NOKEYWORDS
# define try E4C_TRY
# define catch(e) E4C_CATCH(e)
# define finally E4C_FINALLY
# define throw(object) E4C_THROW(object)
#endif

/* Represents an instance of an exception*/
struct e4c_exception{
	void* object;
	const char * file;
	int line;
};

/* Implementation details */
#ifndef NDEBUG
        # define E4C_INFO __FILE__, __LINE__
#else
        # define E4C_INFO NULL, 0
#endif

#define E4C_TRY \
        if(e4c_try(E4C_INFO) && setjmp(e4c.jump[e4c.frames - 1]) >= 0) \
          while(e4c_hook()) \
            if(e4c.frame[e4c.frames].stage == e4c_trying)

//#define E4C_CATCH(ERRVAR) else if(e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1))
//#define E4C_CATCH(ERRVAR) else for(void * ERRVAR = e4c.err.object,e4c.frame[e4c.frames].inCatch=1; e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1);e4c.frame[e4c.frames].inCatch=0)
/*
 * #define E4C_CATCH(ERRVAR) \
        else if(e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1)) \
             for(var ERRVAR = e4c.err.object, *__i=0; __i==0; __i=1)
*/

#define E4C_CATCH(ERRVAR) \
        else if(e4c.frame[e4c.frames].stage == e4c_catching) \
             for(ERRVAR = e4c.err.object; e4c.frame[e4c.frames].uncaught!=0; e4c.frame[e4c.frames].uncaught=0)

#define E4C_FINALLY else if(e4c.frame[e4c.frames].stage == e4c_finalizing)

#define E4C_THROW(X) e4c_throw(E4C_INFO, X)

enum e4c_stage{
    e4c_beginning,
    e4c_trying,
    e4c_catching,
    e4c_finalizing,
    e4c_done};

extern struct e4c_context{
        jmp_buf jump[E4C_MAX_FRAMES];
        struct e4c_exception err;
        struct{
            unsigned char stage;
            unsigned char uncaught;
          } frame[E4C_MAX_FRAMES + 1];
        int frames;
} e4c;

extern int e4c_try(const char * file, int line);

extern int e4c_hook();

extern void e4c_throw( const char * file, int line, void* errObject);

# endif
