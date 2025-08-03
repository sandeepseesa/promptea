import React, { useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import axios from "axios";
import { useGlobalStore } from "reactflow-canvas-store";

export default function KnowledgeBaseNode({ id, data }) {
  const fileInput = useRef();
  const [status, setStatus] = useState("idle");
  const { setNodes } = useReactFlow();
  const [docName, setDocName] = useGlobalStore("docName"); // Store file name globally

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      await axios.post("https://sandeepseesa-promptea-server.hf.space/upload", formData , {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

      setStatus("uploaded");
      setDocName(file.name);

      // ✅ Save file name to node data
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  documentName: file.name, 
                },
              }
            : node
        )
      );
    } catch (err) {
      setStatus("error");
      console.error("Upload failed:", err);
    }
  };

  return (
    <div style={nodeStyle}>
      <div><strong>{data.label}</strong></div>
      <button onClick={() => fileInput.current.click()}>Upload PDF/DOCX</button>
      <input
        type="file"
        accept=".pdf,.docx"
        ref={fileInput}
        onChange={handleUpload}
        style={{ display: "none" }}
      />
      <div style={{ fontSize: 12 }}>
        {status === "uploading" && "Uploading..."}
        {status === "uploaded" && `✅ ${data.documentName || "Uploaded"}`}
        {status === "error" && "❌ Upload failed"}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeStyle = {
  padding: 10,
  width: 165,
  background: "#e3f2fd",
  border: "2px solid #2196f3",
  fontSize: 11,
  borderRadius: 6,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
