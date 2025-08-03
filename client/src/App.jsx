import { useState } from 'react'
import './App.css'
import "reactflow/dist/style.css";
import SidePanel from './Sidebar.jsx'
import { ReactFlowProvider } from 'reactflow';
import Canvas from './Canvas.jsx'
import { GlobalStoreProvider } from 'reactflow-canvas-store';

function App() {

  return (
//      <div className="h-screen">
//       <SidePanel />
//       <ReactFlowProvider>
//         <div className="w-screen h-screen overflow-hidden">
//   <Canvas />
// </div>

//       </ReactFlowProvider>
//     </div>
<div className="flex flex-col h-screen">
  <div className="p-4 bg-gray-100">
    <SidePanel />
  </div>

  {/* React Flow Canvas Section */}
  <div className="flex-1 p-4">
    <div className="h-full w-full border border-gray-300 rounded-xl overflow-hidden shadow-lg">
      <GlobalStoreProvider>
      
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
      </GlobalStoreProvider>
    </div>
  </div>
</div>

  )
}

export default App
