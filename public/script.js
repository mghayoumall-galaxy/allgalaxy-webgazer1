window.onload = function() {
    // Initialization checks
    if (typeof webgazer === 'undefined') {
        console.error('WebGazer library not loaded.');
        return;
    }

    // Set up WebGazer
    webgazer.setRegression('ridge')  // Use ridge regression for gaze prediction
           .setTracker('clmtrackr')  // Use clmtrackr to track the face
           .setGazeListener(function(data, elapsedTime) {
               if (data) {
                   updateGazeDisplay(data.x, data.y);
               }
           })
           .begin()
           .showVideoPreview(true)   // Show video preview from the webcam
           .showPredictionPoints(true); // Show where the model predicts you are looking

    const gazeDataDiv = document.getElementById('gazeData');
    const calibrationDiv = document.getElementById('calibrationDiv');
    const calibrationPoints = document.getElementsByClassName('calibrationPoint');

    // Function to update gaze coordinates displayed on the screen
    function updateGazeDisplay(x, y) {
        gazeDataDiv.innerHTML = `Gaze Coordinates: X=${x.toFixed(2)}, Y=${y.toFixed(2)}`;
        drawGazePoint(x, y);
    }

    // Canvas setup
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw gaze point on canvas
    function drawGazePoint(x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous gaze points
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI); // Draw a circle at the gaze location
        ctx.fill();
    }

    // Resize canvas on window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        webgazer.params.imgWidth = window.innerWidth;
        webgazer.params.imgHeight = window.innerHeight;
    });

    // Calibration setup
    Array.from(calibrationPoints).forEach(point => {
        point.addEventListener('click', function() {
            const rect = point.getBoundingClientRect();
            webgazer.addCalibrationPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            point.style.backgroundColor = 'green'; // Visual feedback for calibration
        });
    });

    // Ensure proper cleanup of WebGazer when the page is unloaded
    window.onbeforeunload = function() {
        webgazer.end();
    };

    // Optionally start the calibration automatically or add a button/event to trigger it
    function startCalibration() {
        calibrationDiv.style.display = 'block';
        Array.from(calibrationPoints).forEach(point => point.style.visibility = 'visible');
    }

    startCalibration(); // Start calibration upon load, can be triggered differently as needed
};
