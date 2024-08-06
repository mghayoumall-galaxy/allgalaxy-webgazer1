window.onload = function() {
    const videoElement = document.getElementById('webcamVideo');
    const gazeDataDiv = document.getElementById('gazeData');

    // Test WebGazer initialization
    function setupWebGazer() {
        console.log('Setting up WebGazer...');
        webgazer.begin()
            .then(() => {
                console.log('WebGazer started.');
                webgazer.setGazeListener(function(data) {
                    if (data) {
                        gazeDataDiv.innerText = `Gaze coordinates: X ${data.x.toFixed(2)}, Y ${data.y.toFixed(2)}`;
                    }
                }).showPredictionPoints(true);
                webgazer.setVideoElement(videoElement);
            })
            .catch(err => {
                console.error('Error setting up WebGazer:', err);
            });
    }

    function setupCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoElement.srcObject = stream;
                videoElement.play();
                console.log('Camera active.');
                setupWebGazer();
            })
            .catch(err => {
                console.error('Camera error:', err);
            });
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setupCamera();
    } else {
        console.error('getUserMedia not supported.');
    }
};
