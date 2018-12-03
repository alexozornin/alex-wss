'use strict'

const WebSocket = require('ws');

class WSS
{
    constructor(options, messageHandler = (message) => { return ''; })
    {
        let self = this;
        this._private = {
            messageHandler,
            onError: (err) =>
            {
                console.log(err)
            }
        };
        this.wss = new WebSocket.Server(options);
        this.wss.on('connection', function connection(ws)
        {
            ws.on('message', async (message) =>
            {
                let res = self._private.messageHandler(message);
                if (res instanceof Promise)
                {
                    res = await res;
                }
                try
                {
                    ws.send(res);
                }
                catch (err)
                {
                    self._private.onError(err);
                }
            });
        });
    }

    setMessageHandler(messageHandler)
    {
        this._private.messageHandler = messageHandler;
    }

    setOnError(onError)
    {
        this._private.onError = onError;
    }

    broadcast(data)
    {
        this.wss.clients.forEach(function each(client)
        {
            if (client.readyState === WebSocket.OPEN)
            {
                client.send(data);
            }
        })
    }

    closeAll(code, data)
    {
        this.wss.clients.forEach(function each(client)
        {
            client.close(code, data);
        })
    }
}

module.exports = WSS;
