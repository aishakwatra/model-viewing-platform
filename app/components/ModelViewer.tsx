"use client";

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Text } from '@react-three/drei';

interface ModelViewerProps {
  modelPath: string; 
}

// Component to load and display the GLTF model
function GltfModel({ modelPath }: { modelPath: string }) {
  
  const model = useGLTF(modelPath);
  return (
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
            Loading Model
          </Text>
        }>
          <GltfModel modelPath={modelPath} />
        </Suspense>
      </Canvas>
    </div>
  );
}