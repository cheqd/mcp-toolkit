import { ToolDefinition } from "../types"

export interface ToolPlugin {
    name: string;
    initialize(config: any): Promise<void>;
    getTools(): ToolDefinition[];
    getResources?(): ResourceDefinition[];
  }
  export class ToolRegistry {
    private plugins: Map<string, ToolPlugin> = new Map();
    
    async registerPlugin(plugin: ToolPlugin, config: any): Promise<void> {
      await plugin.initialize(config);
      this.plugins.set(plugin.name, plugin);
    }
    
    getAllTools(): ToolDefinition[] {
      return Array.from(this.plugins.values()).flatMap(p => p.getTools());
    }
    
    getAllResources(): ResourceDefinition[] {
      return Array.from(this.plugins.values())
        .filter(p => p.getResources)
        .flatMap(p => p.getResources());
    }
  }