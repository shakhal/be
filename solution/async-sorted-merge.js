'use strict'
const Heap = require('heap');
const Promise = require('bluebird');
const co = require('co');

module.exports = (logSources, printer) => {
    var activeLoggers = logSources.length;

    //heap sorted by date
    var heap = new Heap(function (a,b) {
        return a.message.date - b.message.date;
    });

    var initHeap = [];
    //create requests to fill up heap for first time
    for (let i = 0; i < logSources.length; i++) {
        var messagePromise = logSources[i].popAsync()
            .then(function(message){
                heap.push({
                    logSource : i,
                    message: message
                });
            });
        initHeap.push(messagePromise);
    }

    Promise.all(initHeap)
    .then(function(){
        return co(function* () {
            while (activeLoggers > 0 ){
                //get next message sorted by date
                var nextMessage = heap.pop();
                printer.print(nextMessage.message)

                //get new message
                var newMessage = yield logSources[nextMessage.logSource].popAsync();
                if (newMessage != false) {
                    heap.push({
                        logSource: nextMessage.logSource,
                        message: newMessage
                    })
                }
                else {
                    activeLoggers--
                }
            }
        });
    })
    .then(function(){
        printer.done();
    })
    .catch(function(e){
        console.log(e)
    })

}
