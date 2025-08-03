import { useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useGlobalStore} from "reactflow-canvas-store";

export default function LLMEngineNode({ id, data }) {
  const [model, setModel] = useGlobalStore("model");
  const { setNodes } = useReactFlow(); 

  const handleChange = (e) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);

    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, model: selectedModel } }
          : node
      )
    );
  };

  return (
    <div style={nodeStyle}>
      <div><strong>{data.label}</strong></div>
      <select value={model} onChange={handleChange} style={{ marginTop: 10, width: "100%" }}>
        <option value="llama3">Llama 3</option>
        <option value="gemini">Gemini</option>
        <option value="serpapi">Serp Api (Web)</option>
      </select>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeStyle = {
  padding: 10,
  width: 130,
  background: "#fffde7",
  border: "2px solid #fdd835",
  borderRadius: 6,
  fontSize: 11,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
