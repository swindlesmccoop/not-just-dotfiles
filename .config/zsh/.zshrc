#options
setopt autocd
setopt interactive_comments
EDITOR=vim
BROWSER=chromium
TERMINAL=konsole
[ -d ~/.local/bin/terminal-flirt ] && FLIRTSCRIPT="$(command ls ~/.local/bin/terminal-flirt/*.sh | shuf -n 1)"
[ -d ~/.local/lbin/terminal-flirt ] && FLIRTSCRIPT="$(command ls ~/.local/lbin/terminal-flirt/*.sh | shuf -n 1)"

#make programs respect xdg
export ZDOTDIR=$HOME/.config/zsh
export VIMINIT="set nocp | source ${XDG_CONFIG_HOME:-$HOME/.config}/vim/vimrc"
export MOST_INITFILE="$HOME/.config/most/most.rc"

#history stuff
HISTFILE=$HOME/.config/zsh/.zsh_history
HISTSIZE=HISTSIZE
SAVEHIST=10000000
setopt appendhistory

#path
VITASDK=/usr/local/vitasdk
PATH="$PATH:$VITASDK/bin:/$HOME/.local/bin:$HOME/.local/lbin"
for d in "$HOME/git/*"; do PATH="$PATH:$d"; done
[ -d "$HOME/workspace/" ] && $(for d in "$HOME/workspace/git/*"; do PATH="$PATH:$d"; done)

#colors and stuff
autoload -U colors && colors
LS_COLORS='rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.Z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:';
export LS_COLORS
alias ls="ls -A --color"
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
[ "$(id -u)" = 0 ] && PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%# " || PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%% "
[ -f /usr/bin/wal ] && [ "$WALL" != "" ] && wal -q -i "$WALL"

source $HOME/.config/zsh/aliases.zsh 2>&1 /dev/null

#tab completion
autoload -U compinit
zstyle ':completion:*' menu select
zmodload zsh/complist
compinit
_comp_options+=(globdots)

#vi mode
bindkey -v
export KEYTIMEOUT=1
bindkey "^?" backward-delete-char

#vi keys in tab complete menu
bindkey -M menuselect 'h' vi-backward-char
bindkey -M menuselect 'k' vi-up-line-or-history
bindkey -M menuselect 'l' vi-forward-char
bindkey -M menuselect 'j' vi-down-line-or-history

#flashing block for insert mode, steady for normal
function zle-keymap-select {
  if [[ ${KEYMAP} == vicmd ]] ||
     [[ $1 = 'steady block' ]]; then
    echo -ne '\e[2 q'
  elif [[ ${KEYMAP} == main ]] ||
       [[ ${KEYMAP} == viins ]] ||
       [[ ${KEYMAP} = '' ]] ||
       [[ $1 = 'steady beam' ]]; then
    echo -ne '\e[6 q'
  fi
}
zle -N zle-keymap-select
zle-line-init() {
    zle -K viins #initiate "vi insert" as keymap
    echo -ne "\e[6 q"
}
zle -N zle-line-init
echo -ne '\e[6 q' #use steady beam on startup
preexec() { echo -ne '\e[2 q' ; $FLIRTSCRIPT }

#ctrl+e edits current line in vim
autoload edit-command-line; zle -N edit-command-line
bindkey '^e' edit-command-line

#source autocompletion from man pages
zstyle ':completion:*:manuals'    separate-sections true
zstyle ':completion:*:manuals.*'  insert-sections   true
zstyle ':completion:*:man:*'      menu yes select

#syntax highlighting
plugin () { source "$HOME/.local/share/zsh/plugins/"$1"" 2>/dev/null }
plugin zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
plugin zsh-syntax-highlighting/zsh-syntax-highlighting.plugin.zsh
plugin zsh-completions/zsh-completions.plugin.zsh
plugin zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
