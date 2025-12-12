// Socket Context - Global Socket.IO connection provider
// Follows pattern from NotificationContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import { getUser } from '../utils/storage';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
      try {
        // Check if user is logged in
        const user = await getUser();
        if (!user) {
          console.log('[SocketContext] No user found, skipping socket connection');
          return;
        }

        // Connect socket
        await socketService.connect();

        if (!isMounted) return;

        const socketInstance = socketService.getSocket();
        setSocket(socketInstance);

        // Setup connection listeners
        socketService.onConnect(() => {
          if (isMounted) {
            setIsConnected(true);
            setError(null);
            console.log('[SocketContext] Socket connected');
          }
        });

        socketService.onDisconnect((reason) => {
          if (isMounted) {
            setIsConnected(false);
            console.log('[SocketContext] Socket disconnected:', reason);
          }
        });

        socketService.onConnectError((err) => {
          if (isMounted) {
            setError(err.message);
            setIsConnected(false);
            console.error('[SocketContext] Socket connection error:', err.message);
          }
        });
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          console.error('[SocketContext] Socket initialization error:', err);
        }
      }
    };

    initializeSocket();

    return () => {
      isMounted = false;
      socketService.offConnect();
      socketService.offDisconnect();
      socketService.offConnectError();
      // Note: We don't disconnect here to keep socket alive during app lifecycle
      // Socket will be disconnected on logout via clearUserData
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};
