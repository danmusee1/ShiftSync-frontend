import { type Socket, io } from 'socket.io-client'

import { API_BASE_URL } from '@/api/client'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket?.disconnect()

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket'],
  })
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
