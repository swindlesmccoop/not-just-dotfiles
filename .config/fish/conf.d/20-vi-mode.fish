# Equivalent to bash `set -o vi`
fish_vi_key_bindings
fish_vi_cursor

# Bash-style !!, !$ and ^old^new expansion.
if test "$fish_key_bindings" = fish_vi_key_bindings
    bind -Minsert '!' __history_previous_command
    bind -Minsert '$' __history_previous_command_arguments
    bind -Minsert '^' __caret_expand
else
    bind '!' __history_previous_command
    bind '$' __history_previous_command_arguments
    bind '^' __caret_expand
end
