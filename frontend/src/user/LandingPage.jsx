import React, { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FaPlayCircle, FaHeadphones, FaMicrophone, FaWaveSquare } from 'react-icons/fa';
import '../styles/LandingPage.css';
import Header from '../components/user/LandingPage/Header';
import HowItWorksSection from '../components/user/LandingPage/HowItWorksSection';

// Professional Minimal Particles
const ProfessionalParticles = () => {
  const pointsRef = useRef();
  const mouse = useRef(new THREE.Vector2(10000, 10000));
  
  const { initialPositions, colors } = useMemo(() => {
    const count = 2500; // Reduced particle count
    const initialPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // More organized grid-like distribution
      const x = (i % 50) - 25;
      const z = Math.floor(i / 50) - 25;
      
      initialPositions[i3] = x * 0.8 + (Math.random() - 0.5) * 2;
      initialPositions[i3 + 1] = (Math.random() - 0.5) * 10;
      initialPositions[i3 + 2] = z * 0.8 + (Math.random() - 0.5) * 2;
      
      // Single professional color scheme - subtle blue
      colors[i3] = 0.15;     // Minimal red
      colors[i3 + 1] = 0.35; // Subtle green
      colors[i3 + 2] = 0.7;  // Professional blue
    }
    
    return { initialPositions, colors };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const currentPositions = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < currentPositions.length; i += 3) {
      const initialX = initialPositions[i];
      const initialY = initialPositions[i + 1];
      
      const currentX = currentPositions[i];
      const currentY = currentPositions[i + 1];

      // Gentle wave animation - very subtle
      currentPositions[i + 1] = initialY + Math.sin(time * 0.5 + initialX * 0.1) * 0.5;

      // Refined mouse interaction
      const distance = Math.sqrt(
        (mouse.current.x - currentX) ** 2 +
        (mouse.current.y - currentY) ** 2
      );

      if (distance < 2) {
        const force = (2 - distance) * 0.08;
        currentPositions[i] += force * (currentX - mouse.current.x);
        currentPositions[i + 1] += force * (currentY - mouse.current.y);
      } else {
        currentPositions[i] = THREE.MathUtils.lerp(currentX, initialX, 0.05);
        currentPositions[i + 1] = THREE.MathUtils.lerp(currentY, initialY + Math.sin(time * 0.5 + initialX * 0.1) * 0.5, 0.05);
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points
      ref={pointsRef}
      onPointerMove={(e) => {
        if (e.intersections.length > 0) {
          mouse.current.x = e.intersections[0].point.x;
          mouse.current.y = e.intersections[0].point.y;
        }
      }}
      onPointerOut={() => {
        mouse.current.set(10000, 10000);
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={initialPositions.length / 3}
          array={initialPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Create a ref for the main scrollable container.
  const scrollContainerRef = useRef(null);

  return (
    // Attach the ref to your main container div.
    <div ref={scrollContainerRef} className="landing-page-container">
      <div className="landing-canvas-background">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <ProfessionalParticles />
            
            {/* Minimal professional lighting */}
            <ambientLight intensity={0.3} />
            <pointLight position={[5, 5, 5]} intensity={0.4} color="#3b82f6" />
            <pointLight position={[-5, -5, 5]} intensity={0.2} color="#1e40af" />
          </Suspense>
        </Canvas>
      </div>
      
      <Header/>
      
      <div className="landing-content-overlay">
        <div className="landing-hero-content sm:mt-14 mt-6">
          <h1 className="landing-hero-title">
            <span>STREAM</span>
            <span className="accent">YOUR</span>
            <span>BEATS</span>
          </h1>
          
          <div className="landing-hero-subtitle">
            <span>Professional DJ Streaming Platform</span>
          </div>
          
          <p className="landing-hero-description">
            Connect with music lovers worldwide. Stream live DJ sets, 
            build your audience, and share your passion with the world.
          </p>
          
          <div className="landing-features-container">
            <div className="player-wrapper">
              <div className="player-card landing-feature-card">
                <FaMicrophone className="text-3xl mb-3 text-blue-400" />
                <h3 className="text-lg font-bold mb-2">Live Streaming</h3>
                <p className="text-sm opacity-80">Broadcast HD quality music to global audience</p>
              </div>
            </div>
            
            <div className="player-wrapper">
              <div className="player-card landing-feature-card">
                <FaHeadphones className="text-3xl mb-3 text-blue-400" />
                <h3 className="text-lg font-bold mb-2">Interactive Chat</h3>
                <p className="text-sm opacity-80">Connect with listeners in real-time</p>
              </div>
            </div>
            
            <div className="player-wrapper">
              <div className="player-card landing-feature-card">
                <FaWaveSquare className="text-3xl mb-3 text-blue-400" />
                <h3 className="text-lg font-bold mb-2">Pro Tools</h3>
                <p className="text-sm opacity-80">Advanced mixing and effects</p>
              </div>
            </div>
          </div>
          
          <div className="landing-stats-container">
            <div className="landing-stat">
              <span className="landing-stat-number">15K+</span>
              <span className="landing-stat-label">Active DJs</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-number">2M+</span>
              <span className="landing-stat-label">Listeners</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-number">24/7</span>
              <span className="landing-stat-label">Live Music</span>
            </div>
          </div>
        </div>
      </div>

      <HowItWorksSection scrollContainerRef={scrollContainerRef} />
    </div>
  );
};

export default LandingPage;