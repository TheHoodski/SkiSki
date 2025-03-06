import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ResortDetails } from '../../types/resort';

interface MountainVisualizationProps {
  resortData: ResortDetails;
  crowdLevel?: string;
}

const MountainVisualization = ({ resortData, crowdLevel = 'low' }: MountainVisualizationProps) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xddf1ff); // Light blue sky
    
    // Camera setup
    const containerElement = mountRef.current as HTMLDivElement;
    const width = containerElement.clientWidth || window.innerWidth;
    const height = containerElement.clientHeight || window.innerHeight;
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      width / height, 
      0.1, 
      1000
    );
    camera.position.set(0, 10, 20);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    containerElement.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    
    // Create mountain
    const createMountain = () => {
      // Create a group to hold all mountain parts
      const mountainGroup = new THREE.Group();
      
      // Create base shape for mountain
      const mountainGeometry = new THREE.ConeGeometry(12, 15, 5);
      
      // Get crowd level color
      let mainColor;
      switch(crowdLevel.toLowerCase()) {
        case 'high':
          mainColor = new THREE.Color(0xffcccc); // Light red
          break;
        case 'medium':
          mainColor = new THREE.Color(0xffd699); // Light orange
          break;
        default:
          mainColor = new THREE.Color(0xccffcc); // Light green
      }
      
      // Create mountain material with color based on crowd level
      const mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: mainColor,
        flatShading: true,
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      mountain.rotation.y = Math.PI / 5;
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      mountainGroup.add(mountain);
      
      // Add snow cap
      const snowCapGeometry = new THREE.ConeGeometry(5, 5, 5);
      const snowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        flatShading: true
      });
      
      const snowCap = new THREE.Mesh(snowCapGeometry, snowMaterial);
      snowCap.position.y = 8;
      snowCap.castShadow = true;
      snowCap.receiveShadow = true;
      mountainGroup.add(snowCap);
      
      // Add trees
      const treeCount = 30;
      const maxRadius = 10;
      
      for (let i = 0; i < treeCount; i++) {
        const treeGroup = new THREE.Group();
        
        // Random position on mountainside
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Only place trees on lower half of mountain
        const y = Math.max(0, -0.3 * (x * x + z * z) / 2 + 1);
        
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 5);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 0.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        const treeTopGeometry = new THREE.ConeGeometry(0.8, 2, 5);
        const treeTopMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
        const treeTop = new THREE.Mesh(treeTopGeometry, treeTopMaterial);
        treeTop.position.y = 2;
        treeTop.castShadow = true;
        treeGroup.add(treeTop);
        
        treeGroup.position.set(x, y, z);
        mountainGroup.add(treeGroup);
      }
      
      // Add lodge
      const lodgeGroup = new THREE.Group();
      
      // Lodge base
      const lodgeBaseGeometry = new THREE.BoxGeometry(2, 1, 2);
      const lodgeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
      const lodgeBase = new THREE.Mesh(lodgeBaseGeometry, lodgeBaseMaterial);
      lodgeBase.position.y = 0.5;
      lodgeBase.castShadow = true;
      lodgeBase.receiveShadow = true;
      lodgeGroup.add(lodgeBase);
      
      // Lodge roof
      const lodgeRoofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
      const lodgeRoofMaterial = new THREE.MeshStandardMaterial({ color: 0x800000 });
      const lodgeRoof = new THREE.Mesh(lodgeRoofGeometry, lodgeRoofMaterial);
      lodgeRoof.position.y = 1.5;
      lodgeRoof.rotation.y = Math.PI / 4;
      lodgeRoof.castShadow = true;
      lodgeGroup.add(lodgeRoof);
      
      // Position lodge at base of mountain
      lodgeGroup.position.set(7, 0, 7);
      mountainGroup.add(lodgeGroup);
      
      // Add crowd indicator
      const createCrowdIndicator = () => {
        const group = new THREE.Group();
        
        // Sign post
        const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = 1.5;
        group.add(post);
        
        // Sign board
        const signGeometry = new THREE.BoxGeometry(2, 1, 0.1);
        
        let signColor;
        switch(crowdLevel.toLowerCase()) {
          case 'high':
            signColor = 0xFF0000; // Red
            break;
          case 'medium':
            signColor = 0xFF8C00; // Orange
            break;
          default:
            signColor = 0x00FF00; // Green
        }
        
        const signMaterial = new THREE.MeshStandardMaterial({ color: signColor });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.y = 2.8;
        group.add(sign);
        
        group.position.set(6, 0, 6);
        return group;
      };
      
      mountainGroup.add(createCrowdIndicator());
      
      // Position entire mountain group
      mountainGroup.position.y = -7.5;
      return mountainGroup;
    };
    
    // Add ground
    const groundGeometry = new THREE.CircleGeometry(30, 32);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff, 
      roughness: 1,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add mountain
    const mountain = createMountain();
    scene.add(mountain);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    setLoading(false);
    
    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const element = mountRef.current as HTMLDivElement;
      const width = element.clientWidth;
      const height = element.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
        const element = mountRef.current as HTMLDivElement;
        if (element.contains(renderer.domElement)) {
          element.removeChild(renderer.domElement);
        }
      }
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          if (object.material.isMaterial) {
            object.material.dispose();
          } else {
            // Handle materials array
            for (const material of object.material) {
              material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      controls.dispose();
    };
  }, [crowdLevel, resortData]);
  
  return (
    <div className="w-full h-64 lg:h-96 mb-4 rounded-lg overflow-hidden">
      {loading && (
        <div className="flex items-center justify-center w-full h-full bg-gray-100">
          Loading mountain view...
        </div>
      )}
      <div 
        ref={mountRef} 
        className="w-full h-full"
      ></div>
    </div>
  );
};

export default MountainVisualization;