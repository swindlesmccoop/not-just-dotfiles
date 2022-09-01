PREFIX = ${HOME}/.local
CONF = ${HOME}/.config
#ROOTCOMMAND = doas
#ROOTCOMMAND = sudo

define checkroot
	@[ "${ROOTCOMMAND}" = "" ] && printf "\033[1;31mYou didn't follow the instructions in the README! Go uncomment the line with your system's root command in the Makefile and try again.\033[0m\n" && exit 1
endef

deps:
	@printf "\033[31m:Due to the high amount of dependencies, it's nearly impossible to check for them across all systems. Check pkglist.txt to see if you fulfill the requirements. Alternatively, try installing the scripts and configurations, and individually fix anything broken.\n"

configs:
	mkdir -p ${CONF}
	cp -r .config ${CONF}/

scripts:
	mkdir -p ${PREFIX}/bin/
	cp -r .local/bin/* ${PREFIX}/bin/

dwm:
	@$(call checkroot)
	git clone https://git.cbps.xyz/swindlesmccoop/dwm
	git clone https://git.cbps.xyz/swindlesmccoop/dwmblocks
	cd dwm && ./configure && make && ${ROOTCOMMAND} make install
	cd dwmblocks && ./configure && make && ${ROOTCOMMAND} make install

i3:
	@$(call checkroot)
	mkdir -p ${CONF}
	cp -r .config/i3/ ${CONF}
	cp -r .config/i3blocks/ ${CONF}
	git clone https://git.cbps.xyz/swindlesmccoop/i3-master-stack && cd i3-master-stack && make && ${ROOTCOMMAND} make install
	rm -rf i3-master-stack

bspwm:
	mkdir -p ${CONF}
	cp -r .config/bspwm/ ${CONF}
	mkdir -p ${CONF}/sxhkd/
	cp -r .config/sxhkd/sxhkdrc-bspwm ${CONF}/sxhkdrc
	cp -r .config/polybar/ ${CONF}

.PHONY: deps configs scripts dwm i3 bspwm