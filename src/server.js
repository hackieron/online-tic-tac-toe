import express from "express";import http from "node:http";import path from "node:path";import {fileURLToPath} from "node:url";import {Server} from "socket.io";import {Rooms} from "./rooms.js";
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../public"),app=express(),server=http.createServer(app),io=new Server(server);
app.disable("x-powered-by");app.use(express.static(dir));app.get("/health",(_,res)=>res.json({ok:true}));app.get("/{*splat}",(_,res)=>res.sendFile(path.join(dir,"index.html")));
const rooms=new Rooms(io);setInterval(()=>rooms.cleanup(),60000).unref();
io.on("connection",s=>{
 s.on("player:ready",(p={},ack=()=>{})=>ack(rooms.random(s,p.name)));
 s.on("room:create",(p={},ack=()=>{})=>ack(rooms.create(s,p.name)));
 s.on("room:join",(p={},ack=()=>{})=>ack(rooms.join(s,p.code,p.name)));
 s.on("game:move",(p={},ack=()=>{})=>ack(rooms.move(s,p.index)));
 s.on("game:rematch",(_,ack=()=>{})=>ack(rooms.rematch(s)));
 s.on("room:leave",(_,ack=()=>{})=>{rooms.leave(s);ack({ok:true})});
 s.on("queue:cancel",(_,ack=()=>{})=>{rooms.leave(s);ack({ok:true})});
 s.on("disconnect",()=>rooms.leave(s));
});
server.listen(process.env.PORT||3000,"0.0.0.0",()=>console.log("XO Arena running"));
