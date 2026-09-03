# fish_color_error/fish_color_match default to plain named ANSI colors
# (red/cyan), which come from whatever wallust generates for that slot.
# check_contrast in wallust.toml keeps those slots readable against the
# background, so it's safe to reference them directly here instead of
# pinning to a fixed hex.
set -g fish_color_error brred
set -g fish_color_match --background=brblue
