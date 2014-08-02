#!/bin/bash
#this bash script compiles code using v0.8 compiler

set -e

. bld-combine.sh js js js
. bld-combine.sh js js c
. bld-combine.sh js c js
. bld-combine.sh js c c

. bld-combine.sh c js js
. bld-combine.sh c js c
. bld-combine.sh c c js
. bld-combine.sh c c c
