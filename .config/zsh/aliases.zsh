#general aliases
alias sudo="doas"
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
alias scrk="screenkey --no-whitespace -s small --bak-mode full -t 1 &"
alias svim="doas vim"
alias sivm="doas vim"
alias suvim="doas vim"
alias dmenu_nice="dmenu -i -fn 'monospace:size=8' -nb '#222222' -nf '#bbbbbb' -sb '#005577' -sf '#eeeeee'"
alias screenshot="ID=$(xdo id); xdo hide $ID && scrot && xdo show $ID"
alias ls="exa -a --group-directories-first"
alias lsh="exa --group-directories-first"
alias updateports="cd /usr/ports && cvs -q up -Pd -A"

#edit configurations
alias vimrc="vim ~/.config/vim/vimrc"
alias zshrc="vim ~/.config/zsh/.zshrc"
alias aliases="vim ~/.config/zsh/aliases.zsh"
alias xprofile="vim ~/.xprofile"

#git aliases
alias gacap="git add . && git commit -a && git push"

#spellign mistaeks
alias cd..="cd .."
alias claer="clear"
alias claer="clear"
alias clare="clear"
alias cleae="clear"
alias clera="clear"
alias shl="lsh"
alias hls="lsh"
alias slh="lsh"
alias lhs="lsh"

#youtube-dl
alias yt="yt-dlp"
alias ytdlp="yt"
alias ytdl="yt"
alias yt3="yt --audio-format mp3 -k"
alias yt4="yt --format mp4"
alias yta="yt -x -f bestaudio/best"

#swallow
alias mpv="swallow mpv"
alias zathura="swallow zathura"
alias sxiv="swallow sxiv"
alias nsxiv="swallow nsxiv"

#replace root-only commands with doas [command]
if [ -f /usr/bin/doas ]; then
	for command in mount umount lsblk sv vidoas pkg_add pkg_delete updatedb su shutdown poweroff reboot ; do
		alias $command="doas $command"
	done; unset command
fi

#up
up() {
	local d=""
	local limit="$1"

	#default to limit of 1
	if [ -z "$limit" ] || [ "$limit" -le 0 ]; then
		limit=1
	fi

	for ((i=1;i<=limit;i++)); do
		d="../$d"
	done

	if ! cd "$d"; then
		echo "Couldn't go up $limit dirs."
	fi
}

#FIX STUFF
alias fixsound="doas rcctl restart sndiod"
alias fixsnd="fixsound"
alias fixaudio="fixsound"
alias fixkeys="kill $(pgrep sxhkd) && sxhkd & disown sxhkd"
