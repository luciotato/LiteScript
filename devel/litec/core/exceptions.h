/*
 * try-catch-finally for LiteC - LiteScript
 * Copyright (c) 2014 Lucio M. Tato
 *
 * Credits:
 * Started from exceptions4c lightweight version 1.0 - (c) 2014 Guillermo Calvo
 * rewritten for LiteC
 *
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
    #define E4C_MAX_FRAMES 64
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
            const char * file;
            int line;
            jmp_buf jump;
            unsigned char stage;
            int catchExecuteCount; //counter to execute catch block only once
            }
                frame[E4C_MAX_FRAMES + 1];

        int setjmpResult; //dummy
        int last; //dummy

} e4c;

/*
 * try:
 *
 * 1.- create a new frame. stage=beginning
 * 2.- setjmp. record position at e4c[frame].jump (condition always true)
 * 3.- while incStage() // advance stage (returns TRUE if stage<done) - loop all stages
 * 5.      if stage == trying
 *         ... try body
 */

#define try \
    if(e4c_newFrame(__FILE__, __LINE__)) \
    if(setjmp(e4c.frame[e4c.activeFrame].jump)>=0) \
    while(e4c_incStage()) \
        if (e4c.frame[e4c.activeFrame].stage==e4c_trying)

/*
catch:
  - if stage=catching
  - create ERRVAR variable
  - execute catch body (once)
*/
#define catch(ERRVAR) \
        else if(e4c_isCatching()) \
            for(any ERRVAR=e4c.exception.error; e4c.frame[e4c.activeFrame].catchExecuteCount-- >0;)

#define finally \
        else if(e4c.frame[e4c.activeFrame].stage==e4c_finalizing)

#define throw(X) e4c_throw(E4C_INFO, X)

extern int e4c_newFrame(str file,int line); //note: make another version for #ifdef NDEBUG
extern int e4c_incStage(void);

extern void e4c_exitTry(int howManyBlocks);

extern int e4c_isCatching(void);

extern void e4c_throw( str file, int line, any error);

extern void e4c_printLastErr(void);

# endif
