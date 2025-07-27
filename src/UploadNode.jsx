// UploadNode.js
import React, { useRef, useState } from "react";
import { Handle, Position } from "reactflow";
import axios from "axios";

export default function UploadNode({ id, data }) {
  const fileInputRef = useRef();
  const [status, setStatus] = useState("idle");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Server response:", response.data);
      setStatus("uploaded");
    } catch (error) {
      console.error("Upload failed:", error);
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        padding: 10,
        background: "#e6f7ff",
        border: "2px solid #1890ff",
        borderRadius: 5,
        minWidth: 180,
        textAlign: "center",
      }}
    >
      <div style={{ marginBottom: 5 }}>{data.label}</div>
      <button onClick={() => fileInputRef.current.click()}>Upload File</button>
      <input
        type="file"
        accept=".pdf,.docx"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div style={{ marginTop: 5, fontSize: 12 }}>
        {status === "idle" && "No file uploaded"}
        {status === "uploading" && "Uploading..."}
        {status === "uploaded" && "✅ Uploaded"}
        {status === "error" && "❌ Upload failed"}
      </div>
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
}
