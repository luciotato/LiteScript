/*
 * exceptions4c lightweight version 1.0
 *
 * Copyright (c) 2014 Guillermo Calvo
 * Licensed under the GNU Lesser General Public License
 *
 * Simplified for LiteC - LiteScript by Lucio M. Tato
 */

#ifndef EXCEPTIONS4C_LITE
#define EXCEPTIONS4C_LITE

#include <setjmp.h>
#include <stdio.h>
#include <stdlib.h>
#include "any.h"

    extern void fatal(char * msg);

/* Maximum number of nested `try` blocks */
#ifndef E4C_MAX_FRAMES
# define E4C_MAX_FRAMES 32
#endif

#ifdef NDEBUG
    #define E4C_INFO NULL, 0
#else
    #define E4C_INFO __FILE__, __LINE__
#endif

enum e4c_stage{
    e4c_beginning,
    e4c_trying,
    e4c_catching,
    e4c_finalizing,
    e4c_done};

/* e4c: global e4c variables */
extern struct e4c_global{

        struct e4c_exception{
            any error;
            const char * file;
            int line;
            int pending; // TRUE on throw, FALSE when processed by a catch
                } exception; //last exception info

        //which frame is now active
        int activeFrame;

        //frame info array
        struct{
            jmp_buf jump;
            unsigned char stage;
            int catchExecuteCount; //counter to execute catch block only once
            }
                frame[E4C_MAX_FRAMES + 1];

        int setjmpResult; //dummy
        int last; //dummy

} e4c;


/* Implementation details */

/*
#define try \
        if(e4c_try(E4C_INFO) && setjmp(e4c.jump[e4c.frames - 1]) >= 0) \
          while(e4c_incStage()) \
            if(e4c.frame[e4c.frames].stage == e4c_trying)
*/

/*#define try \
    if(e4c_newFrame() && setjmp(e4c.frame[e4c.activeFrame].jump) >= 0) \
        while(e4c_incStage()) \
            if(e4c.frame[e4c.activeFrame].stage == e4c_trying)
*/

/*
 * try:
 *
 * 1.- create a new frame. stage=trying
 *     setjmp. record position at e4c[frame].jump (condition always true)
 *
 *  2. (for-condition)
 *     _incStage() - advance stage (returns TRUE if stage<done)
 *     => continue looping try->catch->finally UNTIL stage<e4c_done
 */

#define try \
    for ( e4c_newFrame(), setjmp(e4c.frame[e4c.activeFrame].jump); e4c_incStage(); ) \
        if(e4c.frame[e4c.activeFrame].stage == e4c_trying)

/*
catch:
  - if stage=catching
  - set .uncaught=0 // caught
  - create ERRVAR variable
  - execute catch body (once)
*/
#define catch(ERRVAR) \
    else if(e4c_isCatching()) \
       for(any ERRVAR=e4c.exception.error; e4c.frame[e4c.activeFrame].catchExecuteCount-- >0;)

#define finally \
    else if(e4c.frame[e4c.activeFrame].stage==e4c_finalizing)

#define throw(X) e4c_throw(E4C_INFO, X)
/*
#define catch(ERRVAR) \
    else for(any ERRVAR = e4c.exception.error, e4c.frame[e4c.frames].uncaught=0; e4c.frame[e4c.frames].uncaught=0)
*/

//if(e4c.frame[e4c.frames].stage == e4c_catching) \

#define fail_with(msg)  throw(_newErr(msg))

//#define E4C_CATCH(ERRVAR) else if(e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1))
//#define E4C_CATCH(ERRVAR) else for(void * ERRVAR = e4c.err.object,e4c.frame[e4c.frames].inCatch=1; e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1);e4c.frame[e4c.frames].inCatch=0)
/*
 * #define E4C_CATCH(ERRVAR) \
        else if(e4c.frame[e4c.frames].stage == e4c_catching && e4c_hook(1)) \
             for(var ERRVAR = e4c.err.object, *__i=0; __i==0; __i=1)
*/

extern void e4c_newFrame(void);
extern int e4c_incStage(void);

extern void e4c_exitTry(int howManyBlocks);

extern int e4c_isCatching(void);

extern void e4c_throw( str file, int line, any error);

extern void e4c_printLastErr(void);

# endif
