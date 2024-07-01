window.onload = function() {
    const video = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');

    // Get access to the user's webcam
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (error) {
                console.log("Something went wrong with the webcam access!", error);
            });
    }

    // Image display logic
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
            demoImage.src = images[currentImageIndex];
            currentImageIndex++;
            setTimeout(showNextImage, 5000); // Show each image for 5 seconds
        } else {
            alert('Image display complete. Gaze data collection finished.');
        }
    }

    showNextImage();

    // Basic face tracking with tracking.js
    const tracker = new tracking.ObjectTracker('face');

    tracker.on('track', function(event) {
        if (event.data.length === 0) {
            // No faces were detected in this frame.
        } else {
            event.data.forEach(function(rect) {
                console.log(rect.x, rect.y, rect.width, rect.height);
                // Approximate eye region detection
                const eyeX = rect.x + rect.width / 4;
                const eyeY = rect.y + rect.height / 4;
                const eyeWidth = rect.width / 2;
                const eyeHeight = rect.height / 4;
                document.getElementById('gazeData').innerText = `Eye region detected at: X ${eyeX}, Y ${eyeY}`;
            });
        }
    });

    tracking.track(video, tracker);
};
