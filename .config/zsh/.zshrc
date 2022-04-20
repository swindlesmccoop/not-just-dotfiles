#options
setopt autocd
setopt interactive_comments
export EDITOR=vim
export BROWSER=chromium
export TERMINAL=st
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

#colors and icons
autoload -U colors && colors
alias ls="ls -A --color=auto"
export LESS_TERMCAP_mb=$'\e[1;32m'
export LESS_TERMCAP_md=$'\e[1;32m'
export LESS_TERMCAP_me=$'\e[0m'
export LESS_TERMCAP_se=$'\e[0m'
export LESS_TERMCAP_so=$'\e[01;33m'
export LESS_TERMCAP_ue=$'\e[0m'
export LESS_TERMCAP_us=$'\e[1;4;31m'
[ "$(id -u)" = 0 ] && PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%# " || PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%% "
#[ -f /usr/bin/wal ] && [ "$WALL" != "" ] && wal -q -i "$WALL"
export LC=en_US.UTF-8
export LC_ALL=$LC
export LF_ICONS="$(cat "$HOME/.config/lf/icons")"

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
