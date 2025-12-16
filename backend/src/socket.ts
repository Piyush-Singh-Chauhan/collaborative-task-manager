import {Server, Socket} from 'socket.io';

export const setupSocket = (io : Server) => {
    io.on('connection', (socket : Socket) => {
        console.log("Socket connected : ", socket.id);

        socket.on('join', (userId : string)=> {
            socket.join(userId);
            console.log(`User ${userId} joined`);
        })

        socket.on('disconnect' , () => {
            console.log('Socket Disconnected:', socket.id);
        })
    })
}