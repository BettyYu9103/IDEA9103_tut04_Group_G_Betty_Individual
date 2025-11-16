class Wheel {
  constructor(x, y, baseRadius, palette) {
    this.x = x;
    this.y = y;
    this.baseRadius = baseRadius;
    this.palette = palette;   // Color set for this wheel
    this.rings = [];          // All ring layers inside the wheel

    this.rotation = 0;              // Stop at first
    this.rotationSpeed = 0.01;      // Speed when mouse touching the wheel
    this.currentSpeed = 0;
    this.istouch = false;         // Whether the mouse is on the wheel or not
  }

  // Whether the mouse is on the wheel or not
  isMouseOver() {
    const d = dist(mouseX, mouseY, this.x, this.y);
    return d <= this.baseRadius * 1.5;
  }

  // Create multiple ring layers with random types and colors
  initRings() {
    let numRings = floor(random(3, 6));
    let step = this.baseRadius / numRings;
    let currentInner = 0;

    for (let i = 0; i < numRings; i++) {
      let innerR = currentInner;
      let outerR = currentInner + step;
      currentInner = outerR;

      // Random ring type
      let rnd = random();
      let type = rnd < 0.33 ? "solid" : rnd < 0.66 ? "dots" : "rays";

      // Lachlan: force last ring to be solid
      if (i === numRings - 1) type = "solid";

      let mainColor = random(this.palette);
      let secondaryColor = random(this.palette);

      this.rings.push(
        new Ring(innerR, outerR, type, mainColor, secondaryColor)
      );
    }
  }

  // Update wheel rotation and ring animations
  update() {
    this.istouch = this.isMouseOver();
    const targetSpeed = this.istouch ? this.rotationSpeed : 0;
    this.currentSpeed = lerp(this.currentSpeed, targetSpeed, 0.1);
    this.rotation += this.currentSpeed;
    for (let r of this.rings) r.update();
  }

  // Draw wheel, its shadows, and all ring layers
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.rotation);

    const pixelStyle = this.istouch;   // Switch of pixel mode

    // Large soft background discs to increase visual density
    noStroke();
    fill(0, 35);
    ellipse(0, 0, this.baseRadius * 3.2, this.baseRadius * 3.2);

    fill(0, 55);
    ellipse(0, 0, this.baseRadius * 2.6, this.baseRadius * 2.6);

    // Offset shadow closest to the wheel
    fill(0, 80);
    ellipse(4, 6, this.baseRadius * 2.1, this.baseRadius * 2.1);

    // Herman:
    // add a coloured core circle in the centre of the wheel
    // to echo the painted artwork's central "eye" motif.
    // --------------------------------------------------
    noStroke();
    let coreColor = this.palette[0]; // use the first colour in the palette
    fill(coreColor);
    ellipse(0, 0, this.baseRadius * 0.6, this.baseRadius * 0.6);

    for (let r of this.rings) r.display(pixelStyle);            // Send the information back to rings

    // Herman:
    // add a subtle outer outline around the main wheel area
    // to make the overall structure slightly clearer.
    // --------------------------------------------------
    noFill();
    stroke(255, 45);        // soft outline
    strokeWeight(1.2);
    drawingContext.setLineDash([6, 6]);  // dash length, gap length
    ellipse(0, 0, this.baseRadius * 2.0, this.baseRadius * 2.0);

    // Reset line dash so it does not affect other drawings
    drawingContext.setLineDash([]);

    pop();
  }
}
