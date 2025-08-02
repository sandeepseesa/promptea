import { useEffect, useRef, useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useStore } from 'reactflow';
import { useGlobalStore } from "reactflow-canvas-store";

export default function OutputNode({ id, data }) {
  const { setNodes, getNodes } = useReactFlow();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const nodes = useStore((store) => store.getNodes());

  const [model, setModel] = useGlobalStore("model");
  const [docName] = useGlobalStore("docName");
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };


  useEffect(() => {
    scrollToBottom();
  }, [data.messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    console.log("log fron handle send")
    const query = input.trim();
    setLoading(true);

    // ✅ Get latest nodes from the React Flow store
    // const currentNodes = useStore.getState().getNodes(); // if you’re using reactflow v11+
    const currentNodes = getNodes();
    const llmNode = currentNodes.find((n) => n.type === "LLMEngine");
    const selectedLLM = llmNode?.data?.selectedLLM || "llama3"; // fallback default

    // Get KnowledgeBase node file name
    const kbNode = currentNodes.find((n) => n.type === "KnowledgeBase");
    const documentName = kbNode?.data?.documentName || null;

    const payload = {
      query,
      model: model || selectedLLM,
      documentName: docName,
    };

    console.log("Sending query with payload:", payload);

    let llmResponse;

    try {
      const res = await fetch("https://sandeepseesa-promptea-server.hf.space/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      const result = await res.json();
      // console.log("Parsed JSON result:", result);
      if (result.error) {
        llmResponse = {
          sender: "llm",
          model_used: result.model_used,
          type: "text",
          text: `❌ Error: ${result.error}`,
        };
      } else if (Array.isArray(result.answer)) {
        llmResponse = {
          sender: "llm",
          model_used: result.model_used,
          type: "serpapi",
          results: result.answer,
        };
      } else {
        llmResponse = {
          sender: "llm",
          model_used: result.model_used,
          type: "text",
          text: result.answer,
        };
      }
      console.log("🧠 Constructed llmResponse:", llmResponse);


      // Update chat
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
              ...n,
              data: {
                ...n.data,
                messages: [
                  ...(n.data.messages || []),
                  { sender: "user", type: "text", text: query },
                  llmResponse,
                ],
              },
            }
            : n
        )
      );
    } catch (err) {
      console.error("❌ Fetch failed:", err);  // Shows network or parsing errors in DevTools

      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unknown error";

      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? {
              ...n,
              data: {
                ...n.data,
                messages: [
                  ...(n.data.messages || []),
                  { sender: "user", type: "text", text: query },
                  {
                    sender: "llm",
                    type: "text",
                    text: `❌Failed to get data. ${errorMessage}`,
                  },
                ],
              },
            }
            : n
        )
      );
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
            ...n,
            data: {
              ...n.data,
              messages: [],
            },
          }
          : n
      )
    );
  };

  const formatLLMText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{
            __html:
              line.trim().startsWith("*") || line.trim().startsWith("-")
                ? `• ${formatted.replace(/^[-*]\s*/, "")}`
                : formatted,
          }}
        />
      );
    });
  };

  const renderSerpResults = (results) =>
    results.map((item, i) => (
      <div key={i} style={serpResultStyle}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {item.favicon && (
            <img
              src={item.favicon}
              alt="favicon"
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
          )}
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: "bold", color: "#1a0dab" }}
          >
            {item.title}
          </a>
        </div>
        <div style={{ fontSize: 14, color: "#444", marginTop: 4 }}>
          {item.snippet}
        </div>
        <div style={{ fontSize: 12, color: "#777" }}>
          {item.source} • {item.date}
        </div>
        <hr style={{ marginTop: 8, marginBottom: 8 }} />
      </div>
    ));

  return (
    <div style={nodeStyle}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{data.label}</strong>
        <button onClick={handleClear} style={{ fontSize: 12 }}>
          Clear
        </button>
      </div>

      <div style={chatBoxStyle}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {(data.messages || []).map((msg, i) => (
            <div
              key={i}
              style={{
                ...messageBubbleStyle.base,
                ...(msg.sender === "user"
                  ? messageBubbleStyle.user
                  : messageBubbleStyle.llm),
              }}
            >
              {msg.sender === "llm" && msg.model_used && (
                <div style={{ fontSize: 15, color: "#555", marginTop: 4 }}>
                  Model: {msg.model_used}
                </div>

              )}
              {msg.type === "serpapi"
                ? renderSerpResults(msg.results)
                : (<> {msg.sender === "llm" ? formatLLMText(msg.text) : msg.text}

                </>
                )}


            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask again..."
        style={{ width: "100%", marginTop: 5 }}
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading || !input.trim()}>
        {loading ? "Sending..." : "Send"}
      </button>

      <Handle type="target" position={Position.Left} />
    </div>
  );
}

const nodeStyle = {
  padding: 8,
  width: 550,
  background: "#f3e5f5",
  border: "2px solid #ab47bc",
  borderRadius: 6,
};

const chatBoxStyle = {
  height: 400,
  overflowY: "auto",
  background: "#fff",
  margin: "8px 0",
  padding: "6px",
  fontSize: "16px",
  border: "1px solid #ccc",
  borderRadius: "4px",
};

const messageBubbleStyle = {
  base: {
    padding: "10px",
    margin: "6px 0",
    borderRadius: "10px",
    maxWidth: "90%",
    wordWrap: "break-word",
  },
  user: {
    background: "#e1bee7",
    alignSelf: "flex-end",
    textAlign: "right",
  },
  llm: {
    background: "#ede7f6",
    alignSelf: "flex-start",
    textAlign: "left",
  },
};

const serpResultStyle = {
  marginBottom: 12,
  padding: "6px",
  background: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: "6px",
};
