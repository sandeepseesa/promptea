import { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, { useNodesState, useEdgesState, addEdge, Background, Controls, MiniMap, useReactFlow } from "reactflow";
import UserQueryNode from "./UserQueryNode";
import KnowledgeBase from "./KnowledgeBase";
import LLMEngineNode from "./LLMEngineNode";
import OutputNode from "./OutputNode";
import { v4 as uuidv4 } from "uuid";

const nodeTypes = {
    userQuery: UserQueryNode,
    knowledgeBase: KnowledgeBase,
    llmEngine: LLMEngineNode,
    output: OutputNode,
};

const nodeTypeToLabel = {
    userQuery: "User Query",
    knowledgeBase: "Knowledge Base",
    llmEngine: "LLM Engine",
    output: "Output",
};

export default function Canvas() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    // const { getSelectedNodes, getSelectedEdges, deleteElements } = useReactFlow();

    const [isRunning, setIsRunning] = useState(false);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]

    );

    const { project } = useReactFlow();
    const reactFlowWrapper = useRef(null);


    const onDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData("application/reactflow");

        const alreadyExists = nodes.some(node => node.data?.type == type);
        if (alreadyExists) {
            alert(` ${nodeTypeToLabel[type]} already exists on the canvas.`);
            return;
        }
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        // const position = { x: event.clientX, y: event.clientY -  };
        //  const position = { x: 0, y: 5 };
        const position = project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode = {
            id: uuidv4(),
            // type: type === "knowledgeBase" ? "uploadNode" : "default",
            type,
            position,
            data: { label: nodeTypeToLabel[type], type },
        };
        setNodes((nds) => nds.concat(newNode));
    }, [nodes, setNodes, project]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);


    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();

            // if (key === "backspace" || key === "delete")
            if (key === "delete") {
                const selectedNodes = nodes.filter((node) => node.selected);
                const selectedEdges = edges.filter((edge) => edge.selected);

                if (selectedNodes.length || selectedEdges.length) {
                    setNodes((nds) => nds.filter((n) => !n.selected));
                    setEdges((eds) => eds.filter((e) => !e.selected));
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [nodes, edges, setNodes, setEdges]);

    const runWorkflow = async () => {
        setIsRunning(true);
        const userQueryNode = nodes.find((n) => n.type === "userQuery");
        const llmNode = nodes.find((n) => n.type === "llmEngine");
        const kbNode = nodes.find((n) => n.type === "knowledgeBase");
        let outputNode = nodes.find((n) => n.type === "output");

        const queryText = userQueryNode?.data?.query?.trim();
        const model = llmNode?.data?.model || "llama3";

        if (!queryText) {
            alert("❌ Please enter a query.");
            setIsRunning(false);
            return;
        }

        // Check if doc uploaded
        const documentName = kbNode?.data?.documentName;

        const payload = {
            query: queryText,
            model: model,
            documentName: documentName || null,
        };

        let responseMessage;

        try {
            const res = await fetch("https://promptea-server.onrender.com/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.error) {
                responseMessage = {
                    sender: "llm", type: "text", text: `❌ Error: ${data.error}`, model_used: data.model_used || model};
            } else if (Array.isArray(data.answer)) {
                responseMessage = {
                    sender: "llm", type: "serpapi", results: data.answer, model_used: data.model_used || model,
                };
            } else {
                responseMessage = { sender: "llm", type: "text",  text: data.answer || "⚠️ No answer returned", model_used: data.model_used || model,
                };
            }

        } catch (err) {
            console.error("Backend error:", err);
            responseMessage = { sender: "llm", type: "text", text: "❌ Could not reach the server" };
        }


        const responseMessages = [
            { sender: "user", type: "text", text: queryText },
            responseMessage,
        ];

        // If no output node dragged onto canvas, create one and display response
        if (!outputNode) {
            const newOutputNode = {
                id: uuidv4(),
                type: "output",
                position: { x: 150, y: 150 },
                data: {
                    label: "Output",
                    type: "output",
                    messages: responseMessages,
                    model: model,
                    documentName: documentName,
                },
            };
            setNodes((prev) => [...prev, newOutputNode]);
        } else {
            setNodes((prev) =>
                prev.map((n) =>
                    n.id === outputNode.id
                        ? {
                            ...n,
                            data: {
                                ...n.data,
                                messages: [
                                    ...(n.data.messages || []),
                                    ...responseMessages,
                                ],
                                model: model,
                                documentName: documentName,
                            },
                        }
                        : n
                )
            );
        }

        setIsRunning(false);
    };

    return (

        <div ref={reactFlowWrapper} className="h-full w-full overflow-hidden bg-gray-100 relative">
            <button
                className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={runWorkflow}
                disabled={isRunning}
            >
                {isRunning ? "Running..." : "▶️ Run"}
            </button>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                defaultViewport={{ zoom: 0.90, x: 0, y: 30 }}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                // fitView
                minZoom={0.5}
                maxZoom={1.3}
                panOnDrag={true}
                preventScrolling={false}
                nodeExtent={[
                    [0, 0],
                    [2000, 800],
                    // [window.innerWidth - 100, window.innerHeight - 150],
                ]}
                translateExtent={[
                    [0, 0],          // Top-left limit of the canvas
                    [2000, 800],    // Bottom-right limit
                    //  [window.innerWidth, window.innerHeight],
                ]}
            >
                <Background color="#aaa" gap={16} />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    )
}