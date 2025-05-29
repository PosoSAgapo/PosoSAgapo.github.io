// Profile Picture Switcher - Switch avatar based on current page
(function() {
    'use strict';
    
    // Configuration: Define different avatars for different pages
    const profileConfig = {
        '/': 'egoist.gif',           // Homepage - animated GIF
        '/publications/': 'academic.gif',    // Publications page - need to add this GIF
        '/cv/': 'professional.gif',         // CV page - need to add this GIF
        '/talks/': 'presentation.gif',      // Talks page - need to add this GIF
        '/teaching/': 'teaching.gif',       // Teaching page - need to add this GIF
        'default': 'egoist.gif'             // Fallback avatar
    };
    
    // Function to get current page path
    function getCurrentPath() {
        return window.location.pathname;
    }
    
    // Function to switch profile picture
    function switchProfilePicture() {
        const currentPath = getCurrentPath();
        const avatarImage = document.querySelector('.author__avatar img');
        
        if (!avatarImage) return;
        
        // Find matching avatar for current path
        let newAvatar = profileConfig['default'];
        
        // Check for exact path match first
        if (profileConfig[currentPath]) {
            newAvatar = profileConfig[currentPath];
        } else {
            // Check for partial path matches
            for (const path in profileConfig) {
                if (path !== 'default' && currentPath.includes(path.replace(/\//g, ''))) {
                    newAvatar = profileConfig[path];
                    break;
                }
            }
        }
        
        // Update the avatar source
        const basePath = document.querySelector('link[rel="stylesheet"]').href.replace(/\/assets\/css\/.*/, '') + '/images/';
        const newSrc = basePath + newAvatar;
        
        // Only update if the source is different
        if (!avatarImage.src.includes(newAvatar)) {
            // Add smooth transition effect
            avatarImage.style.transition = 'opacity 0.3s ease-in-out';
            avatarImage.style.opacity = '0.7';
            
            setTimeout(() => {
                avatarImage.src = newSrc;
                avatarImage.style.opacity = '1';
                
                // Debug log
                console.log('Switched avatar to:', newAvatar, 'for path:', currentPath);
            }, 150);
        }
    }
    
    // Initialize when DOM is ready
    function initialize() {
        // Switch avatar on page load
        switchProfilePicture();
        
        // Listen for navigation changes (for single-page app behavior)
        window.addEventListener('popstate', switchProfilePicture);
        
        // Also listen for clicks on navigation links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href]');
            if (link && link.hostname === window.location.hostname) {
                setTimeout(switchProfilePicture, 100);
            }
        });
    }
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also expose function globally for manual triggering
    window.switchProfilePicture = switchProfilePicture;
})(); 