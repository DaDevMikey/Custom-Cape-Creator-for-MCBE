let scene, camera, renderer, player, cape;
let isRotating = true;
let initialCapeTexture = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the 3D preview if we're on the preview step
    if (document.getElementById('cape-preview-canvas')) {
        initModelViewer();
    }
});

function initModelViewer() {
    const canvas = document.getElementById('cape-preview-canvas');
    const canvasContainer = document.querySelector('.cape-preview-canvas-container');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);

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

    // Create player model
    createPlayer();
    
    // Add cape
    addCape();
    
    // Start animation loop
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    });
    
    // Click to toggle rotation
    canvas.addEventListener('click', () => {
        isRotating = !isRotating;
    });
}

function createPlayer() {
    // Basic player model (simplified)
    player = new THREE.Group();
    
    // Create body parts
    const materials = {
        skin: new THREE.MeshPhongMaterial({ color: 0xF9C8A8 }),
        shirt: new THREE.MeshPhongMaterial({ color: 0x4C89D7 }),
        pants: new THREE.MeshPhongMaterial({ color: 0x3E5F8A }),
        shoes: new THREE.MeshPhongMaterial({ color: 0x444444 }),
        hair: new THREE.MeshPhongMaterial({ color: 0x513A2F })
    };
    
    // Create head
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        materials.skin
    );
    head.position.y = 1.6;
    player.add(head);
    
    // Create hair (simple overlay)
    const hair = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.3, 0.85),
        materials.hair
    );
    hair.position.y = 1.85;
    player.add(hair);
    
    // Create body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 1.0, 0.4),
        materials.shirt
    );
    body.position.y = 0.7;
    player.add(body);
    
    // Create legs
    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.3),
        materials.pants
    );
    leftLeg.position.set(0.18, 0, 0);
    player.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.3),
        materials.pants
    );
    rightLeg.position.set(-0.18, 0, 0);
    player.add(rightLeg);
    
    // Create arms
    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.8, 0.25),
        materials.shirt
    );
    leftArm.position.set(0.48, 0.7, 0);
    player.add(leftArm);
    
    const rightArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.8, 0.25),
        materials.shirt
    );
    rightArm.position.set(-0.48, 0.7, 0);
    player.add(rightArm);
    
    // Add player to scene
    scene.add(player);
}

function addCape() {
    // Create placeholder cape texture
    const capeGeometry = new THREE.PlaneGeometry(1, 1.5);
    
    // Create a placeholder texture
    const placeholderTexture = createPlaceholderTexture();
    initialCapeTexture = placeholderTexture;
    
    const capeMaterial = new THREE.MeshPhongMaterial({
        map: placeholderTexture,
        side: THREE.DoubleSide,
        transparent: true
    });
    
    cape = new THREE.Mesh(capeGeometry, capeMaterial);
    cape.position.set(0, 0.9, -0.3);
    
    // Add cape to player
    player.add(cape);
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
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating) {
        player.rotation.y += 0.01;
    }
    
    if (renderer) {
        renderer.render(scene, camera);
    }
}

// Function to update the cape texture - exposed to window
window.updateCapeTexture = function(imageUrl) {
    if (!cape) return;
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        imageUrl,
        (texture) => {
            cape.material.map = texture;
            cape.material.needsUpdate = true;
        },
        undefined,
        (error) => {
            console.error('Error loading cape texture:', error);
            cape.material.map = initialCapeTexture;
            cape.material.needsUpdate = true;
        }
    );
};