'use strict'
const Heap = require('heap');

module.exports = (logSources, printer) => {
    var activeLoggers = logSources.length;

    //heap sorted by date
    var heap = new Heap(function (a,b) {
        return a.message.date - b.message.date;
    });

    //read all sources to find first message
    for (let i = 0; i < logSources.length; i++) {
        var message = logSources[i].pop();
        heap.push({
            logSource:i,
            message: message
        });
    }

    //print messages sorted by date
    while (activeLoggers  > 0) {
        var nextMessage = heap.pop()
        printer.print(nextMessage.message);

        var newMessage = logSources[nextMessage.logSource].pop();
        if (newMessage != false) {
            heap.push({
                logSource:nextMessage.logSource,
                message: newMessage
            });
        }
        else {
            activeLoggers--;
        }
    }

    printer.done();

}
