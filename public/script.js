window.onload = function() {
    // Check if WebGazer has loaded correctly
    if (!webgazer) {
        console.error("WebGazer has not loaded properly.");
        return;
    }

    // Initialize WebGazer with the webcam video
    webgazer.setRegression('ridge')   // Use ridge regression model for predictions
           .setTracker('clmtrackr')   // Use clmtrackr for facial feature tracking
           .setGazeListener(function(data, timestamp) {
               if (data) {
                   displayGaze(data.x, data.y);
               }
           })
           .begin()
           .showVideoPreview(true)    // Display the video preview from the webcam
           .showPredictionPoints(true); // Show the prediction points in the video preview

    // Element for displaying gaze coordinates
    const gazeDataDiv = document.getElementById('gazeData');

    // Function to display the gaze coordinates on the webpage
    function displayGaze(x, y) {
        gazeDataDiv.innerHTML = `Gaze Coordinates - X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}`;
        plotGaze(x, y); // Call function to visualize gaze point on the screen
    }

    // Canvas setup for plotting gaze point
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Function to draw gaze point on canvas
    function plotGaze(x, y) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous gaze points
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'; // Red color with transparency
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI); // Draw circle at gaze point
        ctx.fill();
    }

    // Handle resizing of window
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // Ensure to clean up and end WebGazer when leaving the page
    window.addEventListener('beforeunload', function() {
        webgazer.end();
    });
};
