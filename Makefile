PREFIX = ${HOME}/.local
CONF = ${HOME}/.config

deps:
	@printf "\033[31m:Due to the high amount of dependencies, it's nearly impossible to check for them across all systems. Check pkglist.txt to see if you fulfill the requirements. Alternatively, try installing the scripts and configurations, and individually fix anything broken.\n"

configs:
	mkdir -p ${CONF}
	cp -r .config ${CONF}/

scripts:
	mkdir -p ${PREFIX}/bin/
	cp -r .local/bin/* ${PREFIX}/bin/

dwm:
	git clone https://git.cbps.xyz/swindlesmccoop/dwm
	git clone https://git.cbps.xyz/swindlesmccoop/dwmblocks
	cd dwm && ./configure && make && sudo make install
	cd dwmblocks && ./configure && make && sudo make install

i3:
	mkdir -p ${CONF}
	cp -r .config/i3/ ${CONF}
	cp -r .config/i3blocks/ ${CONF}

bspwm:
	mkdir -p ${CONF}
	cp -r .config/bspwm/ ${CONF}
	cp -r .config/sxhkd/ ${CONF}
	cp -r .config/polybar/ ${CONF}

.PHONY: deps configs scripts dwm i3 bspwm