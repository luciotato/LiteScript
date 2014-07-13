#
# Generated Makefile - do not edit!
#
# Edit the Makefile in the project folder instead (../Makefile). Each target
# has a -pre and a -post target defined where you can add customized code.
#
# This makefile implements configuration specific macros and targets.


# Environment
MKDIR=mkdir
CP=cp
GREP=grep
NM=nm
CCADMIN=CCadmin
RANLIB=ranlib
CC=gcc
CCC=clang
CXX=clang
FC=gfortran
AS=as

# Macros
CND_PLATFORM=GNU-Linux-x86
CND_DLIB_EXT=so
CND_CONF=Debug
CND_DISTDIR=dist
CND_BUILDDIR=build

# Include project Makefile
include Makefile

# Object Directory
OBJECTDIR=${CND_BUILDDIR}/${CND_CONF}/${CND_PLATFORM}

# Object Files
OBJECTFILES= \
	${OBJECTDIR}/core/LiteC-core.o \
	${OBJECTDIR}/core/any.o \
	${OBJECTDIR}/core/exceptions.o \
	${OBJECTDIR}/core/fs.o \
	${OBJECTDIR}/core/util.o \
	${OBJECTDIR}/main.o


# C Compiler Flags
CFLAGS=

# CC Compiler Flags
CCFLAGS=
CXXFLAGS=

# Fortran Compiler Flags
FFLAGS=

# Assembler Flags
ASFLAGS=

# Link Libraries and Options
LDLIBSOPTIONS=-Llib -lgc

# Build Targets
.build-conf: ${BUILD_SUBPROJECTS}
	"${MAKE}"  -f nbproject/Makefile-${CND_CONF}.mk ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-core

${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-core: ${OBJECTFILES}
	${MKDIR} -p ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}
	${LINK.c} -o ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-core ${OBJECTFILES} ${LDLIBSOPTIONS}

${OBJECTDIR}/core/LiteC-core.o: core/LiteC-core.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/LiteC-core.o core/LiteC-core.c

${OBJECTDIR}/core/any.o: core/any.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/any.o core/any.c

${OBJECTDIR}/core/exceptions.o: core/exceptions.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/exceptions.o core/exceptions.c

${OBJECTDIR}/core/fs.o: core/fs.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/fs.o core/fs.c

${OBJECTDIR}/core/util.o: core/util.c 
	${MKDIR} -p ${OBJECTDIR}/core
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/core/util.o core/util.c

${OBJECTDIR}/main.o: main.c 
	${MKDIR} -p ${OBJECTDIR}
	${RM} "$@.d"
	$(COMPILE.c) -g -std=c99 -MMD -MP -MF "$@.d" -o ${OBJECTDIR}/main.o main.c

# Subprojects
.build-subprojects:

# Clean Targets
.clean-conf: ${CLEAN_SUBPROJECTS}
	${RM} -r ${CND_BUILDDIR}/${CND_CONF}
	${RM} ${CND_DISTDIR}/${CND_CONF}/${CND_PLATFORM}/litec-core

# Subprojects
.clean-subprojects:

# Enable dependency checking
.dep.inc: .depcheck-impl

include .dep.inc
