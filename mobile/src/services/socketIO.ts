import { io } from "socket.io-client";

const socket = io("http://192.168.5.199:3001");
export default socket;
