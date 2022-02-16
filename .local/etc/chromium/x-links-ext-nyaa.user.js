// ==UserScript==
// @name        X-links Extension - Nyaa.si
// @namespace   dnsev-h
// @author      dnsev-h
// @version     1.0.0.9
// @description Linkify and format nyaa.si links
// @include     http://boards.4chan.org/*
// @include     https://boards.4chan.org/*
// @include     http://boards.4channel.org/*
// @include     https://boards.4channel.org/*
// @include     http://8ch.net/*
// @include     https://8ch.net/*
// @include     https://archived.moe/*
// @include     https://boards.fireden.net/*
// @include     http://desuarchive.org/*
// @include     https://desuarchive.org/*
// @include     http://fgts.jp/*
// @include     https://fgts.jp/*
// @include     http://boards.38chan.net/*
// @include     http://forums.e-hentai.org/*
// @include     https://forums.e-hentai.org/*
// @include     https://meguca.org/*
// @homepage    https://dnsev-h.github.io/x-links/
// @supportURL  https://github.com/dnsev-h/x-links/issues
// @updateURL   https://raw.githubusercontent.com/dnsev-h/x-links/stable/builds/x-links-ext-nyaa.meta.js
// @downloadURL https://raw.githubusercontent.com/dnsev-h/x-links/stable/builds/x-links-ext-nyaa.user.js
// @icon        data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAA4klEQVR4Ae2ZoQ7CMBRF+VIMBjGDwSAwmImZGcQUYoYPq32fAPK8LCSleZCmzb3JcUtzD+ndBDslHuVVQr0zJdCAQHoaQEggTQYj9C8ggRVCAqPBDfoUkMBq8HAs4J8vLZ2uEH/VSqC6QEZmMbg7ZgiWzu2wJQEJZGRmgwn+cNf9jxXcRn0BCZA/33VKb848OfbQioAEikqni+MMpRugdGADFQQkEL7rlN7c3QG+2EZgrPUEJPD7V+RgcHQcoGAXDQlIoLx0/kxKhwbahoAEPn5ZYwKU7ldAAvqLSQLNRlEU5Q1O5fOjZV4u4AAAAABJRU5ErkJggg==
// @icon64      data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAOVBMVEUBAAAAAADmce/ml+/mje/mku/mhO/mY+/mbO/mdu/me+/mie/mXu/mm+/mpe/mf+/mqu/maO/moe9+hYmYAAAAAXRSTlMAQObYZgAAAJRJREFUeF7t1zkOAzEMBEFRe9+2//9YtzOCIOR8oEoX7GCgZEtXigWtb8qBF36ywIgD8gHcyAIHZqgHbnxwwRCPH1igEvCRCwMmZMd+cKVAjEwY0RpvgDkKAe/feANmVJxQC8TjHRssqDBHI5CPt6FihR8zjicQaD6eFW8sMEcxEI99fEG2vFrgwY4scEI/0P8X0HVf06IrwbJZHiwAAAAASUVORK5CYII=
// @grant       none
// @run-at      document-start
// ==/UserScript==
(function () {
	"use strict";

	/*#{begin_debug:timing=true}#*/

	var xlinks_api = (function () {
		"use strict";

		// Private
		var ready = (function () {

			var callbacks = [],
				check_interval = null,
				check_interval_time = 250;

			var callback_check = function () {
				if (
					(document.readyState === "interactive" || document.readyState === "complete") &&
					callbacks !== null
				) {
					var cbs = callbacks,
						cb_count = cbs.length,
						i;

					callbacks = null;

					for (i = 0; i < cb_count; ++i) {
						cbs[i].call(null);
					}

					window.removeEventListener("load", callback_check, false);
					window.removeEventListener("DOMContentLoaded", callback_check, false);
					document.removeEventListener("readystatechange", callback_check, false);

					if (check_interval !== null) {
						clearInterval(check_interval);
						check_interval = null;
					}

					return true;
				}

				return false;
			};

			window.addEventListener("load", callback_check, false);
			window.addEventListener("DOMContentLoaded", callback_check, false);
			document.addEventListener("readystatechange", callback_check, false);

			return function (cb) {
				if (callbacks === null) {
					cb.call(null);
				}
				else {
					callbacks.push(cb);
					if (check_interval === null && callback_check() !== true) {
						check_interval = setInterval(callback_check, check_interval_time);
					}
				}
			};

		})();

		var ttl_1_hour = 60 * 60 * 1000;
		var ttl_1_day = 24 * ttl_1_hour;
		var ttl_1_year = 365 * ttl_1_day;

		var cache_prefix = "";
		var cache_storage = window.localStorage;
		var cache_set = function (key, data, ttl) {
			cache_storage.setItem(cache_prefix + "ext-" + key, JSON.stringify({
				expires: Date.now() + ttl,
				data: data
			}));
		};
		var cache_get = function (key) {
			var json = parse_json(cache_storage.getItem(cache_prefix + "ext-" + key), null);

			if (
				json !== null &&
				typeof(json) === "object" &&
				Date.now() < json.expires &&
				typeof(json.data) === "object"
			) {
				return json.data;
			}

			cache_storage.removeItem(key);
			return null;
		};

		var random_string_alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var random_string = function (count) {
			var alpha_len = random_string_alphabet.length,
				s = "",
				i;
			for (i = 0; i < count; ++i) {
				s += random_string_alphabet[Math.floor(Math.random() * alpha_len)];
			}
			return s;
		};

		var is_object = function (obj) {
			return (obj !== null && typeof(obj) === "object");
		};

		var get_regex_flags = function (regex) {
			var s = "";
			if (regex.global) s += "g";
			if (regex.ignoreCase) s += "i";
			if (regex.multiline) s += "m";
			return s;
		};

		var create_temp_storage = function () {
			var data = {};

			var fn = {
				length: 0,
				key: function (index) {
					return Object.keys(data)[index];
				},
				getItem: function (key) {
					if (Object.prototype.hasOwnProperty.call(data, key)) {
						return data[key];
					}
					return null;
				},
				setItem: function (key, value) {
					if (!Object.prototype.hasOwnProperty.call(data, key)) {
						++fn.length;
					}
					data[key] = value;
				},
				removeItem: function (key) {
					if (Object.prototype.hasOwnProperty.call(data, key)) {
						delete data[key];
						--fn.length;
					}
				},
				clear: function () {
					data = {};
					fn.length = 0;
				}
			};

			return fn;
		};

		var set_shared_node = function (node) {
			var par = document.querySelector(".xl-extension-sharing-elements"),
				id = random_string(32);

			if (par === null) {
				par = document.createElement("div");
				par.className = "xl-extension-sharing-elements";
				par.style.setProperty("display", "none", "important");
				document.body.appendChild(par);
			}

			try {
				node.setAttribute("data-xl-sharing-id", id);
				par.appendChild(node);
			}
			catch (e) {
				return null;
			}

			return id;
		};

		var settings_descriptor_info_normalize = function (input) {
			var info = {},
				opt, label, desc, a, i, ii, v;

			if (typeof(input.type) === "string") {
				info.type = input.type;
			}
			if (Array.isArray((a = input.options))) {
				info.options = [];
				for (i = 0, ii = a.length; i < ii; ++i) {
					v = a[i];
					if (
						Array.isArray(v) &&
						v.length >= 2 &&
						typeof((label = v[1])) === "string"
					) {
						opt = [ v[0], v[1] ];
						if (typeof((desc = v[2])) === "string") {
							opt.push(desc);
						}
						info.options.push(opt);
					}
				}
			}

			return info;
		};

		var config = {};


		var CommunicationChannel = function (name, key, is_extension, channel, callback) {
			var self = this;

			this.port = null;
			this.port_other = null;
			this.post = null;
			this.on_message = null;
			this.origin = null;
			this.name_key = null;
			this.is_extension = is_extension;
			this.name = name;
			this.key = key;
			this.callback = callback;

			if (channel === null) {
				this.name_key = name;
				if (key !== null) {
					this.name_key += "_";
					this.name_key += key;
				}
				this.origin = window.location.protocol + "//" + window.location.host;
				this.post = this.post_window;
				this.on_message = function (event) {
					self.on_window_message(event);
				};
				window.addEventListener("message", this.on_message, false);
			}
			else {
				this.port = channel.port1;
				this.port_other = channel.port2;
				this.post = this.post_channel;
				this.on_message = function (event) {
					self.on_port_message(event);
				};
				this.port.addEventListener("message", this.on_message, false);
				this.port.start();
			}
		};

		CommunicationChannel.prototype.post_window = function (message, transfer) {
			var msg = {
				ext: this.is_extension,
				key: this.name_key,
				data: message
			};

			try {
				window.postMessage(msg, this.origin, transfer);
			}
			catch (e) {
				// Tampermonkey bug
				try {
					unsafeWindow.postMessage(msg, this.origin, transfer);
				}
				catch (e2) {}
			}
		};
		CommunicationChannel.prototype.post_channel = function (message, transfer) {
			this.port.postMessage(message, transfer);
		};
		CommunicationChannel.prototype.post_null = function () {
		};
		CommunicationChannel.prototype.on_window_message = function (event) {
			var data = event.data;
			if (
				event.origin === this.origin &&
				is_object(data) &&
				data.ext === (!this.is_extension) && // jshint ignore:line
				data.key === this.name_key &&
				is_object((data = data.data))
			) {
				this.callback(event, data, this);
			}
		};
		CommunicationChannel.prototype.on_port_message = function (event) {
			var data = event.data;
			if (is_object(data)) {
				this.callback(event, data, this);
			}
		};
		CommunicationChannel.prototype.close = function () {
			if (this.on_message !== null) {
				if (this.port === null) {
					window.removeEventListener("message", this.on_message, false);
				}
				else {
					this.port.removeEventListener("message", this.on_message, false);
					this.port.close();
					this.port = null;
				}
				this.on_message = null;
				this.post = this.post_null;
			}
		};


		var api = null;
		var API = function () {
			this.event = null;
			this.reply_callbacks = {};

			this.init_state = 0;

			this.handlers = API.handlers_init;
			this.functions = {};
			this.url_info_functions = {};
			this.url_info_to_data_functions = {};
			this.details_functions = {};
			this.actions_functions = {};

			var self = this;
			this.channel = new CommunicationChannel(
				"xlinks_broadcast",
				null,
				true,
				null,
				function (event, data, channel) {
					self.on_message(event, data, channel, {});
				}
			);
		};
		API.prototype.on_message = function (event, data, channel, handlers) {
			var action = data.xlinks_action,
				action_is_null = (action === null),
				action_data, reply, fn, err;

			if (
				(action_is_null || typeof(action) === "string") &&
				is_object((action_data = data.data))
			) {
				reply = data.reply;
				if (typeof(reply) === "string") {
					if (Object.prototype.hasOwnProperty.call(this.reply_callbacks, reply)) {
						fn = this.reply_callbacks[reply];
						delete this.reply_callbacks[reply];
						this.event = event;
						fn.call(this, null, action_data);
						this.event = null;
					}
					else {
						err = "Cannot reply to extension";
					}
				}
				else if (action_is_null) {
					err = "Missing extension action";
				}
				else if (Object.prototype.hasOwnProperty.call(handlers, action)) {
					handlers[action].call(this, action_data, channel, data.id);
				}
				else {
					err = "Invalid extension call";
				}

				if (err !== undefined && typeof((reply = data.id)) === "string") {
					this.send(
						channel,
						null,
						reply,
						{ err: "Invalid extension call" }
					);
				}
			}
		};
		API.prototype.send = function (channel, action, reply_to, data, timeout_delay, on_reply) {
			var self = this,
				id = null,
				timeout = null,
				cb, i;

			if (on_reply !== undefined) {
				for (i = 0; i < 10; ++i) {
					id = random_string(32);
					if (!Object.prototype.hasOwnProperty.call(this.reply_callbacks)) break;
				}

				cb = function () {
					if (timeout !== null) {
						clearTimeout(timeout);
						timeout = null;
					}

					on_reply.apply(this, arguments);
				};

				this.reply_callbacks[id] = cb;
				cb = null;

				if (timeout_delay >= 0) {
					timeout = setTimeout(function () {
						timeout = null;
						delete self.reply_callbacks[id];
						on_reply.call(self, "Response timeout");
					}, timeout_delay);
				}
			}

			channel.post({
				xlinks_action: action,
				data: data,
				id: id,
				reply: reply_to
			});
		};
		API.prototype.reply_error = function (channel, reply_to, err) {
			channel.post({
				xlinks_action: null,
				data: { err: err },
				id: null,
				reply: reply_to
			});
		};
		API.prototype.post_message = function (msg) {
			try {
				window.postMessage(msg, this.origin);
			}
			catch (e) {
				// Tampermonkey bug
				try {
					unsafeWindow.postMessage(msg, this.origin);
				}
				catch (e2) {
					console.log("window.postMessage failed! Your userscript manager may need to be updated!");
					console.log("window.postMessage exception:", e, e2);
				}
			}
		};
		API.prototype.init = function (info, callback) {
			if (this.init_state !== 0) {
				if (typeof(callback) === "function") callback.call(null, this.init_state === 1 ? "Init active" : "Already started");
				return;
			}

			this.init_state = 1;

			var self = this,
				de = document.documentElement,
				count = info.registrations,
				namespace = info.namespace || "",
				send_info = {
					namespace: namespace
				},
				a, v, i;

			if (typeof((v = info.name)) === "string") send_info.name = v;
			if (typeof((v = info.author)) === "string") send_info.author = v;
			if (typeof((v = info.description)) === "string") send_info.description = v;
			if (Array.isArray((v = info.version))) {
				for (i = 0; i < v.length; ++i) {
					if (typeof(v[i]) !== "number") break;
				}
				if (i === v.length) send_info.version = v.slice(0);
			}

			if (typeof(count) !== "number" || count < 0) {
				count = 1;
			}

			send_info.registrations = count;

			send_info.main = (typeof(info.main) === "function") ? info.main.toString() : null;

			if (de) {
				a = de.getAttribute("data-xlinks-extensions-waiting");
				a = (a ? (parseInt(a, 10) || 0) : 0) + count;
				de.setAttribute("data-xlinks-extensions-waiting", a);
				de = null;
			}

			ready(function () {
				self.send(
					self.channel,
					"init",
					null,
					send_info,
					10000,
					function (err, data) {
						err = self.on_init(err, data, namespace);
						if (err === "Internal") {
							self.channel.close();
							this.init_state = 3;
						}
						if (typeof(callback) === "function") callback.call(null, err);
					}
				);
			});
		};
		API.prototype.on_init = function (err, data, namespace) {
			var self = this,
				api_key, ch, v;

			if (err === null) {
				if (!is_object(data)) {
					err = "Could not generate extension key";
				}
				else if (typeof((err = data.err)) !== "string") {
					if (typeof((api_key = data.key)) !== "string") {
						err = "Could not generate extension key";
					}
					else {
						// Valid
						err = null;

						if (typeof((v = data.cache_prefix)) === "string") {
							cache_prefix = v;
						}
						if (typeof((v = data.cache_mode)) === "string") {
							if (v === "session") {
								cache_storage = window.sessionStorage;
							}
							else if (v === "none") {
								cache_storage = create_temp_storage();
							}
						}

						// New channel
						ch = (this.event.ports && this.event.ports.length === 1) ? {
							port1: this.event.ports[0],
							port2: null
						} : null;

						this.channel.close();
						this.channel = new CommunicationChannel(
							namespace,
							api_key,
							true,
							ch,
							function (event, data, channel) {
								self.on_message(event, data, channel, API.handlers);
							}
						);
					}
				}
			}

			this.init_state = (err === null) ? 2 : 0;
			return err;
		};
		API.prototype.register = function (data, callback) {
			if (this.init_state !== 2) {
				if (typeof(callback) === "function") callback.call(null, "API not init'd", 0);
				return;
			}

			// Data
			var send_data = {
				settings: {},
				request_apis: [],
				linkifiers: [],
				commands: [],
				create_url: null
			};

			var request_apis_response = [],
				command_fns = [],
				array, entry, fn_map, a_data, a, i, ii, k, o, v;

			// Settings
			o = data.settings;
			if (is_object(o)) {
				for (k in o) {
					a = o[k];
					if (Array.isArray(a)) {
						send_data.settings[k] = a_data = [];
						for (i = 0, ii = a.length; i < ii; ++i) {
							v = a[i];
							if (Array.isArray(v) && typeof(v[0]) === "string") {
								entry = [ v[0] ];
								if (v.length > 1) {
									entry.push(
										(v[1] === undefined ? null : v[1]),
										"" + (v[2] || ""),
										"" + (v[3] || "")
									);
									if (v.length > 4 && is_object(v[4])) {
										entry.push(settings_descriptor_info_normalize(v[4]));
									}
								}
								a_data.push(entry);
							}
						}
					}
				}
			}

			// Request APIs
			array = data.request_apis;
			if (Array.isArray(array)) {
				for (i = 0, ii = array.length; i < ii; ++i) {
					a = array[i];
					fn_map = {};
					a_data = {
						group: "other",
						namespace: "other",
						type: "other",
						count: 1,
						concurrent: 1,
						delays: { okay: 200, error: 5000 },
						functions: []
					};
					if (typeof((v = a.group)) === "string") a_data.group = v;
					if (typeof((v = a.namespace)) === "string") a_data.namespace = v;
					if (typeof((v = a.type)) === "string") a_data.type = v;
					if (typeof((v = a.count)) === "number") a_data.count = Math.max(1, v);
					if (typeof((v = a.concurrent)) === "number") a_data.concurrent = Math.max(1, v);
					if (typeof((v = a.delay_okay)) === "number") a_data.delay_okay = Math.max(0, v);
					if (typeof((v = a.delay_error)) === "number") a_data.delay_error = Math.max(0, v);
					if (is_object((o = a.functions))) {
						for (k in o) {
							v = o[k];
							if (typeof(v) === "function") {
								a_data.functions.push(k);
								fn_map[k] = v;
							}
						}
					}

					request_apis_response.push({
						functions: fn_map
					});
					send_data.request_apis.push(a_data);
				}
			}

			// Linkifiers
			array = data.linkifiers;
			if (Array.isArray(array)) {
				for (i = 0, ii = array.length; i < ii; ++i) {
					a = array[i];
					a_data = {
						regex: null,
						prefix_group: 0,
						prefix: ""
					};

					v = a.regex;
					if (typeof(v) === "string") {
						a_data.regex = [ v ];
					}
					else if (v instanceof RegExp) {
						a_data.regex = [ v.source, get_regex_flags(v) ];
					}
					else if (Array.isArray(v)) {
						if (typeof(v[0]) === "string") {
							if (typeof(v[1]) === "string") {
								a_data.regex = [ v[0], v[1] ];
							}
							else {
								a_data.regex = [ v[0] ];
							}
						}
					}

					if (typeof((v = a.prefix_group)) === "number") a_data.prefix_group = v;
					if (typeof((v = a.prefix)) === "string") a_data.prefix = v;

					send_data.linkifiers.push(a_data);
				}
			}

			// URL info functions
			array = data.commands;
			if (Array.isArray(array)) {
				for (i = 0, ii = array.length; i < ii; ++i) {
					a = array[i];
					a_data = {
						url_info: false,
						to_data: false,
						actions: false,
						details: false
					};
					o = {
						url_info: null,
						to_data: null,
						actions: null,
						details: null
					};

					if (typeof((v = a.url_info)) === "function") {
						a_data.url_info = true;
						o.url_info = v;
					}
					if (typeof((v = a.to_data)) === "function") {
						a_data.to_data = true;
						o.to_data = v;
					}
					if (typeof((v = a.actions)) === "function") {
						a_data.actions = true;
						o.actions = v;
					}
					if (typeof((v = a.details)) === "function") {
						a_data.details = true;
						o.details = v;
					}

					command_fns.push(o);
					send_data.commands.push(a_data);
				}
			}

			// URL create functions
			o = data.create_url;
			if (is_object(o)) {
				send_data.create_url = o;
			}

			// Send
			this.send(
				this.channel,
				"register",
				null,
				send_data,
				10000,
				function (err, data) {
					var o;
					if (err !== null || (err = data.err) !== null) {
						if (typeof(callback) === "function") callback.call(null, err, 0);
					}
					else if (!is_object((o = data.response))) {
						if (typeof(callback) === "function") callback.call(null, "Invalid extension response", 0);
					}
					else {
						var okay = this.register_complete(o, request_apis_response, command_fns, send_data.settings);
						if (typeof(callback) === "function") callback.call(null, null, okay);
					}
				}
			);
		};
		API.prototype.register_complete = function (data, request_apis, command_fns, settings) {
			var reg_count = 0,
				setting_ns, errors, name, fn, e, o, i, ii, k, v;

			// Request APIs
			errors = [];
			i = 0;
			if (Array.isArray((o = data.request_apis))) {
				for (ii = o.length; i < ii; ++i) {
					e = o[i];
					if (i >= request_apis.length) {
						errors.push("Invalid");
					}
					else if (typeof(e) === "string") {
						errors.push(e);
					}
					else if (!is_object(e)) {
						errors.push("Invalid");
					}
					else {
						++reg_count;
						for (k in e) {
							if (Object.prototype.hasOwnProperty.call(e, k) && Object.prototype.hasOwnProperty.call(request_apis[i].functions, k)) {
								fn = request_apis[i].functions[k];
								this.functions[e[k]] = fn;
							}
						}
					}
				}
			}
			for (ii = request_apis.length; i < ii; ++i) {
				errors.push("Invalid");
			}

			// URL infos
			errors = [];
			i = 0;
			if (Array.isArray((o = data.commands))) {
				for (ii = o.length; i < ii; ++i) {
					e = o[i];
					if (i >= command_fns.length) {
						errors.push("Invalid");
					}
					else if (typeof(e) === "string") {
						errors.push(e);
					}
					else if (!is_object(e) || typeof((k = e.id)) !== "string") {
						errors.push("Invalid");
					}
					else {
						++reg_count;
						this.url_info_functions[k] = command_fns[i].url_info;
						this.url_info_to_data_functions[k] = command_fns[i].to_data;
						if (command_fns[i].actions !== null) this.actions_functions[k] = command_fns[i].actions;
						if (command_fns[i].details !== null) this.details_functions[k] = command_fns[i].details;
					}
				}
			}
			for (ii = command_fns.length; i < ii; ++i) {
				errors.push("Invalid");
			}

			// Settings
			for (k in settings) {
				setting_ns = settings[k];
				for (i = 0, ii = setting_ns.length; i < ii; ++i) {
					name = setting_ns[i][0];
					if (
						!is_object(data.settings) ||
						!is_object((o = data.settings[k])) ||
						(v = o[name]) === undefined
					) {
						v = (setting_ns[i].length > 1) ? setting_ns[i][1] : false;
					}

					o = config[k];
					if (o === undefined) config[k] = o = {};
					o[name] = v;
				}
			}

			return reg_count;
		};

		API.handlers_init = {};
		API.handlers = {
			request_end: function (data) {
				var id = data.id;
				if (typeof(id) === "string") {
					// Remove request
					delete requests_active[id];
				}
			},
			api_function: function (data, channel, reply) {
				var self = this,
					req = null,
					state, id, args, fn, ret;

				if (
					typeof((id = data.id)) !== "string" ||
					!Array.isArray((args = data.args))
				) {
					// Error
					this.reply_error(channel, reply, "Invalid extension data");
					return;
				}

				// Exists
				if (!Array.prototype.hasOwnProperty.call(this.functions, id)) {
					// Error
					this.reply_error(channel, reply, "Invalid extension function");
					return;
				}
				fn = this.functions[id];

				// State
				if (is_object((state = data.state))) {
					id = state.id;
					req = requests_active[id];
					if (req === undefined) {
						requests_active[id] = req = new Request();
					}
					load_request_state(req, state);
				}

				// Callback
				args = Array.prototype.slice.call(args);
				args.push(function () {
					// Err
					var i = 0,
						ii = arguments.length,
						arguments_copy = new Array(ii);

					for (; i < ii; ++i) arguments_copy[i] = arguments[i];

					self.send(
						channel,
						null,
						reply,
						{
							err: null,
							args: arguments_copy
						}
					);
				});

				// Call
				ret = fn.apply(req, args);
			},
			url_info: function (data, channel, reply) {
				var self = this,
					id, url, fn;

				if (
					typeof((id = data.id)) !== "string" ||
					typeof((url = data.url)) !== "string"
				) {
					// Error
					this.reply_error(channel, reply, "Invalid extension data");
					return;
				}

				// Exists
				if (!Array.prototype.hasOwnProperty.call(this.url_info_functions, id)) {
					// Error
					this.reply_error(channel, reply, "Invalid extension function");
					return;
				}
				fn = this.url_info_functions[id];

				// Call
				fn(url, function (err, data) {
					self.send(
						channel,
						null,
						reply,
						{
							err: err,
							data: data
						}
					);
				});
			},
			url_info_to_data: function (data, channel, reply) {
				var self = this,
					id, url_info;

				if (
					typeof((id = data.id)) !== "string" ||
					!is_object((url_info = data.url))
				) {
					// Error
					this.reply_error(channel, reply, "Invalid extension data");
					return;
				}

				// Exists
				if (!Array.prototype.hasOwnProperty.call(this.url_info_to_data_functions, id)) {
					// Error
					this.reply_error(channel, reply, "Invalid extension function");
					return;
				}

				// Call
				this.url_info_to_data_functions[id](url_info, function (err, data) {
					self.send(
						channel,
						null,
						reply,
						{
							err: err,
							data: data
						}
					);
				});
			},
			create_actions: function (data, channel, reply) {
				var self = this,
					id, fn_data, fn_info;

				if (
					typeof((id = data.id)) !== "string" ||
					!is_object((fn_data = data.data)) ||
					!is_object((fn_info = data.info))
				) {
					// Error
					this.reply_error(channel, reply, "Invalid extension data");
					return;
				}

				// Exists
				if (!Array.prototype.hasOwnProperty.call(this.actions_functions, id)) {
					// Error
					this.reply_error(channel, reply, "Invalid extension function");
					return;
				}

				// Call
				this.actions_functions[id](fn_data, fn_info, function (err, data) {
					self.send(
						channel,
						null,
						reply,
						{
							err: err,
							data: data
						}
					);
				});
			},
			create_details: function (data, channel, reply) {
				var self = this,
					id, fn_data, fn_info;

				if (
					typeof((id = data.id)) !== "string" ||
					!is_object((fn_data = data.data)) ||
					!is_object((fn_info = data.info))
				) {
					// Error
					this.reply_error(channel, reply, "Invalid extension data");
					return;
				}

				// Exists
				if (!Array.prototype.hasOwnProperty.call(this.details_functions, id)) {
					// Error
					this.reply_error(channel, reply, "Invalid extension function");
					return;
				}

				// Call
				this.details_functions[id](fn_data, fn_info, function (err, data) {
					self.send(
						channel,
						null,
						reply,
						{
							err: err,
							data: set_shared_node(data)
						}
					);
				});
			},
		};

		var RequestErrorMode = {
			None: 0,
			NoCache: 1,
			Save: 2
		};

		var ImageFlags = {
			None: 0x0,
			NoLeech: 0x1
		};

		var requests_active = {};
		var Request = function () {
		};

		var load_request_state = function (request, state) {
			for (var k in state) {
				request[k] = state[k];
			}
		};


		// Public
		var init = function (info, callback) {
			if (api === null) api = new API();
			api.init(info, callback);
		};

		var register = function (data, callback) {
			if (api === null) {
				callback.call(null, "API not init'd", 0);
				return;
			}

			api.register(data, callback);
		};

		var request = function (namespace, type, unique_id, info, callback) {
			if (api === null || api.init_state !== 2) {
				callback.call(null, "API not init'd", null);
				return;
			}

			api.send(
				api.channel,
				"request",
				null,
				{
					namespace: namespace,
					type: type,
					id: unique_id,
					info: info
				},
				-1,
				function (err, data) {
					if (err !== null || (err = data.err) !== null) {
						data = null;
					}
					else if ((data = data.data) === null) {
						err = "Invalid extension data";
					}
					callback.call(null, err, data);
				}
			);
		};

		var insert_styles = function (styles) {
			var head = document.head,
				n;
			if (head) {
				n = document.createElement("style");
				n.textContent = styles;
				head.appendChild(n);
			}
		};

		var parse_json = function (text, def) {
			try {
				return JSON.parse(text);
			}
			catch (e) {}
			return def;
		};
		var parse_html = function (text, def) {
			try {
				return new DOMParser().parseFromString(text, "text/html");
			}
			catch (e) {}
			return def;
		};
		var parse_xml = function (text, def) {
			try {
				return new DOMParser().parseFromString(text, "text/xml");
			}
			catch (e) {}
			return def;
		};

		var get_domain = function (url) {
			var m = /^(?:[\w\-]+):\/*((?:[\w\-]+\.)*)([\w\-]+\.[\w\-]+)/i.exec(url);
			return (m === null) ? [ "", "" ] : [ m[1].toLowerCase(), m[2].toLowerCase() ];
		};

		var get_image = function (url, flags, callback) {
			if (api === null || api.init_state !== 2) {
				callback.call(null, "API not init'd", null);
				return;
			}

			// Send
			api.send(
				api.channel,
				"get_image",
				null,
				{ url: url, flags: flags },
				10000,
				function (err, data) {
					if (err !== null) {
						data = null;
					}
					else if (!is_object(data)) {
						err = "Invalid data";
					}
					else if (typeof((err = data.err)) !== "string" && typeof((data = data.url)) !== "string") {
						data = null;
						err = "Invalid data";
					}

					callback.call(null, err, data);
				}
			);
		};


		// Exports
		return {
			RequestErrorMode: RequestErrorMode,
			ImageFlags: ImageFlags,
			init: init,
			config: config,
			register: register,
			request: request,
			get_image: get_image,
			insert_styles: insert_styles,
			parse_json: parse_json,
			parse_html: parse_html,
			parse_xml: parse_xml,
			get_domain: get_domain,
			random_string: random_string,
			is_object: is_object,
			ttl_1_hour: ttl_1_hour,
			ttl_1_day: ttl_1_day,
			ttl_1_year: ttl_1_year,
			cache_set: cache_set,
			cache_get: cache_get
		};

	})();

	var main = function main_fn(xlinks_api) {

	var $$ = function (selector, root) {
		return (root || document).querySelectorAll(selector);
	};
	var $ = (function () {

		var d = document;

		var Module = function (selector, root) {
			return (root || d).querySelector(selector);
		};

		Module.add = function (parent, child) {
			return parent.appendChild(child);
		};
		Module.tnode = function (text) {
			return d.createTextNode(text);
		};
		Module.node = function (tag, class_name, text) {
			var elem = d.createElement(tag);
			elem.className = class_name;
			if (text !== undefined) {
				elem.textContent = text;
			}
			return elem;
		};
		Module.node_ns = function (namespace, tag, class_name) {
			var elem = d.createElementNS(namespace, tag);
			elem.setAttribute("class", class_name);
			return elem;
		};
		Module.node_simple = function (tag) {
			return d.createElement(tag);
		};

		return Module;

	})();

	var re_html = /[<>&]/g,
		re_html_full = /[<>&'"]/g,
		html_replace_map = {
			"<": "&lt;",
			">": "&gt;",
			"&": "&amp;",
			"'": "&apos;",
			"\"": "&quot"
		};

	var escape_html = function (text, regex) {
		return text.replace(regex, function (m) {
			return html_replace_map[m];
		});
	};

	var innerhtml_to_safe_text = function (node) {
		var text = "",
			tag_stack = [],
			children, par, next, n, t;

		par = node;
		n = par.firstChild;
		if (n === null) return text;

		done:
		while (true) {
			if (n.nodeType === Node.ELEMENT_NODE) {
				// Format tags
				children = false;
				if (n.tagName === "DIV" || n.tagName === "SPAN") {
					children = true;
				}
				else if (n.tagName === "B" || n.tagName === "I") {
					t = n.tagName.toLowerCase();
					text += "<" + t + ">";
					tag_stack.push(n, "</" + t + ">");
					children = true;
				}
				else if (n.tagName === "BR") {
					text += "<br />";
				}
				else if (n.tagName === "A") {
					text += "<a href=\"" + escape_html(n.getAttribute("href") || "", re_html_full) + "\">";
					tag_stack.push(n, "</a>");
					children = true;
				}
				else if (n.tagName === "INPUT") {
					if (n.getAttribute("type") === "button") {
						text += "<button>" + escape_html(n.getAttribute("value") || "", re_html) + "</button>";
					}
				}
				else if (n.tagName === "IMG") {
					text += "[Image] ";
				}

				// Visit children
				if (children) {
					par = n;
					n = n.firstChild;
				}
				else {
					n = n.nextSibling;
				}
			}
			else {
				// Text node or other
				next = n.nextSibling;
				if (n.nodeType === Node.TEXT_NODE) {
					// Update text
					text += escape_html(n.nodeValue, re_html);
				}
				n = next;
			}

			// Next node
			while (n === null) {
				n = par;
				if (n === node) break done;

				if (tag_stack.length > 0) {
					if (n === tag_stack[tag_stack.length - 2]) {
						text += tag_stack[tag_stack.length - 1];
						tag_stack.splice(tag_stack.length - 2, 2);
					}
				}

				par = n.parentNode;
				n = n.nextSibling;
			}
		}

		return text;
	};
	var apply_safe_text_to_node = function (node, safe_text) {
		// Safe version of: node.innerHTML = safe_text;
		// Cannot inject any <script> tags or similar
		var re_start = /&(\w+);|<(\/?)([\w\-]+)/g,
			re_attr = /\s*(\/?)>|\s*([\w\-]+)="([^"]*)"/g,
			re_entity = /&(\w+);/g,
			pos = 0,
			text = "",
			parents = [ node ],
			current = node,
			attrs, close, auto_close, a, m, k, t, n;

		var entity_replace_fn = function (m, entity) {
			var e = apply_safe_text_to_node.entities[entity];
			return (e === undefined) ? m : e;
		};

		while (true) {
			re_start.lastIndex = pos;
			m = re_start.exec(safe_text);
			if (m === null) break;

			text += safe_text.substr(pos, m.index - pos);
			pos = re_start.lastIndex;

			if ((k = m[1]) !== undefined) {
				if ((t = apply_safe_text_to_node.entities[k]) === undefined) {
					t = m[0];
				}
			}
			else {
				k = m[3];
				if ((t = apply_safe_text_to_node.tags[k]) === undefined) {
					t = m[0];
				}
				else {
					attrs = {};
					close = (m[2].length > 0);
					auto_close = (t === null);

					while (true) {
						re_attr.lastIndex = pos;
						m = re_attr.exec(safe_text);

						if (m === null) {
							pos = safe_text.length;
							break;
						}

						pos = re_attr.lastIndex;

						if (m[1] !== undefined) {
							auto_close = (m[1].length > 0);
							break;
						}

						attrs[m[2]] = m[3].replace(re_entity, entity_replace_fn);
					}

					if (text.length > 0) {
						current.appendChild(document.createTextNode(text));
						text = "";
					}

					if (close) {
						if (parents.length > 1) {
							parents.pop();
							current = parents[parents.length - 1];
						}
					}
					else {
						n = document.createElement(k);
						if (t !== null) {
							for (k in t) {
								a = attrs[k];
								if (a !== undefined) {
									n.setAttribute(k, a);
								}
							}
						}

						current.appendChild(n);

						if (!auto_close) {
							parents.push(n);
							current = n;
						}
					}

					continue;
				}
			}

			text += t;
		}

		text += safe_text.substr(pos);
		if (text.length > 0) {
			current.appendChild(document.createTextNode(text));
		}
	};
	apply_safe_text_to_node.tags = {
		a: { href: true },
		b: {},
		i: {},
		br: null,
		button: {},
	};
	apply_safe_text_to_node.entities = {
		"lt": "<",
		"gt": ">",
		"amp": "&",
		"apos": "'",
		"quot": "\""
	};

	var table_info_fns = {
		submitter: function (node, data) {
			var n = $("a", node),
				m;
			if (n !== null) {
				data.uploader = n.textContent.trim();
				if ((m = /user=(\d+)/.exec(n.getAttribute("href"))) !== null) {
					data.uploader_id = parseInt(m[1], 10);
				}
				if ((n = $("span", n)) !== null) {
					m = n.getAttribute("href") || "";
					if (/color:\s*green/i.test(m)) {
						data.uploader_class = "trusted";
					}
					else if (/color:\s*#4169E1/i.test(m)) {
						data.uploader_class = "admin";
					}
				}
			}
		},
		information: function (node, data) {
			data.information = innerhtml_to_safe_text(node);
		},
		stardom: function (node, data) {
			var n = node.querySelector("b");
			if (n !== null) {
				data.fans = parseInt(n.textContent.trim(), 10) || 0;
			}
		},
		date: function (node, data) {
			var m = /(\d+)-(\d+)-(\d+),\s*(\d+):(\d+)/.exec(node.textContent);
			if (m !== null) {
				data.date_created = new Date(
					parseInt(m[1], 10),
					parseInt(m[2], 10) - 1,
					parseInt(m[3], 10),
					parseInt(m[4], 10),
					parseInt(m[5], 10),
					0,
					0
				).getTime();
			}
		},
		seeders: function (node, data) {
			if ($("b", node) !== null) {
				data.seeders = -1;
			}
			else {
				data.seeders = parseInt(node.textContent.trim(), 10) || 0;
			}
		},
		leechers: function (node, data) {
			if ($("b", node) !== null) {
				data.leechers = -1;
			}
			else {
				data.leechers = parseInt(node.textContent.trim(), 10) || 0;
			}
		},
		downloads: function (node, data) {
			data.downloads = parseInt(node.textContent.trim(), 10) || 0;
		},
		"file size": function (node, data) {
			data.file_size = file_size_text_to_number(node.textContent.trim());
		}
	};

	var pad = function (n, sep) {
		return (n < 10 ? "0" : "") + n + sep;
	};
	var format_date = function (timestamp) {
		var d = new Date(timestamp);
		return d.getUTCFullYear() + "-" +
			pad(d.getUTCMonth() + 1, "-") +
			pad(d.getUTCDate(), " ") +
			pad(d.getUTCHours(), ":") +
			pad(d.getUTCMinutes(), "");
	};

	var file_size_scale = {
		k: 1024,
		m: 1024 * 1024,
		g: 1024 * 1024 * 1024,
		t: 1024 * 1024 * 1024 * 1024
	};
	var file_size_labels = [ "B", "KiB", "MiB", "GiB", "TiB" ];
	var file_size_text_to_number = function (text) {
		var m = /(\d+(?:\.\d+)?)\s*(?:B|([KMGT])i?B)?/i.exec(text),
			v = 0;

		if (m !== null) {
			v = parseFloat(m[1]);
			if ((m = m[2]) !== undefined) {
				m = m.toLowerCase();
				v *= file_size_scale[m];
			}
			v = Math.round(v);
		}

		return v;
	};
	var file_size_number_to_text = function (size) {
		var scale = 1024,
			i, ii;

		for (i = 0, ii = file_size_labels.length - 1; i < ii && size >= scale; ++i) {
			size /= scale;
		}

		return size.toFixed(3).replace(/\.?0+$/, "") + " " + file_size_labels[i];
	};

	var category_to_button_style_map = {
		"english-translated anime": "cosplay",
		"raw anime": "misc",
		"non-english-translated anime": "western",
		"anime music video": "cosplay",
		"lossless audio": "artistcg",
		"lossy audio": "doujinshi",
		"raw literature": "gamecg",
		"non-english-translated literature": "manga",
		"english-translated literature": "western",
		"english-translated Live Action": "",
		"raw live action": "misc",
		"non-english-translated live action": "non-h",
		"live action promotional video": "artistcg",
		"applications": "imageset",
		"games": "imageset",
		"photos": "asianporn",
		"graphics": "asianporn"
	};
	var category_to_button_style = function (data) {
		if (data.sukebei) return "doujinshi";
		var subcat = category_to_button_style_map[data.subcategory.toLowerCase()];
		return (subcat === undefined ? "misc" : subcat);
	};

	var nyaa_get_data = function (info, callback) {
		var data = xlinks_api.cache_get(info.id);
		callback(null, data);
	};
	var nyaa_set_data = function (data, info, callback) {
		xlinks_api.cache_set(info.id, data, xlinks_api.ttl_1_day);
		callback(null);
	};
	var nyaa_setup_xhr = function (callback) {
		var info = this.infos[0];
		callback(null, {
			method: "GET",
			url: "https://" + (info.sukebei ? "sukebei" : "www") + ".nyaa.si/?page=view&tid=" + info.gid + "&showfiles=1",
			headers: { "Cookie": "" }
		});
	};
	var nyaa_parse_response = function (xhr, callback) {
		var html = xlinks_api.parse_html(xhr.responseText, null),
			info = this.infos[0],
			data, fn, n1, n2, ns, i, ii, m, t;

		if (html === null) {
			callback("Invalid response");
			return;
		}

		data = {
			type: "nyaa",
			subtype: "torrent",
			gid: info.gid,
			sukebei: info.sukebei,
			title: "",
			tags: [],
			description: "",
			information: "",
			files: [],
			state: "normal",
			comments_key: null,
			category: "",
			category_id: "",
			subcategory: "",
			subcategory_id: "",
			uploader: "",
			uploader_id: 0,
			uploader_class: "normal",
			date_created: 0,
			seeders: 0,
			leechers: 0,
			downloads: 0,
			file_size: 0,
			fans: 0
		};

		if ((n1 = $(".viewtorrentname", html)) !== null) {
			data.title = n1.textContent.trim();
		}
		else {
			callback(null, [ { error: "Invalid torrent" } ]);
			return;
		}

		if ((n1 = $(".content", html)) !== null) {
			if (
				n1.classList.contains((t = "aplus")) ||
				n1.classList.contains((t = "trusted")) ||
				n1.classList.contains((t = "remake")) ||
				n1.classList.contains((t = "hidden"))
			) {
				data.state = t;
			}
		}
		if ((n1 = $(".viewdescription", html)) !== null) {
			data.description = innerhtml_to_safe_text(n1);
		}
		if (
			(n1 = $(".viewfiletable", html)) !== null &&
			(ns = $$(".fileentry", n1)).length > 0
		) {
			for (i = 0, ii = ns.length; i < ii; ++i) {
				if (
					(n1 = $(".fileentryname", ns[i])) !== null &&
					(n2 = $(".fileentrysize", ns[i])) !== null
				) {
					data.files.push([
						n1.textContent.trim(),
						file_size_text_to_number(n2.textContent.trim())
					]);
				}
			}
		}

		if ((ns = $$(".viewshowhide", html)).length >= 2) {
			m = /showcomments=(\w+)/.exec(ns[1].getAttribute("href") || "");
			if (m !== null) {
				data.comments_key = m[1];
			}
		}

		if ((n1 = $(".viewcategory>a:nth-of-type(1)", html)) !== null) {
			data.category = n1.textContent.trim();
			if ((m = /cats=([\w_]+)/.exec(n1.getAttribute("href") || "")) !== null) {
				data.category_id = m[1];
			}
		}

		if ((n1 = $(".viewcategory>a:nth-of-type(2)", html)) !== null) {
			data.subcategory = n1.textContent.trim();
			if ((m = /cats=([\w_]+)/.exec(n1.getAttribute("href") || "")) !== null) {
				data.subcategory_id = m[1];
			}
		}

		ns = $$("td.tname", html);
		for (i = 0, ii = ns.length; i < ii; ++i) {
			n1 = ns[i];
			if ((n2 = n1.nextSibling) !== null && n2.tagName === "TD") {
				t = n1.textContent.trim().toLowerCase();
				if (t[t.length - 1] === ":") t = t.substr(0, t.length - 1);
				if ((fn = table_info_fns[t]) !== undefined) {
					fn(n2, data);
				}
			}
		}

		callback(null, [ data ]);
	};

	var url_get_info = function (url, callback) {
		var m = /^(?:https?:\/*)?((www\.|sukebei\.)?nyaa\.(?:eu|se))(\/[\w\W]*)?/i.exec(url),
			data, s, m2;

		if (m !== null && m[3] !== undefined && (m2 = /[\?\&]tid=(\d+)/.exec(m[3])) !== null) {
			s = (m[2] === "sukebei.");
			data = {
				id: "nyaa_" + (s ? "sukebei_" : "") + m2[1],
				site: "nyaa",
				sukebei: s,
				gid: parseInt(m2[1], 10),
				domain: m[1],
				tag: "Nyaa"
			};
			if (xlinks_api.config.nyaa.iconify) {
				data.icon = data.site + (s ? "sukebei" : "");
			}
			callback(null, data);
		}
		else {
			callback(null, null);
		}
	};
	var url_info_to_data = function (url_info, callback) {
		xlinks_api.request("nyaa", "torrent", url_info.id, url_info, callback);
	};
	var create_actions = function (data, info, callback) {
		var urls = [],
			url_base = "https://" + (info.sukebei ? "sukebei" : "www") + ".nyaa.si/";

		urls.push([ "View on:", url_base + "?page=view&tid=" + info.gid + "&showfiles=1" + (data.comments_key ? "&showcomments=" + data.comments_key : ""), "Nyaa.se" ]);
		urls.push(null);
		urls.push([ "Download as:", url_base + "?page=download&tid=" + info.gid, "Torrent" ]);
		urls.push([ null, url_base + "?page=download&tid=" + info.gid + "&magnet=1", "Magnet" ]);
		urls.push([ null, url_base + "?page=download&tid=" + info.gid + "&txt=1", "Txt File" ]);

		callback(null, urls);
	};
	var create_details = function (data, info, callback) {
		var container = $.node("div", "xl-details-limited-size"),
			n1, n2;

		// Sidebar
		$.add(container, n1 = $.node("div", "xl-details-side-panel"));

		$.add(n1, n2 = $.node("div", "xl-theme xl-button xl-button-eh xl-button-" + category_to_button_style(data)));
		$.add(n2, $.node("div", "xl-noise", data.category));

		$.add(n1, n2 = $.node("div", "xl-details-side-box xl-details-side-box-rating xl-theme"));
		$.add(n2, $.node("div", "xl-details-file-count", data.files.length + " file" + (data.files.length === 1 ? "" : "s")));
		if (data.file_size >= 0) {
			$.add(n2, $.node("div", "xl-details-file-size", "(" + file_size_number_to_text(data.file_size) + ")"));
		}

		$.add(n1, n2 = $.node("div", "xl-details-side-box xl-details-side-box-rating xl-theme"));
		$.add(n2, $.node("div", "xl-details-seeders", "Seeders: " + data.seeders));
		$.add(n2, $.node("div", "xl-details-leechers", "Leechers: " + data.leechers));
		$.add(n2, $.node("div", "xl-details-downloads", "Dls: " + data.downloads));

		// Title
		$.add(container, n1 = $.node("div", "xl-details-title-container xl-theme"));
		$.add(n1, n2 = $.node("a", "xl-details-title xl-theme xl-highlight", data.title));
		n2.href = "#";
		n2.setAttribute("data-xl-highlight", "title");

		// Upload info
		$.add(container, n1 = $.node("div", "xl-details-upload-info xl-theme"));
		$.add(n1, $.tnode("Uploaded by"));
		$.add(n1, n2 = $.node("strong", "xl-details-uploader xl-theme xl-highlight", data.uploader));
		n2.setAttribute("data-xl-highlight", "uploader");
		$.add(n1, $.tnode("on"));
		$.add(n1, $.node("strong", "xl-details-upload-date", format_date(data.date_created)));

		// Content
		$.add(container, n1 = $.node("div", "xl-details-description"));
		apply_safe_text_to_node(n1, data.description);

		// Done
		callback(null, container);
	};

	xlinks_api.init({
		namespace: "nyaa_torrents",
		name: "Nyaa Torrents",
		author: "dnsev-h",
		description: "Linkify and format nyaa.si links",
		version: [1,0,0,9],
		registrations: 1,
		main: main_fn
	}, function (err) {
		if (err === null) {
			xlinks_api.insert_styles(".xl-site-tag-icon[data-xl-site-tag-icon=nyaa]{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABPlBMVEX////n9P7X6/0id+UpfOYRbeNtw/4wq/83hej4/P8dov8Zivgvg+fd7Pzw+P642vs4i+wzu/898v856v865P804/80zv4+qv3J5fwop//C4Ps6j+wqoPqz1Pir1foWmv+jyfgOl/8MkP8Chf+K3/wkf+6AyfwYc+sZdeNp4P0PePICePgAcfUAavK76v2OzfvO6v2sz/k3ovcysv81lvGx2/s1xf8q1/8kw/+DwPqTvvUysPCDtPE/oPVu5/+Y8f563/111Pl1xfub3f1my/xF7Pswie9a1/wtm/clmfgtj/JK3f4mguV8vflouf1srfVio+5auv1csPhRq/lLs/1DmfIod94/+f+e1fuby/k/iOfQ5fsBe/s21f8IN28AS949w/443P9C//0Fi//L9f5I0+5Pzf1BqPFYlOo4oeiBsk1bAAACPUlEQVR4XoXS1ZLbQBAF0EExmJkZl5mZmTlM//8D6ZbsWJuXvX5RVZ+6PSOZvH0Q8sa5fJeTEyuxVpOYlpQArPfj7O2vueX2pmy1TpZ3f/wBIIIgm5tSp8PhjXYiFo18hQDQRiusQ8NIp9XwQq0dj0Ui9z6QQiDhwjoqFxFARW3/CzSgQHDHRb3TrVa/VcrFgficeEVxf4+g1+t1uy8vCCqV4sFMLpeeDs8lXrFiBAbiiEueM9QbNTwHFSgA9P0KEKYmIbn01iV0wJL47gAMl4RwzqfOFP8Y82vr0QgCv6JrwhyzegPnTCs7Pzf09bgHQNTrHUtIPzNJwzCULWWM6O1YFIBsik6nM3pbF0rSUJUGnXBq7eMYAt7s97XhuGUtXqnFy8b4LNse25+PA+BNq/k0nHMuCsnyJT1V1XE2tnD8HcCd1ILfS5xWcrPkpqykHsKbDvVWjPZzweV15ZoS+uDSxjahCEZjyfGmZlUhmAlGiM6wIQAE3LJazSDQdVTbASA8kzVNc4IMo+8EAMf/IN8LHZnj5F/o/w0hDX6LPnCgKRUAFsdTWln5VEgRRikI2BFcoUGLJTi/oGfPGbeQongVH1zkV544F01LE3zvdJIsZhjLuAD0hgc0Gx5Ldfgkvdvz/CSlDmWUMV1Pna96YIlg6JK7dE6IzahNqM7s1FkyFJoCwCUlXtxMyQFg26B1hxWuLH5gAPj0m/gprTjAWB7xc4k+5qU8WEUwOQArtjdCZT8+2y7j4lAD8EH+Amg5gZiqRIpYAAAAAElFTkSuQmCC)}.xl-site-tag-icon[data-xl-site-tag-icon=nyaasukebei]{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAABPlBMVEX////+7Oj92tfkMSTmNyr+onP/fDj/XybnRjn/+vnmPTD84N74GhrjIBH5WTL7ubn+8/D80cv9pjX/kzv/jzX/hj37x8P8akb/ZzL7yovsQTj/Sh7/RBf/qzXsQzr4uLT5sq3/MhH9tmnsNCbqLRrjJxn4qqTyGxD6pYb4DgL2DAD/AwP9gGz/gz/9f1L947vuaWL2TTLmUED7i2P5s63xi4P939D5fX36wrT4Z1/6r5T90pz5XVT6slz9wXv+tnD/hjz1dG37pnn2VD/ySET4Rir/sDX70tH5m5v6uqPuOzL1mpPxNTXyMy7+o0r5w3X/pSXcOir/nzfkMCjvojX7BwH/jTn4hob/lCv1TEPyEQD7jkX+xpj8u2hwDwjxdEj/GAreKgD8s0D9tU//fUPulkjqaVj+5cz/mznneD/8V0gnAAACP0lEQVR4XoXS1XLlSAwG4CYzHGZm5jAzM/Mg7L7/C4xkx4kzN5Fvukpf/ZLbJi+fFHnh3PpQl5d6eDXlHGuWBUD/2M5vfdm5Kp9atdrl1eOv/wEIP8jbm/JaLrdSDkduYj+hAKjvI/RtRUkm5dxZqhyNxGI9F1hCIOFCP85mEEBEavk/SECB4JyLSqPV6XwtZTOv4nv4AkWvh6Ddbrda19cISqXM6Mi2k2u5nfAFRrwBTxxzi9uK3JdzOxCBAsCDGwHCVHFTO7kxgQwYEn18Bd6QNPb5Zldy17hbfbqJIXAjWib0se77sGdSev6xoj1FHQCiUmno3oUdJRRFkTakAdHKkRsAVlU0Go332xpKCUWWmnQmmCqfRBDw6sOD6rVr+u28nJk0F+bY4mD5LgqAV/Xq2OtzLoqJ7ITOyvICG5yd/AFwbqn+7yVmS/Yc6Wel0H7uNEidEe/zueDWUmmJErofoM1FQhFg2+vjm5odiWDNMEI0hgk+ALOOOp04Ak1DtegD7iJ50zRniFfasw9w/Af5QfrYXCBvRf9NSKvw3LogCEkhH9A5bqnnrXExRBilIGCGf4QKKbrgfEi7u/FAMUTxVVwwLEyPORdVXRX8YHaK3MYZiwcAaE0HqAYc6xX4JO2t9cIUpUHKKGOaFlq/d8Chu/Bh4HCdEINRg1CNGaFuIp3edG6SEqcC8XoQgGGA1oKsOK/zkQLg22/iVn0a+oQVEO/W6V7Bskb3CKZewbThtFAZe7tGgHGxrQL4pP4Cd0mKEKiat4wAAAAASUVORK5CYII=)}");

			xlinks_api.register({
				settings: {
					sites: [ // namespace
						// name, default, title, description, descriptor?
						[ "nyaa", true, "nyaa.si", "Enable link processing for nyaa.si" ],
						// descriptor: { type: string, options: <array of [string:value, string:label, string:description]> }
						// for pre-existing vars: [ "name" ]
					],
					nyaa: [
						[ "iconify", true, "Icon site tags", "Use site-specific icons instead of [Site] tags" ],
					]
				},
				request_apis: [{
					group: "nyaa",
					namespace: "nyaa",
					type: "torrent",
					count: 1,
					concurrent: 1,
					delay_okay: 500,
					delay_error: 5000,
					functions: {
						get_data: nyaa_get_data,
						set_data: nyaa_set_data,
						setup_xhr: nyaa_setup_xhr,
						parse_response: nyaa_parse_response
					},
				}],
				linkifiers: [{
					regex: /(https?:\/*)?(?:www\.|sukebei\.)?nyaa\.(?:eu|se)(?:\/[^<>()\s\'\"]*)?/i,
					prefix_group: 1,
					prefix: "https://",
				}],
				commands: [{
					url_info: url_get_info,
					to_data: url_info_to_data,
					actions: create_actions,
					details: create_details
				}]
			});
		}
	});

	};
	main(xlinks_api);

})();

