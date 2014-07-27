/** PMREX, poor's man RegEx
 *
 * --------------------------------
 * LiteScript lang - gtihub.com/luciotato/LiteScript
 * Copyright (c) 2014 Lucio M. Tato
 * --------------------------------
 * This file is part of LiteScript.
 * LiteScript is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation version 3.
 * LiteScript is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details. You should have received a copy of the
 * GNU Affero General Public License along with LiteScript.  If not, see <http://www.gnu.org/licenses/>.
 */

#ifndef PMREX_NATIVE_H
#define	PMREX_NATIVE_H

#ifdef	__cplusplus
extern "C" {
#endif

#include "LiteC-core.h"

    //-------------------------
    //Module PMREX
    // PMREX, poor's man RegEx
    //-------------------------
    extern any PMREX_whileRanges(DEFAULT_ARGUMENTS);
    extern any PMREX_untilRanges(DEFAULT_ARGUMENTS);

    extern any PMREX_quotedContent(DEFAULT_ARGUMENTS);
    extern any PMREX_whileUnescaped(DEFAULT_ARGUMENTS);

#ifdef	__cplusplus
}
#endif

#endif	/* PMREX_NATIVE_H */

