document.addEventListener('DOMContentLoaded', function () {
    // Custom Design Form Validation
    const customDesignForm = document.getElementById('custom-design-form');
    if (customDesignForm) {
        customDesignForm.addEventListener('submit', function (e) {
            let isValid = true;
            const requiredFields = customDesignForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    // You can add error styling here, e.g., field.style.borderColor = 'red';
                    console.log(`${field.name} is required.`);
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('Please fill out all required fields.');
            }
        });
    }

    // Contact Form Validation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
             e.preventDefault();
             // In a real application, you would add logic here to send the form data to a server.
             alert('Thank you for your message! This is a demo and the form is not connected to a server.');
             contactForm.reset();
        });
    }
});