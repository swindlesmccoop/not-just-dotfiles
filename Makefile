PREFIX = ${HOME}/.local
CONF = ${HOME}/.config
GITSITE = "https://github.com/swindlesmccoop"
ROOTCOMMAND = $(shell command -v sudo || command -v doas)

all: configs scripts dwm i3 bspwm

configs:
	mkdir -p ${CONF}
	cp -r .config/* ${CONF}/

scripts:
	mkdir -p ${PREFIX}/bin/
	cp -r .local/bin/* ${PREFIX}/bin/

dwm:
	[ -d src/dwm ] && cd src/dwm && git pull || git clone ${GITSITE}/dwm src/dwm
	[ -d src/dwmblocks ] && cd src/dwmblocks && git pull || git clone ${GITSITE}/dwmblocks src/dwmblocks
	[ -d src/st ] && cd src/st && git pull || git clone ${GITSITE}/st src/st
	[ -d src/dmenu ] && cd src/dmenu && git pull || git clone ${GITSITE}/dmenu src/dmenu
	cd src/dwm && ./configure && make && ${ROOTCOMMAND} make install
	cd src/dwmblocks && ./configure && make && ${ROOTCOMMAND} make install
	cd src/st && ./configure && make && ${ROOTCOMMAND} make install
	cd src/dmenu && ./configure && make && ${ROOTCOMMAND} make install
	cp .config/sxhkd/sxhkdrc ${CONF}/sxhkd/sxhkdrc

i3:
	mkdir -p ${CONF}
	cp -r .config/i3/ ${CONF}
	cp -r .config/i3blocks/ ${CONF}
	[ -d src/i3-master-stack ] && cd src/i3-master-stack && git pull || git clone ${GITSITE}/i3-master-stack src/i3-master-stack
	cd src/i3-master-stack && make && ${ROOTCOMMAND} make install

bspwm:
	mkdir -p ${CONF}
	cp -r .config/bspwm/ ${CONF}
	mkdir -p ${CONF}/sxhkd/
	cp .config/sxhkd/sxhkdrc-bspwm ${CONF}/sxhkd/sxhkdrc
	cp -r .config/polybar/ ${CONF}