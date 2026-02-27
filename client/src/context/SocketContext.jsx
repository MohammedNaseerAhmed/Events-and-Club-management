import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);
const noop = () => {};
const fallbackSocketContext = {
    socket: null,
    connected: false,
    emit: noop,
    on: () => noop,
    off: noop,
    joinConversation: noop,
    leaveConversation: noop,
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated, setUnreadCount, status } = useAuth();
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (status !== 'ready') return;

        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setConnected(false);
            }
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['polling'],
            upgrade: false,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', (err) => {
            setConnected(false);
            const msg = err?.message || 'Socket connection failed';
            // Stop retry churn for auth failures until token changes.
            if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('authentication')) {
                socket.disconnect();
            }
        });

        socket.on('new_notification', () => {
            setUnreadCount((c) => c + 1);
        });

        socketRef.current = socket;
        return () => { socket.disconnect(); socketRef.current = null; setConnected(false); };
    }, [token, isAuthenticated, status]);

    const emit = (event, data, callback) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data, callback);
        }
    };

    const on = (event, handler) => {
        socketRef.current?.on(event, handler);
        return () => socketRef.current?.off(event, handler);
    };

    const off = (event, handler) => socketRef.current?.off(event, handler);

    const joinConversation = (conversationId) => emit('join_conversation', conversationId);
    const leaveConversation = (conversationId) => emit('leave_conversation', conversationId);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, connected, emit, on, off, joinConversation, leaveConversation }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext) || fallbackSocketContext;
