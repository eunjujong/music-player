const ports = [];
let main_port = null;
let pinged = true;

const postMessageAll = (message, exclude_port) => {
    ports.forEach((port) => {
        if(port != exclude_port) {
            port.postMessage(message)
        }
    })
}

const setMainPort = (port) => {
    main_port = port;
    main_port.postMessage({
        type: "set_main_port"
    })
    postMessageAll({
        type: "unset_main_port"
    }, main_port)
}

setInterval(() => {
    if(!pinged) {
        const port_index = ports.findIndex(_port => _port == main_port);
        ports.splice(port_index, 1);
        setMainPort(ports[0])
    }
    pinged = false;
}, 2000);

onconnect = (e) => {
    const port = e.ports[0];

    ports.push(port);

    if(ports.length == 1) {
        setMainPort(port)
    }

    port.onmessage = (e) => {
        const data = e.data;

        switch(data.type) {
            case "ping": {
                if(port == main_port) {
                    pinged = true;
                    postMessageAll('main port pinged')
                }
            }
        }
    }
}
