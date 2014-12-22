/*global require:true, document:true, jasmine:true, describe:true, it:true, expect:true, beforeEach:true, runs:true, waitsFor:true, spyOn:true */

Function.prototype.bind = Function.prototype.bind || require("function-bind");

var bespoke = require("bespoke"),
    convenient = require("bespoke-convenient"),
    logbook = require("../../lib-instrumented/bespoke-logbook.js"),
    browserGlobal = (function(f) {
        return f("return this")();
    }(Function));

(function(browserGlobal, document, jasmine, bespoke) {
    "use strict";

    describe("bespoke-logbook", function() {

        var tag = "bespoke.logbook",

            deck,

            createDeck = function(options) {
                var parent = document.createElement("article");

                for (var i = 0; i < 10; i++) {
                    parent.appendChild(document.createElement("section"));
                }

                deck = bespoke.from(parent, [
                    logbook(options)
                ]);
            },

            internalLogger = browserGlobal.convenientOptions.logger,

            replaceLoggerWithSpy = function() {
                spyOn(internalLogger, "log");
            },

            customData1 = {
                custom1: "data1"
            },

            customData2 = {
                custom2: "data2"
            },

            plainLogString = "plain log string";

        describe("default events", function() {

            beforeEach(function() {
                replaceLoggerWithSpy();
                createDeck();
            });

            it("should have been logged as a slide", function() {
                deck.slide(5);
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "slide", jasmine.any(Object));
            });

            it("should have been logged as a next event", function() {
                deck.next();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "next", jasmine.any(Object));
            });

            it("should have been logged having activated a slide", function() {
                deck.next();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "activate", jasmine.any(Object));
            });

            it("should have been logged having deactivated a slide", function() {
                deck.next();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "deactivate", jasmine.any(Object));
            });

            it("should have been logged as a prev event", function() {
                deck.prev();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "prev", jasmine.any(Object));
            });

            it("should not have been logged when replaced", function() {
                var defaultEventLoggerOverride = jasmine.createSpy("defaultEventLoggerOverride");

                logbook.override("prev", defaultEventLoggerOverride);
                deck.prev();
                expect(defaultEventLoggerOverride).toHaveBeenCalledWith(jasmine.any(Object));
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "prev", jasmine.any(Object));
            });

            it("should not have been logged when deleted", function() {
                logbook.override("prev", false);
                deck.prev();
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "prev", jasmine.any(Object));
            });

            it("should have been logged with a plain string", function() {
                logbook.override("prev", plainLogString);
                deck.prev();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, plainLogString);
            });
        });

        describe("custom events", function() {
            beforeEach(function() {
                replaceLoggerWithSpy();
                createDeck();
            });

            it("should have been logged", function() {
                deck.fire("custom1");
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fire", "custom1");
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fired", true, "custom1");
            });

            it("should have been logged with custom data", function() {
                deck.fire("custom2", customData1);
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fire", "custom2", customData1);
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fired", true, "custom2", customData1);
            });

            it("should have been logged with multiple custom data", function() {
                deck.fire("custom3", customData1, customData2);
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fire", "custom3", customData1, customData2);
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fired", true, "custom3", customData1, customData2);
            });
        });

        describe("logger overrides", function() {
            var customOverride;

            beforeEach(function() {
                replaceLoggerWithSpy();
                createDeck();

                customOverride = jasmine.createSpy("custom");
                logbook.override("custom", customOverride);
            });

            it("should have been logged", function() {
                deck.fire("custom");
                expect(customOverride).toHaveBeenCalledWith("fire", "custom");
                expect(customOverride).toHaveBeenCalledWith("fired", true, "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom");
            });

            it("should have been logged with custom data", function() {
                deck.fire("custom", customData1);
                expect(customOverride).toHaveBeenCalledWith("fire", "custom", customData1);
                expect(customOverride).toHaveBeenCalledWith("fired", true, "custom", customData1);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom", customData1);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom", customData1);
            });

            it("should have been logged with multiple custom data", function() {
                deck.fire("custom", customData1, customData2);
                expect(customOverride).toHaveBeenCalledWith("fire", "custom", customData1, customData2);
                expect(customOverride).toHaveBeenCalledWith("fired", true, "custom", customData1, customData2);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom", customData1, customData2);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom", customData1, customData2);
            });

            it("should have been logged then deleted", function() {
                deck.fire("custom");
                expect(customOverride).toHaveBeenCalledWith("fire", "custom");
                expect(customOverride).toHaveBeenCalledWith("fired", true, "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom");
                expect(customOverride.calls.length).toBe(2);

                logbook.override("custom", false);
                deck.fire("custom");
                expect(customOverride.calls.length).toBe(2);
            });

            it("should have been logged with a plain string", function() {
                logbook.override("custom", plainLogString);
                deck.fire("custom");
                expect(customOverride).not.toHaveBeenCalled();
                expect(internalLogger.log).toHaveBeenCalledWith(tag, plainLogString);
            });
        });

        describe("logger overrides in options", function() {
            var customOverrides;

            beforeEach(function() {
                replaceLoggerWithSpy();

                customOverrides = jasmine.createSpyObj("customOverrides", ["custom"]);
                createDeck({
                    overrides: customOverrides
                });
            });

            it("should have been logged", function() {
                deck.fire("custom");
                expect(customOverrides.custom).toHaveBeenCalledWith("fire", "custom");
                expect(customOverrides.custom).toHaveBeenCalledWith("fired", true, "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom");
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom");
            });

            it("should have been logged with custom data", function() {
                deck.fire("custom", customData1);
                expect(customOverrides.custom).toHaveBeenCalledWith("fire", "custom", customData1);
                expect(customOverrides.custom).toHaveBeenCalledWith("fired", true, "custom", customData1);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom", customData1);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom", customData1);
            });

            it("should have been logged with multiple custom data", function() {
                deck.fire("custom", customData1, customData2);
                expect(customOverrides.custom).toHaveBeenCalledWith("fire", "custom", customData1, customData2);
                expect(customOverrides.custom).toHaveBeenCalledWith("fired", true, "custom", customData1, customData2);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fire", "custom", customData1, customData2);
                expect(internalLogger.log).not.toHaveBeenCalledWith(tag, "fired", true, "custom", customData1, customData2);
            });
        });

        describe("enable/disable", function() {
            beforeEach(function() {
                replaceLoggerWithSpy();
                createDeck();
            });

            it("should have been logged", function() {
                var callCount = internalLogger.log.calls.length;
                deck.fire("custom");
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fire", "custom");
                expect(internalLogger.log).toHaveBeenCalledWith(tag, "fired", true, "custom");
                expect(internalLogger.log.calls.length).toBe(callCount + 2);
                logbook.disable();
                deck.fire("custom");
                deck.fire("custom2");
                deck.next();
                deck.prev();
                expect(internalLogger.log.calls.length).toBe(callCount + 2);
                logbook.enable();
                deck.fire("custom");
                expect(internalLogger.log.calls.length).toBe(callCount + 4);
            });
        });
    });
}(browserGlobal, document, jasmine, bespoke));
