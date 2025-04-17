import state from './state.js';
import { showError } from './notifications.js';
import { playSound } from './sound.js';

// Navigation functionality
function initNavigation() {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const nextButtons = document.querySelectorAll('.next-btn');
    
    // Next buttons
    nextButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const currentStep = parseInt(document.querySelector('.step.active').dataset.step);
            
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
                playSound('click');
            }
        });
    });
    
    // Previous buttons
    prevButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const currentStep = parseInt(document.querySelector('.step.active').dataset.step);
            goToStep(currentStep - 1);
            playSound('click');
        });
    });
    
    // Create new pack button
    const createNewPackBtn = document.getElementById('create-new-pack');
    if (createNewPackBtn) {
        createNewPackBtn.addEventListener('click', resetState);
    }
}

// Step navigation
function goToStep(stepNumber) {
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    
    steps.forEach(step => {
        const stepIndex = parseInt(step.dataset.step);
        step.classList.remove('active', 'completed');
        
        if (stepIndex === stepNumber) {
            step.classList.add('active');
        } else if (stepIndex < stepNumber) {
            step.classList.add('completed');
        }
    });

    stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === stepNumber) {
            content.classList.add('active');
        }
    });

    state.currentStep = stepNumber;
    
    // If going to preview step, update preview
    if (stepNumber === 3) {
        if (window.updatePreview) {
            window.updatePreview();
        }
    }
}

// Form validation
function validateStep(stepNumber) {
    switch (stepNumber) {
        case 1:
            const packName = document.getElementById('pack-name').value;
            const packDescription = document.getElementById('pack-description').value;
            
            if (!packName.trim()) {
                showError('Please enter a pack name.');
                return false;
            }
            if (!packDescription.trim()) {
                showError('Please enter a pack description.');
                return false;
            }
            
            // Save pack info to state
            state.packInfo.name = packName;
            state.packInfo.description = packDescription;
            state.packInfo.creator = document.getElementById('creator-name').value;
            state.packInfo.version = document.getElementById('pack-version').value || '1.0.0';
            
            return true;
            
        case 2:
            if (state.capes.length === 0) {
                showError('Please upload at least one cape design.');
                return false;
            }
            
            // Validate cape names
            const capeNames = state.capes.map(cape => cape.name);
            if (capeNames.some(name => !name.trim() || !/^[a-zA-Z0-9_]+$/.test(name))) {
                showError('All capes must have a name that contains only letters, numbers, and underscores.');
                return false;
            }
            
            // Check for duplicate names
            if (new Set(capeNames).size !== capeNames.length) {
                showError('Each cape must have a unique name.');
                return false;
            }
            
            return true;
            
        case 3:
            // Preview step validation (if needed)
            return true;
            
        default:
            return true;
    }
}

// Reset state to initial values
function resetState() {
    // Reset pack info
    state.packInfo = {
        name: '',
        description: '',
        creator: '',
        version: '1.0.0'
    };
    
    // Reset capes
    state.capes.forEach(cape => {
        URL.revokeObjectURL(cape.previewUrl);
    });
    state.capes = [];
    
    // Reset form fields
    document.getElementById('pack-name').value = '';
    document.getElementById('pack-description').value = '';
    document.getElementById('creator-name').value = '';
    document.getElementById('pack-version').value = '1.0.0';
    
    // Clear cape list
    const capeList = document.getElementById('cape-list');
    if (capeList) {
        capeList.innerHTML = '';
    }
    
    // Go to step 1
    goToStep(1);
    
    // Play sound
    playSound('click');
}

export { initNavigation, goToStep, validateStep, resetState };