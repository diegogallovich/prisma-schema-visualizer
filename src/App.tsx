import React, { useState, useEffect } from 'react';
import ReactFlow, { 
  Node,
  Edge,
  Controls,
  Background,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ModelNode, EnumNode } from './CustomNodes';

const nodeTypes = {
  model: ModelNode,
  enum: EnumNode,
};

interface Field {
  name: string;
  type: string;
  isRelation: boolean;
  isNullable: boolean;
  isPrimaryKey: boolean;
}

interface Model {
  name: string;
  fields: Field[];
}

interface Enum {
  name: string;
  values: string[];
}

interface ParsedSchema {
  models: Model[];
  enums: Enum[];
}

const App: React.FC = () => {
  const [schema, setSchema] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:${process.env.REACT_APP_WS_PORT}`);
    
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        if (type === 'content') {
          setSchema(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (schema) {
      const { models, enums } = parseSchema(schema);
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      models.forEach((model: Model, index: number) => {
        newNodes.push({
          id: model.name,
          type: 'model',
          data: { label: model.name, fields: model.fields },
          position: { x: index * 300, y: index * 200 },
          draggable: true,
        });
      });

      enums.forEach((enumItem: Enum, index: number) => {
        newNodes.push({
          id: enumItem.name,
          type: 'enum',
          data: { label: enumItem.name, values: enumItem.values },
          position: { x: index * 300, y: (models.length + 1) * 200 },
          draggable: true,
        });
      });

      models.forEach((model: Model) => {
        model.fields.forEach((field: Field) => {
          if (field.isRelation) {
            newEdges.push({
              id: `${model.name}-${field.name}-${field.type}`,
              source: model.name,
              target: field.type,
              sourceHandle: `${model.name}-${field.name}`,
              type: 'smoothstep',
              animated: true,
              label: field.name,
              style: { stroke: '#ff0072' },
            });
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [schema]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow 
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

function parseSchema(schema: string): ParsedSchema {
  const models: Model[] = [];
  const enums: Enum[] = [];
  const lines = schema.split('\n');
  let currentModel: Model | null = null;
  let currentEnum: Enum | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('model')) {
      if (currentModel) models.push(currentModel);
      if (currentEnum) enums.push(currentEnum);
      currentModel = { name: trimmedLine.split(' ')[1], fields: [] };
      currentEnum = null;
    } else if (trimmedLine.startsWith('enum')) {
      if (currentModel) models.push(currentModel);
      if (currentEnum) enums.push(currentEnum);
      currentEnum = { name: trimmedLine.split(' ')[1], values: [] };
      currentModel = null;
    } else if (currentModel && trimmedLine.includes(' ')) {
      const [name, ...rest] = trimmedLine.split(' ');
      const type = rest.join(' ').split(' ')[0];
      currentModel.fields.push({ 
        name, 
        type: type.replace(/[\?\[\]]/g, ''),
        isRelation: models.some(m => m.name === type.replace(/[\?\[\]]/g, '')),
        isNullable: type.includes('?'),
        isPrimaryKey: rest.join(' ').includes('@id')
      });
    } else if (currentEnum && !trimmedLine.startsWith('}') && trimmedLine !== '') {
      currentEnum.values.push(trimmedLine);
    }
  }
  if (currentModel) models.push(currentModel);
  if (currentEnum) enums.push(currentEnum);

  return { models, enums };
}

export default App;
