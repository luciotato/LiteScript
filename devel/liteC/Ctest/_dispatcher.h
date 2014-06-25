#ifndef _DISPATCHER_C_H
#define _DISPATCHER_C_H
#include "LiteC-core.h"
#include "litec.h"
#include "path.h"
#include "fs.h"
#include "fs_native.h"
#include "log.h"
#include "color.h"
#include "OptionsParser.h"
// core support and defined classes init
extern void __init_core_support();
// method dispatchers
extern any _toString( DEFAULT_ARGUMENTS );
extern any _join( DEFAULT_ARGUMENTS );
extern any _resolve( DEFAULT_ARGUMENTS );
extern any _dirname( DEFAULT_ARGUMENTS );
extern any _extname( DEFAULT_ARGUMENTS );
extern any _basename( DEFAULT_ARGUMENTS );
extern any _existsSync( DEFAULT_ARGUMENTS );
extern any _readFileSync( DEFAULT_ARGUMENTS );
extern any _writeFileSync( DEFAULT_ARGUMENTS );
extern any _throwTextErr( DEFAULT_ARGUMENTS );
extern any _debug( DEFAULT_ARGUMENTS );
extern any _debugClear( DEFAULT_ARGUMENTS );
extern any _error_( DEFAULT_ARGUMENTS );
extern any _warning( DEFAULT_ARGUMENTS );
extern any _message( DEFAULT_ARGUMENTS );
extern any _info( DEFAULT_ARGUMENTS );
extern any _extra( DEFAULT_ARGUMENTS );
extern any _getMessages( DEFAULT_ARGUMENTS );
extern any _throwControled( DEFAULT_ARGUMENTS );
extern any _option( DEFAULT_ARGUMENTS );
extern any _value( DEFAULT_ARGUMENTS );
extern any _getPos( DEFAULT_ARGUMENTS );
extern any _search( DEFAULT_ARGUMENTS );
extern any _slice( DEFAULT_ARGUMENTS );
extern any _split( DEFAULT_ARGUMENTS );
extern any _indexOf( DEFAULT_ARGUMENTS );
extern any _lastIndexOf( DEFAULT_ARGUMENTS );
extern any _concat( DEFAULT_ARGUMENTS );
extern any _splice( DEFAULT_ARGUMENTS );
extern any _push( DEFAULT_ARGUMENTS );
extern any _unshift( DEFAULT_ARGUMENTS );
extern any _pop( DEFAULT_ARGUMENTS );
extern any _get( DEFAULT_ARGUMENTS );
extern any _has( DEFAULT_ARGUMENTS );
extern any _set( DEFAULT_ARGUMENTS );
extern any _clear( DEFAULT_ARGUMENTS );
extern any _delete( DEFAULT_ARGUMENTS );
extern any _log_( DEFAULT_ARGUMENTS );
extern any _exit_( DEFAULT_ARGUMENTS );
extern any _cwd( DEFAULT_ARGUMENTS );
#endif