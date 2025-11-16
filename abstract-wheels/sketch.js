let composition;

function setup() {
  createCanvas(800, 800);   // Canvas for the artwork
  angleMode(RADIANS);
  noStroke();

  composition = new Composition(); // Main scene controller
  composition.initLayout();        // Generate wheels and connectors
}

function draw() {
  background(BG_COLOR);
  drawBackgroundPattern();  // Background texture
  composition.update();     // Update animations
  composition.display();    // Draw all elements
}

// Simple dotted background texture
function drawBackgroundPattern() {
  noStroke();

  // Small dots
  fill(10, 90, 120, 140);
  for (let i = 0; i < 260; i++) {
    let x = random(width);
    let y = random(height);
    let d = random(2, 5);
    ellipse(x, y, d, d);
  }

  // A few slightly larger, softer dots
  fill(5, 60, 90, 80);
  for (let i = 0; i < 40; i++) {
    let x = random(width);
    let y = random(height);
    let d = random(12, 26);
    ellipse(x, y, d, d);
  }
}
