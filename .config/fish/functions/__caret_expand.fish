function __caret_expand --description 'Bash-style ^old^new expansion'
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
