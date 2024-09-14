#!/usr/bin/env node

import readline from 'readline';
import { exec } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import getPort from 'get-port';
import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startApp(schemaPath) {
  const absolutePath = resolve(schemaPath);
  
  if (!existsSync(absolutePath)) {
    console.error(`Error: File not found at ${absolutePath}`);
    return;
  }

  console.log(`Loading schema from: ${absolutePath}`);
  
  try {
    const schemaContent = readFileSync(absolutePath, 'utf-8');
    const port = await getPort({ port: [3000, 3001, 3002, 3003, 3004, 3005] });
    const wsPort = await getPort({ port: [8080, 8081, 8082, 8083, 8084, 8085] });
    
    // Start WebSocket server
    const wss = new WebSocketServer({ port: wsPort });
    
    wss.on('connection', (ws) => {
      console.log('Client connected');
      
      // Send initial file content
      ws.send(JSON.stringify({ type: 'content', data: schemaContent }));
      
      // Handle messages from client
      ws.on('message', (message) => {
        console.log('Received message from client:', message.toString());
        try {
          const { type, data } = JSON.parse(message);
          if (type === 'save') {
            console.log('Saving new content to file');
            writeFileSync(absolutePath, data, 'utf-8');
            console.log('File updated from browser');
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });
    });
    
    // Watch for file changes
    const watcher = chokidar.watch(absolutePath, { 
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });
    watcher.on('change', (path) => {
      console.log('File changed:', path);
      const updatedContent = readFileSync(path, 'utf-8');
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: 'content', data: updatedContent }));
      });
      console.log('File updated, sent to clients');
    });

    const command = `REACT_APP_SCHEMA_PATH='${absolutePath}' REACT_APP_WS_PORT=${wsPort} PORT=${port} npm start`;
    console.log(`Starting app on port ${port}, WebSocket on port ${wsPort}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(stdout);
    });
  } catch (err) {
    console.error('Failed to start the app:', err);
  }
}

rl.question('Enter the path to your schema.prisma file: ', (schemaPath) => {
  startApp(schemaPath);
  rl.close();
});