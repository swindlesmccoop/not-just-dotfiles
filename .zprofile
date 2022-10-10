HISTFILE=$HOME/.cache/zsh/history
SAVEHIST=100000000
HISTSIZE=$SAVEHIST
setopt appendhistory

autoload -U colors && colors
source "$HOME/.config/shell/aliases"
source "$HOME/.config/shell/exports"

[ "$(id -u)" = 0 ] && PS1ICON="#" || PS1ICON='%'
PS1="%B%{$fg[red]%}[%{$fg[yellow]%}%n%{$fg[green]%}@%{$fg[blue]%}%M %{$fg[magenta]%}%~%{$fg[red]%}]%{$reset_color%}%$PS1ICON "

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
function zle-keymap-select () {
	case $KEYMAP in
		vicmd) echo -ne '\e[1 q';;      # block
		viins|main) echo -ne '\e[5 q';; # beam
	esac
}

zle -N zle-keymap-select
zle-line-init() {
    zle -K viins #initiate "vi insert" as keymap
    echo -ne "\e[6 q"
}
zle -N zle-line-init
echo -ne '\e[6 q' #use steady beam on startup
preexec() { echo -ne '\e[2 q' }

#ctrl+e edits current line in vim
autoload edit-command-line; zle -N edit-command-line
bindkey '^e' edit-command-line

#syntax highlighting
#plugin () { source "$HOME/.local/share/zsh/plugins/"$1"" 2>/dev/null }
#plugin zsh-autosuggestions/zsh-autosuggestions.plugin.zsh
#plugin zsh-completions/zsh-completions.plugin.zsh
#plugin zsh-history-substring-search/zsh-history-substring-search.plugin.zsh
#source /usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
