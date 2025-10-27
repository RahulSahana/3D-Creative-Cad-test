document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const uploadSection = document.getElementById('upload-section');
    const loginForm = document.getElementById('login-form');
    const uploadForm = document.getElementById('upload-form');
    const logoutButton = document.getElementById('logout-button');
    const loginError = document.getElementById('login-error');
    const uploadStatus = document.getElementById('upload-status');
    const uploadButton = document.getElementById('upload-button');

    // --- Supabase Auth Handling ---

    // Check for an active session on page load
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            loginSection.style.display = 'none';
            uploadSection.style.display = 'block';
        } else {
            loginSection.style.display = 'block';
            uploadSection.style.display = 'none';
        }
    };
    checkSession();

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            loginError.textContent = error.message;
        } else {
            loginError.textContent = '';
            checkSession(); // Re-check session to show the upload form
        }
    });

    // Handle Logout
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        checkSession(); // Re-check session to show the login form
    });

    // Handle File Upload
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = uploadForm['item-title'].value;
        const description = uploadForm['item-description'].value;
        const category = uploadForm['item-category'].value;
        const imageFile = uploadForm['item-image'].files[0];

        if (!imageFile) {
            uploadStatus.textContent = "Please select an image file.";
            return;
        }

        uploadButton.disabled = true;
        uploadStatus.textContent = "Uploading... Please wait.";
        uploadStatus.className = "status-message loading";

        try {
            // 1. Upload image to Supabase Storage
            const filePath = `public/${Date.now()}_${imageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('jewelry-images')
                .upload(filePath, imageFile);

            if (uploadError) throw uploadError;

            // 2. Get public URL for the uploaded image
            const { data: { publicUrl } } = supabase.storage
                .from('jewelry-images')
                .getPublicUrl(filePath);

            // 3. Save item data to Supabase Database
            const { error: insertError } = await supabase
                .from('jewelry')
                .insert([{ 
                    title, 
                    description, 
                    category, 
                    imageUrl: publicUrl 
                }]);

            if (insertError) throw insertError;
            
            uploadStatus.textContent = "Design uploaded successfully!";
            uploadStatus.className = "status-message success";
            uploadForm.reset();

        } catch (error) {
            console.error("Error during upload process:", error);
            uploadStatus.textContent = `Upload failed: ${error.message}`;
            uploadStatus.className = "status-message error";
        } finally {
            uploadButton.disabled = false;
        }
    });
});

