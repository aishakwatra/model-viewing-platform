// app/components/ModelViewer.tsx
"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Text } from '@react-three/drei';

interface ModelViewerProps {
  // The GLTF/GLB file path from your database (e.g., '/models/sample1.glb')
  modelPath: string; 
}

// Component to load and display the GLTF model
function GltfModel({ modelPath }: { modelPath: string }) {
  
  // --- MODIFICATION HERE ---
  // Use the modelPath prop directly, which should be the public path to your .glb file.
  // Example: If modelPath is '/models/sample1.glb', useGLTF will correctly fetch it.
  const model = useGLTF(modelPath);

  return (
    // <primitive> is used to render a three.js object (the loaded model scene).
    <primitive object={model.scene} scale={1.5} rotation={[0, 0, 0]} />
  );
}

export function ModelViewer({ modelPath }: ModelViewerProps) {
  return (
    <div className="aspect-video w-full rounded-2xl bg-brown/5 shadow-[0_12px_40px_rgba(92,32,25,0.18)]">
      <Canvas 
        camera={{ position: [50, 50, 50], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />

        <OrbitControls enableZoom={true} enablePan={false} />
        
        <Environment preset="city" />

        <Suspense fallback={
          <Text color="#5C2019" anchorX="center" anchorY="middle" fontSize={0.5}>
            Loading 3D Model...
          </Text>
        }>
          {/* modelPath is passed down and used directly */}
          <GltfModel modelPath={modelPath} />
        </Suspense>
      </Canvas>
    </div>
  );
}