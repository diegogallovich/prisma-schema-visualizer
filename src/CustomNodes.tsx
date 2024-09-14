import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const nodeStyle = {
  padding: '10px',
  borderRadius: '5px',
  width: '300px',
  fontSize: '12px',
  color: '#333',
  textAlign: 'left' as const,
  border: '1px solid #ccc',
  backgroundColor: 'white',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};

const titleStyle = {
  marginBottom: '10px',
  padding: '5px',
  borderRadius: '3px',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #ccc',
};

const fieldsContainerStyle = {
  maxHeight: '200px',
  overflowY: 'auto' as const,
};

const fieldStyle = {
  padding: '3px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #eee',
};

const iconStyle = {
  marginLeft: '5px',
  fontSize: '12px',
};

export const ModelNode: React.FC<NodeProps> = ({ data }) => (
  <div style={nodeStyle}>
    <Handle type="target" position={Position.Top} />
    <div style={titleStyle}>
      {data.label}
    </div>
    <div style={fieldsContainerStyle}>
      {data.fields.map((field: any, index: number) => (
        <div key={field.name} style={fieldStyle}>
          <div>
            {field.name}: {field.type}
            {field.isNullable && (
              <span title="Nullable" style={iconStyle}>◯</span>
            )}
            {field.isPrimaryKey && (
              <span title="Primary Key" style={iconStyle}>🔑</span>
            )}
          </div>
          {field.isRelation && (
            <Handle
              type="source"
              position={Position.Right}
              id={`${data.label}-${field.name}`}
              style={{ top: `${(index + 1) * 24 + 10}px`, right: '-8px' }}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

export const EnumNode: React.FC<NodeProps> = ({ data }) => (
  <div style={{...nodeStyle, backgroundColor: '#f9f9f9'}}>
    <Handle type="target" position={Position.Top} />
    <div style={{...titleStyle, backgroundColor: '#e6e6e6'}}>
      Enum: {data.label}
    </div>
    <div style={fieldsContainerStyle}>
      {data.values.map((value: string) => (
        <div key={value} style={fieldStyle}>
          {value}
        </div>
      ))}
    </div>
  </div>
);