class Connector {
  constructor(startWheel, endPos) {
    this.startWheel = startWheel;  // Wheel where the connector begins
    this.endPos = endPos.copy();   // End point of the curve
    this.t = random(TWO_PI);       // Time offset for animation
    // Herman:
    // instead of a fixed colour, pick from the wheel's palette
    this.color = random(this.startWheel.palette);

    this.baseStroke = 3.0;         // base stroke width
    this.strokeAnim = this.baseStroke;
  }

  // Animate the connector's slight wobble
  update() {
    this.t += 0.02;
  }

  // Draw a curved line with a moving control point
  // Betty: Add shadow for every connector. 
  display() {

    // Start and end positions
    let x1 = this.startWheel.x;
    let y1 = this.startWheel.y;
    let x2 = this.endPos.x;
    let y2 = this.endPos.y;

    // Control point with gentle motion
    let cx = (x1 + x2) / 2 + 30 * sin(this.t);
    let cy = (y1 + y2) / 2 + 30 * cos(this.t);

    stroke(0, 90);
    strokeWeight(strokeWeight(4) + 3);
    noFill();

    beginShape();
    vertex(x1 + 1, y1 + 1);
    quadraticVertex(cx + 1, cy + 1, x2 + 1, y2 + 1);
    endShape();

    stroke(this.color);
    strokeWeight(4);
    noFill();

    beginShape();
    vertex(x1, y1);
    quadraticVertex(cx, cy, x2, y2);
    endShape();

    // Dot at the starting point
    noStroke();
    fill(this.color);
    ellipse(x1, y1, 10, 10);
  }
}
