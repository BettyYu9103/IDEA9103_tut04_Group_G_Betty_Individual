// Animation controllers
const BEAD_SINE_SPEED   = 0.01;
const BEAD_SINE_FREQ    = 1;
const BEAD_N_AMP_FACTOR = 0.1;
const BEAD_T_AMP_FACTOR = 0.05;

class HexCell {
  constructor(x, y, outerR) {
    this.x = x;
    this.y = y;
    this.outerR = outerR;

    this.innerR = (sqrt(3)/2) * outerR;
    this.wheelR = this.innerR * 0.49;

    this.beads = [];
    this.normalOrder = null;
    this.cornerBeads = [];

    this.edgeSegments = [];
    this.edgeAngles   = [];

    this.flowSpeed = random(0.01, 0.02);
    this.flowPhase = random(TWO_PI);
    this.flowAmp   = outerR * 0.03;
  }

  vertices() {
    const pts = [];
    for (let i=0;i<6;i++) {
      const a=PI/6+(TWO_PI/6)*i;
      pts.push({x:this.x+this.outerR*cos(a),y:this.y+this.outerR*sin(a)});
    }
    return pts;
  }

  generateBeads(palette) {
    this.beads       = [];
    this.cornerBeads = [];

    const PAL5   = palette.slice(0,5);
    const CORE   = color(palette[5]);
    const ORANGE = color(255,130,30);

    const verts = this.vertices();
    const edges = [0,1,2];

    for (let ei of edges) {
      const p1=verts[ei];
      const p2=verts[(ei+1)%6];

      const dx=p2.x-p1.x;
      const dy=p2.y-p1.y;
      const ang=atan2(dy,dx);

      const edgeLen   = dist(p1.x,p1.y,p2.x,p2.y);
      const beadCount = floor(random(6,9));
      const segment   = edgeLen / beadCount;

      this.edgeSegments[ei] = segment;
      this.edgeAngles[ei]   = ang;

      const tMin = 0.02;
      const tMax = 0.98;

      const strokeCols = [];
      const chainMode  = random() < 0.45;
      const altCol     = color(random(PAL5));

      for (let i=0;i<beadCount;i++){
        let prob = 0.5 + sin(i);
        strokeCols.push(chainMode && random()<prob ? altCol : ORANGE);
      }

      const minFromEnd = 2;
      let lastSpecial  = -999;

      for (let i=0;i<beadCount;i++){
        const tRaw = (i+0.5)/beadCount;
        const t    = lerp(tMin,tMax,tRaw);

        const cx = lerp(p1.x,p2.x,t) + random(-0.6,0.6);
        const cy = lerp(p1.y,p2.y,t) + random(-0.6,0.6);

        const safeInterior =
          i>=minFromEnd &&
          i<=beadCount-1-minFromEnd &&
          (i-lastSpecial)>=2;

        const isSpecial = safeInterior && random()<0.12;
        if (isSpecial) lastSpecial=i;

        const nAmp = segment*BEAD_N_AMP_FACTOR;
        const tAmp = segment*BEAD_T_AMP_FACTOR;

        if (isSpecial){
          const span    = segment*1.05;
          const coreD   = span*random(0.75,1.05);
          const strokeW = coreD*random(1.2,1.4);
          const strokeH = coreD*random(1.1,1.35);

          const dotD   = coreD*random(0.32,0.46);
          const maxOff = (coreD-dotD)*0.35;

          this.beads.push({
            special:true, x:cx, y:cy, angle:ang,
            strokeW, strokeH, coreD,
            strokeCol:ORANGE, coreCol:CORE,
            dotW:dotD, dotH:dotD*random(0.8,1.15),
            dotOffX:random(-maxOff,maxOff),
            dotOffY:random(-maxOff,maxOff),
            edgeIndex:ei, beadIndex:i,
            u:tRaw, nAmp, tAmp
          });

        } else {
          const span    = segment*1.02;
          const strokeW = span*random(1.20,1.40);
          const strokeH = strokeW*random(0.30,0.42);

          let fillCol = color(random(PAL5));
          while(fillCol.toString() === strokeCols[i].toString()){
            fillCol = color(random(PAL5));
          }

          const fillW  = strokeW*random(0.45,0.55);
          const fillH  = strokeH*random(0.48,0.62);
          const maxOff = (strokeW-fillW)*0.30;

          this.beads.push({
            special:false, x:cx, y:cy, angle:ang,
            strokeW, strokeH, strokeCol:strokeCols[i],
            fillW, fillH, fillCol,
            colOff:random(-maxOff,maxOff),
            strokeOffX:random(-segment*0.05,segment*0.05),
            strokeOffY:random(-segment*0.05,segment*0.05),
            edgeIndex:ei, beadIndex:i,
            u:tRaw, nAmp, tAmp
          });
        }
      }
    }

    // independent, per–corner beads
    for (let ci=0; ci<3; ci++){
      const v   = verts[ci+1];
      const seg = this.edgeSegments[ci] || this.outerR*0.4;

      const span    = seg*1.12;
      const coreD   = span*random(0.78,1.05);
      const strokeW = coreD*random(1.22,1.42);
      const strokeH = coreD*random(1.12,1.38);

      const dotD   = coreD*random(0.32,0.50);
      const maxOff = (coreD-dotD)*0.35;

      const safeStrokeR = (max(strokeW,strokeH)-coreD)*0.32;

      this.cornerBeads.push({
        x:v.x, y:v.y,
        angle:this.edgeAngles[ci] ?? 0,

        baseStrokeW:strokeW,
        baseStrokeH:strokeH,
        coreD,
        strokeCol:ORANGE,
        coreCol:CORE,

        dotW:dotD,
        dotH:dotD*random(0.8,1.15),
        dotOffX:random(-maxOff,maxOff),
        dotOffY:random(-maxOff,maxOff),

        strokeBGOffX:random(-safeStrokeR,safeStrokeR),
        strokeBGOffY:random(-safeStrokeR,safeStrokeR),

        pulsePhase:random(TWO_PI),
        pulseSpeed:random(0.5,0.9)
      });
    }

    const normals=[];
    for (let i=0;i<this.beads.length;i++){
      if (!this.beads[i].special) normals.push(i);
    }
    shuffle(normals,true);
    this.normalOrder=normals;
  }
}

class HexGrid {
  constructor(outerRadius=150){
    this.cells=[];
    this.outerRadius=outerRadius;
  }

  generate(){
    const gOffX=random(-80,80);
    const gOffY=random(-80,80);
    const R=this.outerRadius;
    const h=sqrt(3)*R;

    const cols=ceil(width/(R*1.5))+4;
    const rows=ceil(height/h)+4;

    this.cells=[];

    for (let r=-2;r<rows;r++){
      for (let c=-2;c<cols;c++){
        let x=c*R*1.5;
        let y=r*h + (c%2===0 ? 0 : h/2);

        const rot=radians(30);
        const rx=x*cos(rot)-y*sin(rot);
        const ry=x*sin(rot)+y*cos(rot);

        x=rx+gOffX;
        y=ry+gOffY;

        if (x<-300 || x>width+300) continue;
        if (y<-300 || y>height+300) continue;

        this.cells.push(new HexCell(x,y,R));
      }
    }
  }

  display(){
    const t = frameCount * BEAD_SINE_SPEED;
    const cornerMap = new Map();

    for (let cell of this.cells){
      const flowX=sin(t*cell.flowSpeed+cell.flowPhase)*cell.flowAmp;
      const flowY=cos(t*cell.flowSpeed+cell.flowPhase)*cell.flowAmp;

      const animatedPoint = (b)=>{

        // Frame skipping
        const step = 0.2;
        const pixelR = floor(t / step) * step;

        const phase = pixelR*TWO_PI + b.u*TWO_PI*BEAD_SINE_FREQ;
        const taper = sin(b.u*PI);

        const offN = sin(phase)     * b.nAmp * taper;
        const offT = cos(phase*0.8) * b.tAmp * taper;

        const dx=cos(b.angle), dy=sin(b.angle);
        const nx=-dy, ny=dx;

        return {
          x: b.x + flowX + dx*offT + nx*offN,
          y: b.y + flowY + dy*offT + ny*offN
        };
      };

      // NORMAL BEADS
      if (cell.normalOrder){
        for (let idx of cell.normalOrder){
          const b=cell.beads[idx];
          if (b.special) continue;

          const P = animatedPoint(b);

          // stronger size wobble
          const scale = 1 + sin(t*1.4 + b.u*5.3) * 0.12;

          const strokeW = b.strokeW * scale;
          const strokeH = b.strokeH * scale;

          // inner fill is clearly smaller → safe gap
          const fillW = strokeW * 0.68;
          const fillH = strokeH * 0.68;

          const wig = sin(t*1.9 + b.u*4.1) * (strokeW*0.07);

          // Whether the mouse is touching or not
          const touch = dist(mouseX, mouseY, P.x, P.y) < strokeW * 0.7;

          push();
          translate(P.x,P.y);
          rotate(b.angle);
          noStroke();

          if (touch) {
            rectMode(CENTER);
            fill(b.strokeCol);
            rect(wig, 0, strokeW, strokeH);
            fill(b.fillCol);
            rect(0, 0, fillW, fillH);
          } else {
            fill(b.strokeCol);
            ellipse(wig, 0, strokeW, strokeH);
            fill(b.fillCol);
            ellipse(0, 0, fillW, fillH);
          }

          pop();
        }
      }

      // MID-EDGE SPECIAL BEADS
      for (let b of cell.beads){
        if (!b.special) continue;

        const P = animatedPoint(b);

        const scale = 1 + sin(t*1.1 + b.u*6.2) * 0.10;

        const strokeW = b.strokeW * scale;
        const strokeH = b.strokeH * scale;

        const coreD = b.coreD * scale * 0.88;

        // dot size based on original, scaled with core
        const baseDotScale = coreD / b.coreD;
        let dotW = b.dotW * baseDotScale;
        let dotH = b.dotH * baseDotScale;
        
        const avgDot = (dotW + dotH) * 0.5;
        dotW = lerp(dotW, avgDot, 0.5);
        dotH = lerp(dotH, avgDot, 0.5);

        // slow breathing + drift
        const dotPhase = t*0.35 + b.u*3.1;
        const dotScale = 1 + sin(dotPhase)*0.06;
        dotW *= dotScale;
        dotH *= dotScale;

        const dotX = b.dotOffX*0.5 + cos(dotPhase)*(coreD*0.04);
        const dotY = b.dotOffY*0.5 + sin(dotPhase)*(coreD*0.04);

        const wigX = sin(t*0.9 + b.u*7.3) * (strokeW*0.06);
        const wigY = cos(t*1.0 + b.u*5.4) * (strokeH*0.06);

        // Whether the mouse is touching or not
        const touch = dist(mouseX, mouseY, P.x, P.y) < strokeW * 0.7;

        push();
        translate(P.x,P.y);
        rotate(b.angle);
        noStroke();

        if (touch) {
          rectMode(CENTER);
          fill(b.strokeCol);
          rect(wigX, wigY, strokeW, strokeH);
          fill(b.coreCol);
          rect(0, 0, coreD, coreD);
          fill(255);
          rect(dotX, dotY, dotW, dotH);
        } else {
          fill(b.strokeCol);
          ellipse(wigX, wigY, strokeW, strokeH);
          fill(b.coreCol);
          ellipse(0, 0, coreD, coreD);
          fill(255);
          ellipse(dotX, dotY, dotW, dotH);
        }

        pop();
      }

      // collect corner beads into map so shared corners only draw once
      for (let cb of cell.cornerBeads){
        const key = Math.round(cb.x/3) + "_" + Math.round(cb.y/3);
        if (!cornerMap.has(key)){
          cornerMap.set(key,{cell,cb,flowX,flowY});
        }
      }
    }

    // CORNER BEADS
    for (let [,info] of cornerMap){
      const cb = info.cb;
      const px = cb.x + info.flowX;
      const py = cb.y + info.flowY;
    
      const scale = 1 + sin(t*cb.pulseSpeed*2 + cb.pulsePhase)*0.10;
    
      const strokeW = cb.baseStrokeW * scale;
      const strokeH = cb.baseStrokeH * scale;
    
      const coreD = cb.coreD * scale * 0.90;
    
      const baseDotScale = coreD / cb.coreD;
      let dotW = cb.dotW * baseDotScale;
      let dotH = cb.dotH * baseDotScale;
    
      const avgDot = (dotW + dotH)*0.5;
      dotW = lerp(dotW, avgDot, 0.5);
      dotH = lerp(dotH, avgDot, 0.5);

      const dotPhase = t*0.3*2 + cb.pulsePhase*1.3;
      const dotScale = 1 + sin(dotPhase)*0.05;
      dotW *= dotScale;
      dotH *= dotScale;
    
      const dotX = cb.dotOffX*0.5 + cos(dotPhase)*(coreD*0.04);
      const dotY = cb.dotOffY*0.5 + sin(dotPhase)*(coreD*0.04);
    
      const wobX = sin((t*0.7)*2 + cb.pulsePhase*1.7) * (strokeW*0.05);
      const wobY = cos((t*0.8)*2 + cb.pulsePhase*1.2) * (strokeH*0.05);

      // Whether the mouse is touching or not
      const touch = dist(mouseX, mouseY, px, py) < strokeW * 0.7;
    
      push();
      translate(px,py);
      rotate(cb.angle);
      noStroke();
    
      if (touch) {
        rectMode(CENTER);
        fill(cb.strokeCol);
        rect(cb.strokeBGOffX + wobX,
             cb.strokeBGOffY + wobY,
             strokeW, strokeH);
        fill(cb.coreCol);
        rect(0, 0, coreD, coreD);
        fill(255);
        rect(dotX, dotY, dotW, dotH);
      } else {
        fill(cb.strokeCol);
        ellipse(cb.strokeBGOffX + wobX,
                cb.strokeBGOffY + wobY,
                strokeW, strokeH);
        fill(cb.coreCol);
        ellipse(0,0,coreD,coreD);
        fill(255);
        ellipse(dotX, dotY, dotW, dotH);
      }
      
      pop();
    }
  }
}