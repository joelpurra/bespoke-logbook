/*!
 * bespoke-logbook v2.0.0-alpha.1
 *
 * Copyright 2014, Joel Purra
 * This content is released under the MIT license
 * http://joelpurra.mit-license.org/2013-2014
 */

!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var o;"undefined"!=typeof window?o=window:"undefined"!=typeof global?o=global:"undefined"!=typeof self&&(o=self);var n=o;n=n.bespoke||(n.bespoke={}),n=n.plugins||(n.plugins={}),n.logbook=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*global require:true, module:true */

"use strict";

var pluginName = "logbook",
    // Hack to get around having to write all browser code with require().
    browserGlobal = (function(f) {
        return f("return this")();
    }(Function)),
    convenient = ((browserGlobal.bespoke && browserGlobal.bespoke.plugins && browserGlobal.bespoke.plugins.convenient) || _dereq_("bespoke-convenient")),
    cv = convenient.builder(pluginName),

    defaultEvents = ["activate", "deactivate", "next", "prev", "slide"],

    plugin = function self(options) {
        var decker = function(deck) {
            // TODO: unse cvBoundToDeck.log instead of cv.log?
            var cvBoundToDeck = cv.activateDeck(deck),

                createPrefixedLogger = Function.prototype.bind.bind(cv.log, cv.log.bind),

                stringLoggingOverride = function(str) {
                    var fn = function() {
                        cv.log(str);
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
                        throw cv.generateErrorObject("The override must be `false`, a function or a string.");
                    }

                    if (eventLoggingOverride instanceof String || eventLoggingOverride === ("" + eventLoggingOverride)) {
                        eventLoggingOverride = stringLoggingOverride(eventLoggingOverride);
                    }

                    overrides[eventName] = eventLoggingOverride;
                },

                getEventLogger = function(eventName) {
                    return overrides[eventName] || cv.log;
                },

                getDynamicLogger = function(eventName) {
                    var dynamicLogger = function() {
                        var eventLogger = getEventLogger(eventName);

                        eventLogger.apply(null, convenient.copyArray(arguments));
                    };

                    return dynamicLogger;
                },

                proxy = {
                    fire: function(eventName) {
                        var eventLogger = getEventLogger(eventName),
                            result,
                            args = convenient.copyArray(arguments);

                        eventLogger.apply(null, ["fire"].concat(args));

                        result = deck.original.fire.apply(null, args);

                        eventLogger.apply(null, ["fired", result].concat(args));

                        return result;
                    }
                },

                injectProxy = function(name) {
                    if (deck[name] === proxy[name]) {
                        throw cv.generateErrorObject("The deck's `" + name + "` has already been overridden.");
                    }

                    deck.original[name] = deck[name];
                    deck[name] = proxy[name];
                },

                deProxy = function(name) {
                    if (deck[name] !== proxy[name]) {
                        throw cv.generateErrorObject("The deck's overridden `" + name + "` function has changed - de-proxying will break the proxy chain.");
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
                    options = options || {};
                    options.overrides = options.overrides || {};
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

                exportApi = function() {
                    self.enable = enable.bind(this);
                    self.disable = disable.bind(this);
                    self.override = override.bind(this);
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

        return decker;
    };

module.exports = plugin;

},{}]},{},[1])
(1)
});