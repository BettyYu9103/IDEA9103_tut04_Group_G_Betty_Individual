class Ring {
  constructor(innerR, outerR, type, colorMain, colorSecondary) {
    this.innerR = innerR;
    this.outerR = outerR;
    this.type = type;              // Ring style: solid, dots, or rays
    this.colorMain = colorMain;
    this.colorSecondary = colorSecondary;
    this.noiseOffset = random(1000); // For small animated variation
  }

  // Update ring animation state
  update() {
    this.noiseOffset += 0.01;
  }

  // Render ring based on its type
  display(pixelStyle = false) {
    if (this.type === "solid") {
      this.drawSolid();
    } else if (this.type === "dots") {
      this.drawDots(pixelStyle);
    } else if (this.type === "rays") {
      this.drawRays();
    }
  }

  // Thick outline ring
  drawSolid() {
    
  // Herman: convert solid ring into dashed ring style
  // Set dashed stroke pattern
  drawingContext.setLineDash([8, 6]);  // [dashLength, gapLength]

  stroke(this.colorMain);
  strokeWeight(this.outerR - this.innerR);
  noFill();

  let r = this.innerR + this.outerR;
  ellipse(0, 0, r * 2, r * 2);

  // Reset dash so it won't affect other drawings
  drawingContext.setLineDash([]);
}

   // Circular ring of animated dots
  drawDots(pixelStyle = false) {
    noStroke();
    fill(this.colorMain);

    let numDots = 36;
    let r = (this.innerR + this.outerR) / 2;

    for (let i = 0; i < numDots; i++) {
      let angle = (TWO_PI / numDots) * i;
      let x = r * cos(angle);
      let y = r * sin(angle);

      // Noise adds organic fluctuation
      let d = map(noise(this.noiseOffset + i * 0.1), 0, 1, 4, 8);
      
      // Difference of spuare and circle
      if (pixelStyle) {
      rectMode(CENTER);
      rect(x, y, d, d);
      } else {
      ellipse(x, y, d, d);
      }
    }
  }


  // Radial line pattern
  drawRays() {
    stroke(this.colorMain);
    strokeWeight(2);
    noFill();

    let numRays = 40;
    for (let i = 0; i < numRays; i++) {
      let angle = (TWO_PI / numRays) * i;
      let x1 = this.innerR * cos(angle);
      let y1 = this.innerR * sin(angle);
      let x2 = this.outerR * cos(angle);
      let y2 = this.outerR * sin(angle);
      line(x1, y1, x2, y2);
    }

    // Small center circle for visual contrast
    noStroke();
    fill(this.colorSecondary);
    ellipse(0, 0, this.innerR * 0.8, this.innerR * 0.8);
  }
}
