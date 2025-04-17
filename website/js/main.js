import state from './modules/state.js';
import { initNavigation, goToStep } from './modules/navigation.js';
import { showError, showSuccess, addNotificationStyles } from './modules/notifications.js';
import { initModals } from './modules/modals.js';
import { initModelViewer } from './modules/model-viewer.js';
import { initSounds, playSound } from './modules/sound.js';
import { generateUUID, sanitizeFileName } from './modules/utils.js';

/* @tweakable notification display time in ms */
const notificationDuration = 5000;

/* @tweakable primary theme color (hex code) */
const primaryThemeColor = '#41887e';

document.addEventListener('DOMContentLoaded', () => {
    // Set tweakable values
    document.documentElement.style.setProperty('--primary-color', primaryThemeColor);
    
    // Add notification styles
    addNotificationStyles(notificationDuration);
    
    // Initialize UI components and core functionality
    initCoreFeatures();
    
    // Expose necessary functions to window
    window.showError = showError;
    window.showSuccess = showSuccess;
    window.updatePreview = updatePreview;
    window.goToStep = goToStep; // Make goToStep globally accessible
    
    // Start at step 1
    goToStep(1);
    
    // Fix step navigation
    fixStepNavigation();
});

// Core functionality
function initCoreFeatures() {
    // Initialize sounds
    initSounds();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize cape uploader
    initCapeUploader();
    
    // Initialize modals and popups
    initModals();
    
    // Initialize download functionality
    initDownloadButton();
    
    // Log that initialization is complete
    console.log('Core features initialized');
}

// Cape uploader functionality
function initCapeUploader() {
    const capeUploader = document.getElementById('cape-uploader');
    const capeFileInput = document.getElementById('cape-file-input');
    
    if (!capeUploader || !capeFileInput) {
        console.warn('Cape uploader elements not found');
        return;
    }
    
    capeUploader.addEventListener('click', () => {
        capeFileInput.click();
    });

    capeUploader.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        capeUploader.classList.add('drag-over');
    });

    capeUploader.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        capeUploader.classList.remove('drag-over');
    });

    capeUploader.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        capeUploader.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        processFiles(files);
    });

    capeFileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        processFiles(files);
    });
}

// Process uploaded files
async function processFiles(files) {
    const capeList = document.getElementById('cape-list');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError(`${file.name} is not an image file.`);
            continue;
        }
        
        try {
            // Create object URL for preview
            const imageUrl = URL.createObjectURL(file);
            
            // Read file as data URL for storage
            const dataUrl = await readFileAsDataURL(file);
            
            // Validate image dimensions
            const dimensions = await getImageDimensions(imageUrl);
            if (dimensions.width !== 128 || dimensions.height !== 64) {
                showError(`${file.name} should be 128×64 pixels for best results. Current size: ${dimensions.width}×${dimensions.height}`);
                // Continue anyway but warn the user
            }
            
            // Add to state
            const capeName = getUniqueCapeName(file.name.split('.')[0]);
            const cape = {
                id: generateUUID(),
                name: capeName,
                originalFileName: file.name,
                dataUrl: dataUrl,
                previewUrl: imageUrl
            };
            
            state.capes.push(cape);
            
            // Add to UI
            addCapeToUI(cape);
            
            // Play sound
            playSound('success');
        } catch (error) {
            console.error('Error processing file:', error);
            showError(`Error processing ${file.name}`);
        }
    }
    
    // Reset file input
    if (document.getElementById('cape-file-input')) {
        document.getElementById('cape-file-input').value = '';
    }
}

// Helper function to read file as Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper function to get unique cape name
function getUniqueCapeName(baseName) {
    // Clean up base name to be valid for cape names
    const cleanName = baseName.replace(/[^a-zA-Z0-9_]/g, '_');
    
    // Check if name exists already
    const existingNames = state.capes.map(cape => cape.name);
    
    if (!existingNames.includes(cleanName)) {
        return cleanName;
    }
    
    // Add numeric suffix if needed
    let counter = 1;
    let newName = `${cleanName}_${counter}`;
    
    while (existingNames.includes(newName)) {
        counter++;
        newName = `${cleanName}_${counter}`;
    }
    
    return newName;
}

// Add cape to UI
function addCapeToUI(cape) {
    const capeList = document.getElementById('cape-list');
    if (!capeList) return;
    
    const capeItem = document.createElement('div');
    capeItem.className = 'cape-item';
    capeItem.dataset.id = cape.id;
    
    capeItem.innerHTML = `
        <img src="${cape.previewUrl}" alt="${cape.name}" class="cape-preview">
        <div class="cape-info">
            <input type="text" class="cape-name-input" value="${cape.name}" placeholder="Cape Name" required>
            <span class="cape-file-name">${cape.originalFileName}</span>
        </div>
        <div class="cape-remove" title="Remove Cape">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    // Add event listeners
    const removeBtn = capeItem.querySelector('.cape-remove');
    removeBtn.addEventListener('click', () => {
        removeCape(cape.id);
        capeItem.remove();
        playSound('click');
    });
    
    const nameInput = capeItem.querySelector('.cape-name-input');
    nameInput.addEventListener('change', () => {
        const capeIndex = state.capes.findIndex(c => c.id === cape.id);
        if (capeIndex !== -1) {
            state.capes[capeIndex].name = nameInput.value;
        }
    });
    
    capeList.appendChild(capeItem);
}

// Remove cape
function removeCape(capeId) {
    const capeIndex = state.capes.findIndex(cape => cape.id === capeId);
    if (capeIndex !== -1) {
        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(state.capes[capeIndex].previewUrl);
        state.capes.splice(capeIndex, 1);
    }
}

// Get image dimensions
function getImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = url;
    });
}

// Update preview section
function updatePreview() {
    // Update pack info
    document.getElementById('preview-pack-name').textContent = state.packInfo.name;
    document.getElementById('preview-pack-description').textContent = state.packInfo.description;
    document.getElementById('preview-creator-name').textContent = state.packInfo.creator || 'Anonymous';
    document.getElementById('preview-pack-version').textContent = state.packInfo.version || '1.0.0';
    document.getElementById('preview-cape-count').textContent = state.capes.length;
    
    // Update cape previews
    const previewCapeList = document.getElementById('preview-cape-list');
    if (previewCapeList) {
        previewCapeList.innerHTML = '';
    }
    
    // Update cape select in 3D preview
    const capeSelect = document.getElementById('preview-cape-select');
    if (capeSelect) {
        capeSelect.innerHTML = '';
    }
    
    state.capes.forEach(cape => {
        // Add to preview list
        if (previewCapeList) {
            const capeItem = document.createElement('div');
            capeItem.className = 'preview-cape-item';
            capeItem.innerHTML = `
                <img src="${cape.previewUrl}" alt="${cape.name}" class="preview-cape-img">
                <div class="preview-cape-name">${cape.name}</div>
            `;
            previewCapeList.appendChild(capeItem);
        }
        
        // Add to cape select
        if (capeSelect) {
            const option = document.createElement('option');
            option.value = cape.id;
            option.textContent = cape.name;
            capeSelect.appendChild(option);
        }
    });
    
    // Initialize 3D preview with first cape
    if (state.capes.length > 0 && capeSelect) {
        if (window.updateCapeTexture) {
            window.updateCapeTexture(state.capes[0].dataUrl);
        }
        capeSelect.value = state.capes[0].id;
    }
    
    // Add listener to cape select
    if (capeSelect) {
        capeSelect.addEventListener('change', (e) => {
            const selectedCapeId = e.target.value;
            const selectedCape = state.capes.find(cape => cape.id === selectedCapeId);
            if (selectedCape && window.updateCapeTexture) {
                window.updateCapeTexture(selectedCape.dataUrl);
            }
        });
    }
}

// Download functionality
function initDownloadButton() {
    const downloadMcpackBtn = document.getElementById('download-mcpack');
    
    if (downloadMcpackBtn) {
        downloadMcpackBtn.addEventListener('click', () => {
            generateResourcePack();
        });
    }
}

// Generate resource pack
async function generateResourcePack() {
    try {
        const zip = new JSZip();
        
        // Create pack structure
        const rootFolder = zip;
        
        // Add manifest.json
        const manifestJson = createManifest();
        rootFolder.file('manifest.json', JSON.stringify(manifestJson, null, 2));
        
        // Create proper folder structure for Bedrock capes
        const texturesFolder = rootFolder.folder('textures');
        const capeFolder = texturesFolder.folder('cape');
        
        // Add cape images to the cape folder
        for (const cape of state.capes) {
            const imageData = cape.dataUrl.split(',')[1]; // Remove data:image/png;base64, part
            capeFolder.file(`${cape.name}.png`, imageData, { base64: true });
        }
        
        // Add pack_icon.png
        rootFolder.file('pack_icon.png', await fetchAsset('assets/pack_icon.png'), { binary: true });
        
        // Generate zip file with .mcpack extension
        let zipContent = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' });
        saveAs(zipContent, `${sanitizeFileName(state.packInfo.name)}.mcpack`);
        
        showSuccess(`Your cape pack has been successfully generated!`);
        playSound('success');
        return true;
        
    } catch (error) {
        console.error('Error generating resource pack:', error);
        showError('Failed to generate resource pack. Please try again.');
        return false;
    }
}

// Create manifest file
function createManifest() {
    return {
        format_version: 2,
        header: {
            name: state.packInfo.name,
            description: state.packInfo.description,
            uuid: generateUUID(),
            version: [1, 0, 0],
            min_engine_version: [1, 16, 0]
        },
        modules: [
            {
                type: 'resources',
                uuid: generateUUID(),
                version: [1, 0, 0]
            }
        ]
    };
}

// Fetch asset as binary
async function fetchAsset(url) {
    const response = await fetch(url);
    return await response.arrayBuffer();
}

// Fix for step navigation
function fixStepNavigation() {
    const stepElements = document.querySelectorAll('.step');
    
    stepElements.forEach(step => {
        step.addEventListener('click', () => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber <= state.currentStep) {
                goToStep(stepNumber);
                playSound('click');
            }
        });
    });
}