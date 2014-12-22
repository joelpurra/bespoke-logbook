/*global document:true, console:true, bespoke:true */

(function(bespoke) {
    "use strict";

    // Keep a reference to the deck for the fake plugin below.
    var deck = bespoke.from("article", [
        bespoke.plugins.keys(),
        bespoke.plugins.touch(),
        bespoke.plugins.classes(),
        bespoke.plugins.logbook(),
    ]);

    // Fake a plugin with a custom event.
    (function() {
        var fakePluginButton = document.getElementById("fake-plugin-button");

        bespoke.plugins.logbook.override("my-custom-plugin-event", function() {
            console.warn("Warning! You clicked the scary button!", arguments);
        });

        fakePluginButton.onclick = function() {
            deck.fire("my-custom-plugin-event", {
                something: "with extra data"
            });
        };
    }());
}(bespoke));
