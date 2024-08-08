import { Server } from 'socket.io';

const io = new Server(9000, {
    cors: {
        origin: 'http://localhost:3000', // Adjust the URL as needed
    },
});

let users = [];

// Add user to the list
const addUser = (userData, socketId) => {
    if (!users.some(user => user.sub === userData.sub)) {
        users.push({ ...userData, socketId });
    }
};

// Remove user from the list
const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

// Get user by ID
const getUser = (userId) => {
    return users.find(user => user.sub === userId);
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Add user to the lists
    socket.on('addUser', userData => {
        console.log('Adding user:', userData);
        addUser(userData, socket.id);
        io.emit('getUsers', users);
    });

    // for handling sending messages
    socket.on('sendMessage', (data) => {
        // console.log('Sending message:', data);
        const user = getUser(data.receiverId);
        if (user) {
            io.to(user.socketId).emit('getMessage', data);
        } else {
            console.log('User not found:', data.receiverId);
        }
    });

    // for handling disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

console.log('Socket server running on port 9000');

