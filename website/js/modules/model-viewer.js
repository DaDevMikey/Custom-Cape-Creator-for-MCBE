import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import state from './state.js';

let scene, camera, renderer, model;
let isRotating = true;
let initialCapeTexture = null;
let capeMesh, elytraMesh;

/* @tweakable player rotation speed */
const rotationSpeed = 0.01;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the 3D preview if we're on the preview step
    if (document.getElementById('cape-preview-canvas')) {
        initModelViewer();
    }
});

function initModelViewer() {
    const canvas = document.getElementById('cape-preview-canvas');
    const canvasContainer = document.querySelector('.cape-preview-canvas-container');
    
    if (!canvas || !canvasContainer) return;
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(45, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(2, 4, 3);
    scene.add(directionalLight);

    // Load Steve model
    loadSteveModel();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (!camera || !renderer || !canvasContainer) return;
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    });
    
    // Click to toggle rotation
    canvas.addEventListener('click', () => {
        isRotating = !isRotating;
    });
    
    // Setup view mode toggle if exists
    const viewModeToggle = document.getElementById('view-mode-toggle');
    if (viewModeToggle) {
        viewModeToggle.addEventListener('change', function() {
            state.viewMode = this.checked ? 'elytra' : 'cape';
            toggleCapeElytraDisplay();
        });
    }
}

function loadSteveModel() {
    const loader = new GLTFLoader();
    
    loader.load(
        'steve.glb',
        (gltf) => {
            model = gltf.scene;
            scene.add(model);
            
            // Scale and position the model
            model.scale.set(1.5, 1.5, 1.5);
            model.position.y = -1.5;
            
            // Find and configure cape and elytra meshes
            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    
                    if (node.name && node.name.toLowerCase().includes('cape')) {
                        capeMesh = node;
                    } else if (node.name && node.name.toLowerCase().includes('elytra')) {
                        elytraMesh = node;
                    }
                }
            });
            
            // If cape/elytra meshes are not found in the model, create them
            if (!capeMesh) {
                createCape();
            }
            
            if (!elytraMesh) {
                createElytra();
            }
            
            // Set initial visibility based on view mode
            toggleCapeElytraDisplay();
            
            // Create a placeholder texture
            initialCapeTexture = createPlaceholderTexture();
            
            // Apply texture to both cape and elytra
            if (capeMesh) {
                capeMesh.material.map = initialCapeTexture;
                capeMesh.material.needsUpdate = true;
            }
            
            if (elytraMesh) {
                elytraMesh.traverse((child) => {
                    if (child.isMesh) {
                        child.material.map = initialCapeTexture;
                        child.material.needsUpdate = true;
                    }
                });
            }
        },
        undefined,
        (error) => {
            console.error('Error loading Steve model:', error);
            // Fallback to simple player model
            createSimplePlayerModel();
        }
    );
}

function createSimplePlayerModel() {
    model = new THREE.Group();
    
    // Create body parts
    const materials = {
        skin: new THREE.MeshPhongMaterial({ color: 0xF9C8A8 }),
        shirt: new THREE.MeshPhongMaterial({ color: 0x4C89D7 }),
        pants: new THREE.MeshPhongMaterial({ color: 0x3E5F8A })
    };
    
    // Create head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        materials.skin
    );
    head.position.y = 1.6;
    model.add(head);
    
    // Create body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.4),
        materials.shirt
    );
    body.position.y = 0.7;
    model.add(body);
    
    // Create legs
    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.3),
        materials.pants
    );
    leftLeg.position.set(0.18, 0, 0);
    model.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.3),
        materials.pants
    );
    rightLeg.position.set(-0.18, 0, 0);
    model.add(rightLeg);
    
    // Create arms
    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.8, 0.25),
        materials.shirt
    );
    leftArm.position.set(0.48, 0.7, 0);
    model.add(leftArm);
    
    const rightArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.8, 0.25),
        materials.shirt
    );
    rightArm.position.set(-0.48, 0.7, 0);
    model.add(rightArm);
    
    // Add model to scene
    scene.add(model);
    
    // Create cape and elytra
    createCape();
    createElytra();
    
    // Set initial visibility
    toggleCapeElytraDisplay();
}

function createCape() {
    // Create cape mesh
    const capeGeometry = new THREE.PlaneGeometry(1, 1.5);
    const capeMaterial = new THREE.MeshPhongMaterial({
        map: createPlaceholderTexture(),
        side: THREE.DoubleSide,
        transparent: true
    });
    
    capeMesh = new THREE.Mesh(capeGeometry, capeMaterial);
    capeMesh.position.set(0, 0.9, -0.3);
    
    // Add cape to model
    model.add(capeMesh);
}

function createElytra() {
    // Create elytra (two wings)
    const wingGeometry = new THREE.PlaneGeometry(0.8, 1.2);
    const elytraMaterial = new THREE.MeshPhongMaterial({
        map: createPlaceholderTexture(),
        side: THREE.DoubleSide,
        transparent: true
    });
    
    // Create wings group
    elytraMesh = new THREE.Group();
    
    // Left wing
    const leftWing = new THREE.Mesh(wingGeometry, elytraMaterial.clone());
    leftWing.position.set(0.4, 0.9, -0.2);
    leftWing.rotation.y = Math.PI / 6;
    
    // Right wing
    const rightWing = new THREE.Mesh(wingGeometry, elytraMaterial.clone());
    rightWing.position.set(-0.4, 0.9, -0.2);
    rightWing.rotation.y = -Math.PI / 6;
    
    elytraMesh.add(leftWing);
    elytraMesh.add(rightWing);
    
    // Add elytra to model
    model.add(elytraMesh);
}

function toggleCapeElytraDisplay() {
    if (!capeMesh && !elytraMesh) return;
    
    if (capeMesh) capeMesh.visible = state.viewMode === 'cape';
    if (elytraMesh) elytraMesh.visible = state.viewMode === 'elytra';
}

function createPlaceholderTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Light blue background with a grid pattern
    ctx.fillStyle = '#5D87AA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add grid
    ctx.strokeStyle = '#476C43';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += 16) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += 16) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    
    ctx.stroke();
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Upload a cape', canvas.width / 2, canvas.height / 2);
    
    return new THREE.CanvasTexture(canvas);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating && model) {
        model.rotation.y += rotationSpeed;
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Function to update the cape texture - exposed to window
window.updateCapeTexture = function(imageUrl) {
    if (!capeMesh && !elytraMesh) return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        imageUrl,
        (texture) => {
            // Apply the texture to both cape and elytra
            if (capeMesh && capeMesh.material) {
                capeMesh.material.map = texture;
                capeMesh.material.needsUpdate = true;
            }
            
            if (elytraMesh) {
                // If elytra is a group, apply to all children
                if (elytraMesh.traverse) {
                    elytraMesh.traverse((child) => {
                        if (child.isMesh && child.material) {
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                        }
                    });
                } else if (elytraMesh.material) {
                    elytraMesh.material.map = texture;
                    elytraMesh.material.needsUpdate = true;
                }
            }
        },
        undefined,
        (error) => {
            console.error('Error loading cape texture:', error);
        }
    );
};

export { initModelViewer };