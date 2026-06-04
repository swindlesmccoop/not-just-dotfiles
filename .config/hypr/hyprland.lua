-- declarations --
local mainMod = "SUPER"
local terminal = "kitty"
local fileManager = "dolphin"
local menu = "wofi --show drun"
local lock = "hyprlock"

-- functions --
local function hypr_path(name)
	local xdg = os.getenv("XDG_CONFIG_HOME") or (os.getenv("HOME") .. "/.config")
	return xdg .. "/hypr/" .. name
end

local function load_browser()
	local f = io.open(hypr_path("browser.conf"), "r")
	if not f then
		return nil
	end
	local line = f:read("*l")
	f:close()
	if not line then
		return nil
	end
	return line:match("%$browser%s*=%s*(%S+)")
end

local browser = load_browser() or "firefox.desktop"

-- autostart --
hl.on("hyprland.start", function()
	hl.exec_cmd("/usr/bin/kwalletd6")
	hl.exec_cmd("/usr/lib/polkit-kde-authentication-agent-1")
	hl.exec_cmd("hypridle")
	hl.exec_cmd(
		[[sh -c 'echo "\$browser = $(xdg-settings get default-web-browser)" > ]]
			.. hypr_path("browser.conf")
			.. [[']]
	)
end)

-- conf --
hl.config({
	animations = {
		enabled = false,
	},
	cursor = {
		no_warps = true,
	},
	general = {
		layout = "master",
	},
	input = {
		touchpad = {
			natural_scroll = true,
			scroll_factor = 0.1,
		},
	},
	master = {
		new_status = "slave",
		new_on_top = true,
	},
})

-- binds --
hl.bind(mainMod .. " + Return", hl.dsp.exec_cmd(terminal))
hl.bind(mainMod .. " + Q", hl.dsp.window.close())
hl.bind(mainMod .. " + E", hl.dsp.exec_cmd(fileManager))
hl.bind(mainMod .. " + V", hl.dsp.window.float({ action = "toggle" }))
hl.bind(mainMod .. " + D", hl.dsp.exec_cmd(menu))
hl.bind(mainMod .. " + M", hl.dsp.layout("swapwithmaster"))
hl.bind(mainMod .. " + N", hl.dsp.exec_cmd("plasmawindowed org.kde.plasma.networkmanagement"))
hl.bind(mainMod .. " + B", hl.dsp.exec_cmd("gtk-launch " .. browser))

hl.bind(mainMod .. " + SHIFT + L", hl.dsp.exec_cmd(lock))
hl.bind(mainMod .. " + SHIFT + Q", function()
	if os.execute("command -v hyprshutdown >/dev/null 2>&1") then
		hl.exec_cmd("hyprshutdown")
	else
		hl.dispatch(hl.dsp.exit())
	end
end)

hl.bind(mainMod .. " + H", hl.dsp.layout("mfact -0.05"), { repeating = true })
hl.bind(mainMod .. " + L", hl.dsp.layout("mfact +0.05"), { repeating = true })
hl.bind(mainMod .. " + J", hl.dsp.layout("cyclenext"))
hl.bind(mainMod .. " + K", hl.dsp.layout("cycleprev"))

hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })
hl.bind(mainMod .. " + SHIFT + S", hl.dsp.exec_cmd("hyprshot -m region -o ~/Pictures/Screenshots"))
hl.bind(mainMod .. " + F", hl.dsp.window.fullscreen({ mode = "fullscreen", action = "toggle" }))
hl.bind(mainMod .. " + SHIFT + F", function()
	local w = hl.get_active_window()
	if not w then
		return
	end
	-- Fake fullscreen: tiled in Hyprland (internal 0), fullscreen for the app (client 2)
	if w.fullscreen == 0 and w.fullscreen_client == 2 then
		hl.dispatch(hl.dsp.window.fullscreen_state({ internal = 0, client = 0, action = "set" }))
	else
		hl.dispatch(hl.dsp.window.fullscreen_state({ internal = 0, client = 2, action = "set" }))
	end
end)

for i = 1, 9 do
	hl.bind(mainMod .. " + " .. i, hl.dsp.focus({ workspace = i }))
	hl.bind(mainMod .. " + SHIFT + " .. i, hl.dsp.window.move({ workspace = i }))
end

hl.bind(mainMod .. " + mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind(mainMod .. " + mouse_up", hl.dsp.focus({ workspace = "e-1" }))

-- media keys --
hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+"), {
	locked = true,
	repeating = true,
})

hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%-"), {
	locked = true,
	repeating = true,
})

hl.bind("XF86AudioMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"), { locked = true })
hl.bind("XF86AudioMicMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"), { locked = true })
hl.bind("XF86MonBrightnessUp", hl.dsp.exec_cmd("brightnessctl s 5%+"), { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl s 5%-"), { locked = true, repeating = true })
hl.bind("XF86AudioPlay", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioNext", hl.dsp.exec_cmd("playerctl next"), { locked = true })
hl.bind("XF86AudioPrev", hl.dsp.exec_cmd("playerctl previous"), { locked = true })

-- window rules --
hl.window_rule({
	name = "float-brave-default",
	match = { class = "^brave-.*-Default$" },
	float = true,
	center = true,
	size = { 400, 600 },
})

hl.window_rule({
	name = "float-plasmawindowed",
	match = { class = "^org\\.kde\\.plasmawindowed$" },
	float = true,
	center = true,
	size = { 400, 600 },
})