import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ServerConfig } from './config.js';

export interface ConnectedClient {
  client: Client;
  cleanup: () => Promise<void>;
  name: string;
}

export const createClients = async (servers: ServerConfig[]): Promise<ConnectedClient[]> => {
  const clients: ConnectedClient[] = [];

  for (const server of servers) {
    console.log(`Connecting to server: ${server.name}`);
    
    try {
      const transport = new StdioClientTransport({
        command: server.transport.command,
        args: server.transport.args
      });

      const client = new Client({
        name: 'mcp-proxy-client',
        version: '1.0.0',
      }, {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {}
        }
      });

      await client.connect(transport);
      console.log(`Connected to server: ${server.name}`);

      clients.push({
        client,
        name: server.name,
        cleanup: async () => {
          await transport.close();
        }
      });
    } catch (error) {
      console.error(`Failed to connect to ${server.name}:`, error);
    }
  }

  return clients;
};
