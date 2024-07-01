window.onload = function() {
    const video = document.getElementById('webcamVideo');
    const demoImage = document.getElementById('demoImage');

    // Get access to the user's webcam
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                console.log("Webcam access granted.");
            })
            .catch(function (error) {
                console.log("Something went wrong with the webcam access!", error);
            });
    } else {
        console.log("getUserMedia not supported in this browser.");
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

    // Correctly initialize the ObjectTracker
    const tracker = new tracking.ObjectTracker('face');
    let gazeData = [];

    tracker.on('track', function(event) {
        console.log("Tracking event triggered.");
        if (event.data.length === 0) {
            console.log("No faces detected.");
        } else {
            event.data.forEach(function(rect) {
                console.log(`Face detected at X: ${rect.x}, Y: ${rect.y}, Width: ${rect.width}, Height: ${rect.height}`);
                // Approximate eye region detection
                const eyeX = rect.x + rect.width / 4;
                const eyeY = rect.y + rect.height / 4;
                const eyeWidth = rect.width / 2;
                const eyeHeight = rect.height / 4;
                const timestamp = Date.now();
                gazeData.push({ eyeX, eyeY, eyeWidth, eyeHeight, timestamp });
                document.getElementById('gazeData').innerText = `Eye region detected at: X ${eyeX}, Y ${eyeY}`;
            });
        }
    });

    tracking.track(video, tracker);

    window.addEventListener('beforeunload', function() {
        // Save gaze data to the server
        fetch('/save-gaze-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gazeData)
        }).then(response => {
            if (response.ok) {
                console.log('Gaze data saved successfully.');
            } else {
                console.log('Failed to save gaze data.');
            }
        }).catch(error => {
            console.log('Error saving gaze data:', error);
        });
    });
};
