# Makefile for C-Exceptions

SHELL = /bin/sh

# As usual.
CC = gcc
CFLAGS += -W -Wall -O

SOURCES = $(wildcard exception.h exception.c exc-old.h test*.c)
MISCFILES = Makefile README VERSION COPYING ChangeLog page/make_html.sh $(wildcard Xtest*.c)
DISTFILES = $(SOURCES) $(MISCFILES)

TESTS = $(patsubst %.c,%,$(wildcard test*.c))
VERSION = $(shell cat VERSION)

all: $(TESTS)

exception-local.h: exception.h

exception.o: exception.c exception.h exception-local.h
	$(CC) $(CFLAGS) exception.c -L. -c -o exception.o

%: %.c exception.o
	$(CC) $(CFLAGS) $< exception.o -o $@

dist: excc-$(VERSION).tar.gz

excc-$(VERSION).tar.gz: $(DISTFILES)
	mkdir excc-$(VERSION)
	cp -dpR $(DISTFILES) excc-$(VERSION)
	tar -czf $@ excc-$(VERSION)
	rm -fr excc-$(VERSION)

.PHONY: clean
clean:
	-rm -f $(TESTS) exception.o

