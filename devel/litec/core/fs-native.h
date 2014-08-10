/*
 * File:   fs-native.h
 * Author: ltato
 *
 * Created on August 4, 2014, 3:01 AM
 */

#ifndef FS_NATIVE_H
#define	FS_NATIVE_H

#ifdef	__cplusplus
extern "C" {
#endif

#include "LiteC-core.h"
//-------------------------
//Module fs
//-------------------------
extern void fs__moduleInit(void);
extern void fs__nativeInit(void);
    //-------------------------
    // namespace fs
    //-------------------------
        extern any fs_existsSync(DEFAULT_ARGUMENTS);
        extern any fs_readFileSync(DEFAULT_ARGUMENTS);
        extern any fs_writeFileSync(DEFAULT_ARGUMENTS);
        extern any fs_statSync(DEFAULT_ARGUMENTS);
        extern any fs_unlinkSync(DEFAULT_ARGUMENTS);
        extern any fs_mkdirSync(DEFAULT_ARGUMENTS);
        extern any fs_openSync(DEFAULT_ARGUMENTS);
        extern any fs_writeSync(DEFAULT_ARGUMENTS);
        extern any fs_closeSync(DEFAULT_ARGUMENTS);
        extern any fs_existsSync(DEFAULT_ARGUMENTS);
        extern any fs_readFileSync(DEFAULT_ARGUMENTS);
        extern any fs_writeFileSync(DEFAULT_ARGUMENTS);
        extern any fs_statSync(DEFAULT_ARGUMENTS);
        extern any fs_unlinkSync(DEFAULT_ARGUMENTS);
        extern any fs_mkdirSync(DEFAULT_ARGUMENTS);
        extern any fs_openSync(DEFAULT_ARGUMENTS);
        extern any fs_writeSync(DEFAULT_ARGUMENTS);
        extern any fs_closeSync(DEFAULT_ARGUMENTS);


//--------------
        // fs_Stat
        any fs_Stat; //Class fs_Stat
        typedef struct fs_Stat_s * fs_Stat_ptr;
        typedef struct fs_Stat_s {
            //Stat
            any size;
            any mtime;
            any mode;

        } fs_Stat_s;

        extern void fs_Stat__init(DEFAULT_ARGUMENTS);
        extern any fs_Stat_newFromObject(DEFAULT_ARGUMENTS);
        extern any fs_Stat_isDirectory(DEFAULT_ARGUMENTS);
        extern any fs_Stat_isFile(DEFAULT_ARGUMENTS);

#ifdef	__cplusplus
}
#endif

#endif	/* FS_NATIVE_H */

