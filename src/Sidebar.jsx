
import React from "react";
// import { nodeTypes } from "../utils/nodeTypes";

const nodeTypes = {
  userQuery: { label: "User Query", type: "userQuery" },
  knowledgeBase: { label: "Knowledge Base", type: "knowledgeBase" },
  llmEngine: { label: "LLM Engine", type: "llmEngine" },
  output: { label: "Output", type: "output" },
};


export default function SidePanel() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside style={{ width: "100%", padding: 10, display: "flex", alignItems: "center", border: "1px",justifyContent: "center", background: "#A8A4A4" , borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" , }}>
      {/* <h3 className="">Components</h3> */}
       <div style={{ display: "flex", gap: 10 }}>
      {Object.values(nodeTypes).map((node) => (
        <div
          key={node.type}
          onDragStart={(e) => onDragStart(e, node.type)}
          draggable
          style={{
            padding: 10,
            margin: "10px 0",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            cursor: "grab",
            textAlign: "center",
            minWidth: 100,        
          }}
        >
          {node.label}
        </div>
      ))}
      </div>
    </aside>
  );
}
