/*
 *     AUTOR       : Jose Angel Caso Sanchez , 2013
 *
 *                   altomaltes@yahoo.es
 *                   altomaltes@gmail.com
 *
 *     CREACION    : may 2013
 *     PROGRAM FILE: memory.h
 *
 *  DESCRIPTION:
 *
 *    Heap mamager. Partially used blocks, definitions
 *
 *  LICENSE:
 *
 *    The Code Project Open License (CPOL) 1.02
 *
 */


#include <stdlib.h>

typedef struct NomadMem
{ struct NomadMem * next;
  int act, idx, usr;
} NomadMem;

#ifdef __cplusplus
 extern "C" {
#endif


NomadMem * nomadAlloc   (             size_t sz );
NomadMem * nomadRealloc ( NomadMem *, size_t nw );
NomadMem * nomadResize  ( NomadMem *, size_t nw );
NomadMem * nomadLinked  ( NomadMem *, size_t sz );
NomadMem * nomadFree    ( NomadMem *            );
NomadMem * nomadFreeList( NomadMem *            );

void * unalloc  (         size_t sz );
void * unrealloc( void *, size_t nw );
void * unresize ( void *, size_t nw );
void * unfree   ( void *            );

void * qalloc( size_t sz   );
void * qlinked( void * up, size_t sz );
void * qfree( void * block );                             /* free an allocated block   */

#ifdef __cplusplus
 }
#endif

#define NOMADALLOC( t ) (t *)nomadAlloc( sizeof(t) );


