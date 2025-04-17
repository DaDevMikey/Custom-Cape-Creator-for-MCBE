import { showError } from './notifications.js';

/* @tweakable modal background opacity */
const modalBackgroundOpacity = 0.7;

/* @tweakable modal content max width in pixels */
const modalMaxWidth = 800;

/* @tweakable animation duration in milliseconds */
const modalAnimationDuration = 300;

function initModals() {
    const tutorialBtn = document.getElementById('tutorial-btn');
    const donateBtn = document.getElementById('donate-btn');
    const tutorialModal = document.getElementById('tutorial-modal');
    const donationModal = document.getElementById('donation-modal');
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    const closeBtns = document.querySelectorAll('.close-modal');
    const downloadTemplateBtn = document.getElementById('download-template');
    
    // Apply tweakable values to modal styles
    document.documentElement.style.setProperty('--modal-bg-opacity', modalBackgroundOpacity);
    document.documentElement.style.setProperty('--modal-max-width', `${modalMaxWidth}px`);
    document.documentElement.style.setProperty('--modal-animation-duration', `${modalAnimationDuration}ms`);
    
    // Modal open buttons
    if (tutorialBtn && tutorialModal) {
        tutorialBtn.addEventListener('click', () => {
            tutorialModal.style.display = 'block';
        });
    }
    
    if (donateBtn && donationModal) {
        donateBtn.addEventListener('click', () => {
            donationModal.style.display = 'block';
        });
    }
    
    // Privacy Policy
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            showPrivacyPolicy();
        });
    }
    
    // Terms of Use
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTermsOfUse();
        });
    }
    
    // Close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Tab handling
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tabId = btn.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Download template
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            fetch('assets/cape_template.png')
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'cape_template.png';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                })
                .catch(err => {
                    console.error('Error downloading template:', err);
                    showError('Failed to download template. Please try again.');
                });
        });
    }
    
    // Donation buttons
    document.querySelectorAll('.donate-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.dataset.method;
            switch (method) {
                case 'paypal':
                    window.open('https://ko-fi.com/damanmikey', '_blank');
                    break;
                case 'crypto':
                    showModal('Donate with Cryptocurrency', 'Bitcoin Address: bc1qc3xsy62kl79gttevcsjv4kt29v2quyjp3tjw2a');
                    break;
                case 'coffee':
                    window.open('https://ko-fi.com/damanmikey', '_blank');
                    break;
            }
        });
    });
    
    // Create and add privacy policy and terms modals to the DOM
    createPrivacyPolicyModal();
    createTermsOfUseModal();
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${title}</h2>
            <p>${content}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function createPrivacyPolicyModal() {
    const modal = document.createElement('div');
    modal.id = 'privacy-policy-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Privacy Policy</h2>
            <div class="policy-content">
                <h3>Last Updated: January 1, 2025</h3>
                
                <p>Welcome to Minecraft Cape Creator. We respect your privacy and are committed to protecting your personal data.</p>
                
                <h4>1. Information We Collect</h4>
                <p>We collect minimal information when you use our site:</p>
                <ul>
                    <li>Usage data (browser type, device information, IP address)</li>
                    <li>Any images you upload for cape creation (these are processed locally and not stored on our servers)</li>
                </ul>
                
                <h4>2. How We Use Your Information</h4>
                <p>We use the information to:</p>
                <ul>
                    <li>Provide and improve our cape creation service</li>
                    <li>Diagnose technical issues</li>
                    <li>Monitor and analyze usage patterns</li>
                </ul>
                
                <h4>3. Data Security</h4>
                <p>Your uploaded images are processed locally in your browser and are not transmitted to our servers. We do not store your cape designs.</p>
                
                <h4>4. Cookies</h4>
                <p>We use essential cookies to ensure the functionality of our website. These cookies do not track you for advertising purposes.</p>
                
                <h4>5. Third-Party Services</h4>
                <p>We may use analytics services that collect anonymous usage data to help us improve our service.</p>
                
                <h4>6. Children's Privacy</h4>
                <p>Our service is intended for all ages. We do not knowingly collect personal information from children under 13.</p>
                
                <h4>7. Changes to This Policy</h4>
                <p>We may update this policy periodically. We will notify you of any changes by posting the new policy on this page.</p>
                
                <h4>8. Contact Us</h4>
                <p>If you have questions about this Privacy Policy, please contact us via our <a href="https://discord.gg/BDKPuZmsVE" target="_blank">Discord server</a>.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function createTermsOfUseModal() {
    const modal = document.createElement('div');
    modal.id = 'terms-of-use-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Terms of Use</h2>
            <div class="policy-content">
                <h3>Last Updated: January 1, 2025</h3>
                
                <p>By using Minecraft Cape Creator, you agree to these Terms of Use. Please read them carefully.</p>
                
                <h4>1. Acceptance of Terms</h4>
                <p>By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.</p>
                
                <h4>2. Description of Service</h4>
                <p>Minecraft Cape Creator provides tools for creating custom cape resource packs for Minecraft Bedrock Edition. The service is provided "as is" without warranties of any kind.</p>
                
                <h4>3. User Responsibilities</h4>
                <ul>
                    <li>You are responsible for all content you upload to our service</li>
                    <li>You agree not to upload content that infringes on copyrights or intellectual property rights</li>
                    <li>You agree not to upload inappropriate or offensive content</li>
                    <li>You understand that capes created are for personal use only</li>
                </ul>
                
                <h4>4. Intellectual Property</h4>
                <p>Minecraft is a trademark of Mojang Studios. We are not affiliated with, endorsed by, or connected to Mojang or Microsoft.</p>
                <p>The capes you create are your own content. We claim no ownership over your designs.</p>
                
                <h4>5. Limitation of Liability</h4>
                <p>In no event shall Minecraft Cape Creator, its operators, or contributors be liable for any direct, indirect, incidental, special, or consequential damages arising out of the use or inability to use our services.</p>
                
                <h4>6. Changes to Terms</h4>
                <p>We reserve the right to modify these terms at any time. Your continued use of the service after such modifications constitutes your acceptance of the revised terms.</p>
                
                <h4>7. Governing Law</h4>
                <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service operators reside.</p>
                
                <h4>8. Contact</h4>
                <p>If you have any questions about these Terms, please contact us via our <a href="https://discord.gg/BDKPuZmsVE" target="_blank">Discord server</a>.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showPrivacyPolicy() {
    const modal = document.getElementById('privacy-policy-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function showTermsOfUse() {
    const modal = document.getElementById('terms-of-use-modal');
    if (modal) {
        modal.style.display = 'block';
    }
}

export { initModals, showModal };