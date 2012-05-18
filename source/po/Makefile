.PHONY: clean install

prefix:=/usr/local
exec_prefix:=${prefix}
libdir:=${exec_prefix}/lib
datarootdir:=${prefix}/share
srcdir:=.
top_builddir:=..
LOCALEDIR:=${datarootdir}/locale

MANDIR:=doc
MSGDIR:=.

POFILES:=$(wildcard *.po)
MOFILES:=$(POFILES:.po=.mo)
MSGFILES:=$(MOFILES:.mo=)

INSTALL:=/usr/bin/install -c
INSTALL_PROGRAM:=${INSTALL}
INSTALL_DATA:=${INSTALL} -m 644

THISFILE:=Makefile
DOMAIN:=minidjvu

all: $(MOFILES)

$(MOFILES): $(POFILES)
	msgfmt -o $@ $<

clean:
	$(RM) $(MOFILES)

distclean: clean

$(MSGFILES): $(MOFILES)
	${INSTALL} -d ${DESTDIR}$(LOCALEDIR)/${@}/LC_MESSAGES
	${INSTALL_DATA} $< ${DESTDIR}$(LOCALEDIR)/${@}/LC_MESSAGES/$(DOMAIN).mo


install: $(MSGFILES)

uninstall:
	for po in $(POFILES); do \
	  $(RM) ${DESTDIR}$(LOCALEDIR)/${po%.po}/LC_MESSAGES/$(DOMAIN).mo; \
	done

