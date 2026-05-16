"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const WaveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SEPARATION = 40, AMOUNTX = 100, AMOUNTY = 40;
    let camera: THREE.PerspectiveCamera, scene: THREE.Scene, renderer: THREE.WebGLRenderer;
    let particles: THREE.Group = new THREE.Group();
    let count = 0;

    scene = new THREE.Scene();
    
    // Adjusted FOV and clipping planes for better visibility
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 200, 500);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Create a circular texture for the particles so they aren't just squares
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#e5e7eb';
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({ 
      map: texture,
      color: 0x9CA3AF,
      transparent: true,
      opacity: 0.42
    });

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const sprite = new THREE.Sprite(material);
        sprite.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
        sprite.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);

        // Change from (6, 6, 6) to a smaller value
        sprite.scale.set(1.5, 1.5, 1.5); 
        particles.add(sprite);
      }
    }
    scene.add(particles);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    containerRef.current.appendChild(renderer.domElement);

    const animate = () => {
  requestAnimationFrame(animate);
  
  particles.children.forEach((child, index) => {
    const ix = Math.floor(index / AMOUNTY);
    const iy = index % AMOUNTY;
    
    child.position.y = (Math.sin((ix + count) * 0.3) * 50) + (Math.sin((iy + count) * 0.5) * 50);
    
    // OLD: (Math.sin(...) + 1) * 3 + (Math.sin(...) + 1) * 3
    // NEW: Use smaller multipliers (e.g., 0.5 or 1) to keep dots tiny
    const s = (Math.sin((ix + count) * 0.3) + 1) * 0.8 + (Math.sin((iy + count) * 0.5) + 1) * 0.8;
    
    child.scale.set(s, s, s);
    });

    renderer.render(scene, camera);
    count += 0.05;
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0"
      style={{ zIndex: 1, pointerEvents: 'none' }} 
    />
  );
};