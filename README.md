# Information
I try to make everything as portable as possible, and I've rewritten many of my scripts (at least the important ones) to work on both OpenBSD (my main OS) as well as Linux, though because Linux isn't centralized, it's a bit hard to make sure I can support *every* distribution. Fortunately, I can test on both Mint (Debian-based) and Arch, so I'm covering the most popular distributions and their forks.

# Installation
I made it super easy to install everything by implementing a [Makefile](Makefile). To install all of the configurations, run `make configs`. To install the scripts, run `make scripts`. To install everything necessary to run each window manager, run `make [dwm/i3/bspwm]`, replacing the brackets with the name of the WM. To install absolutely everything, just run `make` and let it run its course. You may have to resolve a few machine-specific errors that I have no control over, though. Also, you must run `make [wm]` before you switch to using the desired WM to make sure configs are set up properly. This is a problem when switching between BSPWM and any other WM due to them all relying on `sxhkdrc`, with BSPWM having a drastically different one from i3 and DWM.

# Features
## Supports multiple window managers
- DWM
- i3(-gaps)
- BSPWM
## Supports multiple status bars
- [dwmblocks](/swindlesmccoop/dwmblocks)
- i3blocks
- Polybar

# Programs and their purposes
- Notification daemon: Dunst
- Version control: Git
- Shell: Bash (zsh configurations included as well)
- Keybinds: SXHKD
- Terminal multiplexer: Tmux
- Text Editor: Vim (but soon to be [vis](/swindlesmccoop/vis))
- PDF Reader: Zathura

# Dependencies
You can find the dependencies at [pkglist.txt](pkglist.txt), but the package names may be different per distribution/OS. I'll try to add an option to the Makefile to get the dependencies for OpenBSD's PKG, FreeBSD's PKG, Apt, and Pacman, but I need GUI environments to test in, which I can barely access.

# Known Issues
- Sometimes dwmblocks will not properly launch on OpenBSD. Solution: Type `kill $(pgrep dwmblocks); dwmblocks & disown dwmblocks` in the terminal.
- Sometimes running the volume keybinds on OpenBSD will kill dwmblocks as a whole. Not sure why this happens or how to fix it. Works on my machine, but not in a VM?
- Volume keybinds on FreeBSD do not work, they just kill dwmblocks instead of sending the refresh signal. Not sure how to fix.
- Part of the picom config does not work anymore. The part is commented out. Not sure why it doesn't work, however, and I'd like to get it fixed.