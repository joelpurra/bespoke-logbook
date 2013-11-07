/*global window:true, bespoke:true */

(function(global, window, bespoke, pluginName, undefined) {
    "use strict";

    var tag = "bespoke." + pluginName,

        generateErrorObject = function(message) {
            return new Error(tag + ": " + message);
        };

    // Set up a global, overridable logger object
    global.logbookLogger = global.logbookLogger || {
        log: function() {
            // Workaround for phantom-polyfill.js problems binding window.console.log
            window.console.log.apply(window.console, arguments);
        }
    };

    (function(bespoke, ns, logger) {
        var defaultEvents = ["activate", "deactivate", "next", "prev", "slide"],

            copyArray = function(arr) {
                return [].slice.call(arr, 0);
            },

            // Curry, partial, bind - not sure what
            bind = function(fn, context) {
                var args = copyArray(arguments).slice(1);
                args[0] = context || null;

                var prepared = function() {
                    var baseAndPrefixedArguments = args.concat(copyArray(arguments)),
                        bound = Function.prototype.bind.apply(fn, baseAndPrefixedArguments);

                    return bound;
                };

                return prepared;
            },

            plugin = function self(deck, options) {
                var createBaseLogger = bind(logger.log),

                    log = createBaseLogger(tag),

                    createPrefixedLogger = bind(log),

                    stringLoggingOverride = function(str) {
                        var fn = function() {
                            log(str);
                        };

                        return fn;
                    },

                    overrides = {},

                    override = function(eventName, eventLoggingOverride) {
                        if (eventLoggingOverride === false) {
                            delete overrides[eventName];

                            return;
                        }

                        if (!(eventLoggingOverride instanceof Function || eventLoggingOverride instanceof String || eventLoggingOverride === ("" + eventLoggingOverride))) {
                            throw generateErrorObject("The override must be `false`, a function or a string.");
                        }

                        if (eventLoggingOverride instanceof String || eventLoggingOverride === ("" + eventLoggingOverride)) {
                            eventLoggingOverride = stringLoggingOverride(eventLoggingOverride);
                        }

                        overrides[eventName] = eventLoggingOverride;
                    },

                    getEventLogger = function(eventName) {
                        return overrides[eventName] || log;
                    },

                    getDynamicLogger = function(eventName) {
                        var dynamicLogger = function() {
                            var eventLogger = getEventLogger(eventName);

                            eventLogger.apply(null, copyArray(arguments));
                        };

                        return dynamicLogger;
                    },

                    proxy = {
                        fire: function(eventName) {
                            var eventLogger = getEventLogger(eventName),
                                result,
                                args = copyArray(arguments);

                            eventLogger.apply(null, ["fire"].concat(args));

                            result = deck.original.fire.apply(null, args);

                            eventLogger.apply(null, ["fired", result].concat(args));

                            return result;
                        }
                    },

                    injectProxy = function(name) {
                        if (deck[name] === proxy[name]) {
                            throw generateErrorObject("The deck's `" + name + "` has already been overridden.");
                        }

                        deck.original[name] = deck[name];
                        deck[name] = proxy[name];
                    },

                    deProxy = function(name) {
                        if (deck[name] !== proxy[name]) {
                            throw generateErrorObject("The deck's overridden `" + name + "` function has changed - de-proxying will break the proxy chain.");
                        }

                        deck[name] = deck.original[name];
                    },

                    installedDefaultEventListeners = {},

                    installDefaultEventListeners = function() {
                        defaultEvents.forEach(function(eventName) {
                            var dynamicLogger = getDynamicLogger(eventName),
                                off = deck.on(eventName, dynamicLogger);

                            installedDefaultEventListeners[eventName] = off;
                        });
                    },

                    uninstallDefaultEventListeners = function() {
                        Object.keys(installedDefaultEventListeners).forEach(function(key) {
                            var off = installedDefaultEventListeners[key];
                            off();
                        });
                    },

                    installDefaultEventOverrides = function() {
                        defaultEvents.forEach(function(eventName) {
                            // TODO: when the default events are triggered with .fire("someeventname"),
                            // the event name will show up twice in the arguments log, because the
                            // proxied logbook fire(...) also prependes it.
                            override(eventName, createPrefixedLogger(eventName));
                        });
                    },

                    installEventOverridesFromOptions = function() {
                        Object.keys(options.overrides).forEach(function(key) {
                            override(key, options.overrides[key]);
                        });
                    },

                    prepareOptions = function() {
                        // TODO: merge function?
                        options = options !== true ? options : {};
                        options.overrides = options.overrides || {};
                    },

                    exportApi = function() {
                        self.enable = enable.bind(this);
                        self.disable = disable.bind(this);
                        self.override = override.bind(this);
                    },

                    enable = function() {
                        deck.original = deck.original || {};

                        installDefaultEventListeners();

                        injectProxy("fire");
                    },

                    disable = function() {
                        deProxy("fire");

                        uninstallDefaultEventListeners();

                        delete deck.original;
                    },

                    init = function() {
                        prepareOptions();

                        installDefaultEventOverrides();

                        installEventOverridesFromOptions();

                        exportApi();

                        enable();
                    };

                init();
            };

        if (ns[pluginName] !== undefined) {
            throw generateErrorObject("The " + pluginName + " plugin has already been loaded.");
        }

        ns[pluginName] = plugin;
    }(bespoke, bespoke.plugins, global.logbookLogger));
}(this, window, bespoke, "logbook"));
