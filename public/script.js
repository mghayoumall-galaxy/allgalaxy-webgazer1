window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');
    const images = [
        'images/image1.jpg',
        'images/image2.jpg',
        'images/image3.jpg',
        'images/image4.jpg',
        'images/image5.jpg',
        'images/image6.jpg',
        'images/image7.jpg',
        'images/image8.jpg',
        'images/image9.jpg',
        'images/image10.jpg'
    ];

    let currentImageIndex = 0;
    function showNextImage() {
        if (currentImageIndex < images.length) {
            demoImage.src = images[currentImageIndex++];
            setTimeout(showNextImage, 5000); // Rotate images every 5 seconds
        } else {
            console.log('Image display complete. Gaze data collection finished.');
            currentImageIndex = 0; // Reset index to loop images
            showNextImage(); // Start the cycle again if needed
        }
    }

    showNextImage();

    // Your specified USB camera's device ID
    const cameraDeviceId = '47e134a0cd256eb113dcf62b3f6936b13d741765b2b04ca99d027cb4b588306f';

    function setupCamera(deviceId) {
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera is now active with the specified device ID.');
            })
            .catch(error => {
                console.error('Error accessing the specified camera:', error);
                fallbackToDefaultCamera();
            });
    }

    function fallbackToDefaultCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Fallback to default camera successful.');
            })
            .catch(error => {
                console.error('Error accessing any camera:', error);
            });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera(cameraDeviceId);
    } else {
        console.error('Browser API navigator.mediaDevices.getUserMedia not available');
        fallbackToDefaultCamera();
    }
};
