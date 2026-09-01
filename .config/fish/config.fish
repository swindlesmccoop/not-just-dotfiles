fish_add_path $HOME/.local/bin

# Equivalent to bash `set -o vi`
fish_vi_key_bindings
fish_vi_cursor

# Bash-style !! and !$ (https://github.com/oh-my-fish/plugin-bang-bang)
function __history_previous_command
    switch (commandline -t)
        case '!'
            commandline -t $history[1]
            commandline -f repaint
        case '*'
            commandline -i '!'
    end
end

function __history_previous_command_arguments
    switch (commandline -t)
        case '!'
            commandline -t ''
            commandline -f history-token-search-backward
        case '*'
            commandline -i '$'
    end
end

if test "$fish_key_bindings" = fish_vi_key_bindings
    bind -Minsert '!' __history_previous_command
    bind -Minsert '$' __history_previous_command_arguments
else
    bind '!' __history_previous_command
    bind '$' __history_previous_command_arguments
end

# Pure layout: directory + git on line 1; [user@host]$ on the input line (line 2).
# Colors come from the Pure theme (_pure_set_color / _pure_user_at_host).
set -g pure_symbol_prompt '$'
set -g pure_begin_prompt_with_current_directory true

function _pure_prompt_symbol --description 'Print [user@host] and prompt symbol' --argument-names exit_code
    set --local bracket (_pure_set_color $pure_color_mute)
    set --local user_host (_pure_user_at_host)
    set --local prompt_symbol (_pure_get_prompt_symbol)
    set --local symbol_color_success (_pure_set_color $pure_color_prompt_on_success)
    set --local symbol_color_error (_pure_set_color $pure_color_prompt_on_error)
    set --local command_succeed 0

    set --local symbol_color $symbol_color_success
    if set --query exit_code; and test "$exit_code" -ne $command_succeed
        set symbol_color $symbol_color_error

        if set --query pure_separate_prompt_on_error; and test "$pure_separate_prompt_on_error" = true
            set symbol_color "$symbol_color_error$prompt_symbol$symbol_color_success"
        end
    end

    echo -ns $bracket'['$user_host$bracket']'$symbol_color$prompt_symbol
end

function fish_greeting
end

set -gx BROWSER xdg-open

alias ls=betterls
alias gacap="git add . && git commit -a && git push"

set -gx SSH_AUTH_SOCK "$HOME/.var/app/com.bitwarden.desktop/data/.bitwarden-ssh-agent.sock"
set -gx R_ENVIRON_USER "$HOME/.config/R/Renviron"
set -gx R_PROFILE_USER "$HOME/.config/R/Rprofile"

function __history_previous_command
    switch (commandline -t)
        case "!"
            commandline -t $history[1]; commandline -f repaint
        case "*"
            commandline -i !
    end
end

function __history_previous_command_arguments
    switch (commandline -t)
        case "!"
            commandline -t ""
            commandline -f history-token-search-backward
        case "*"
            commandline -i '$'
    end
end

function __caret_expand
    set -l buf (commandline)
    if string match -qr '^\^[^\^]*$' -- $buf
        set -l old (string sub -s 2 -- $buf)
        if test -n "$old"
            set -l parts (string split -m 1 -- $old $history[1])
            if test (count $parts) -eq 2
                commandline -r -- "$parts[1]$parts[2]"
                commandline -C (string length -- "$parts[1]")
                return
            end
        end
    end
    commandline -i ^
end

if [ "$fish_key_bindings" = fish_vi_key_bindings ]
    bind -Minsert ^ __caret_expand
else
    bind ^ __caret_expand
end
