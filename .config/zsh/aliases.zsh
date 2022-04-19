#general  aliases
alias enc="gpg -c --cipher-algo AES256"
alias ":q"="exit"
alias c="clear"
alias flac-mp3="flac2mp3 -b 320 *.flac"
alias pms="paru -S"
alias syyu="pacman -Syyu"
alias vi="vim"
alias nvim="vim"
alias yt="yt-dlp"
alias showme="mpv /dev/video0 2&> /dev/null &"
alias asciime="mplayer tv:// -vo caca"
alias lf="lfub"

#edit configurations
alias pacman.conf="sudo vim /etc/pacman.conf"
alias preview="sddm-greeter --test-mode --theme"
alias sddm.conf="sudo vim /etc/sddm.conf"
alias sudoers="visudo"
alias vimrc="vim ~/.config/vim/vimrc"
alias zshrc="vim ~/.config/zsh/.zshrc"
alias aliases="vim ~/.config/zsh/aliases.zsh"
alias liisten="vgmstream123 -l 2 -f 5 -m"

#git  aliases
alias gacap="git add . && git commit -a && git push"

#spellign mistaeks
alias cd..="cd .."
alias claer="clear"
alias claer="clear"
alias clare="clear"
alias cleae="clear"
alias clera="clear"

#youtube-dl
alias yt="yt-dlp"
alias mp3="yt --audio-format mp3 -k"
alias ytdlp="yt"
alias yta="yt -x -f bestaudio/best"
alias ytdl="yt"

#replace root-only commands with sudo [command]
if [ -f /bin/sudo ]; then
	for command in mount umount sv visudo pacman updatedb su shutdown poweroff reboot ; do
		alias $command="sudo $command"
	done; unset command
fi
