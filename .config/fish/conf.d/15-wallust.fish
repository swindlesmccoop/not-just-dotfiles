if status is-interactive
    set -l wp_file ~/.config/variety/wallpaper/wallpaper.jpg.txt
    set -l cache ~/.cache/wallust/last-wallpaper

    if test -f $wp_file
        set -l current (cat $wp_file)
        set -l last ""
        if test -f $cache
            set last (cat $cache)
        end
        if test "$current" != "$last"
            printf "New wallpaper detected, generating palette..."
            wallust run -q "$current"
            printf "done.\n"
            mkdir -p (dirname $cache)
            echo "$current" > $cache
        end
    end

    if test -f ~/.cache/wallust/sequences
        cat ~/.cache/wallust/sequences
    end
end
