import { useState, useRef } from "react";
import { Handle, Position, useReactFlow } from "reactflow";

export default function UserQueryNode({ id, data }) {
  const [query, setQuery] = useState("");
  const textareaRef = useRef();
  const { setNodes } = useReactFlow();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Update node data in canvas
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, query: value } } : node
      )
    );

    // Auto-resize
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <div style={nodeStyle}>
      <div><strong>{data.label}</strong></div>
      <textarea
        ref={textareaRef}
        value={query}
        onChange={handleInputChange}
        placeholder="Ask your question..."
        style={textareaStyle}
        rows={2}
      />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeStyle = {
  padding: 4,
  width: 150,
  minHeight: 100,
  fontSize: 11,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "#e8f5e9",
  border: "2px solid #43a047",
  borderRadius: 6,
};

const textareaStyle = {
  width: "100%",
  resize: "none",
  fontSize: 12,
  padding: 6,
  borderRadius: 4,
  border: "1px solid #ccc",
  marginTop: 8,
  overflow: "hidden",
  minHeight: 25,
  lineHeight: "1.4em",
  boxSizing: "border-box",
};
