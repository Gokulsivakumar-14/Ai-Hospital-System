const API_BASE = "https://ai-hospital-system-drr0.onrender.com";

// PASSWORD SHOW/HIDE
function togglePassword() {
  let pwd = document.getElementById("pwd");
  pwd.type = pwd.type === "password" ? "text" : "password";
}

// LOGIN FUNCTION
async function login() {
  let role = document.getElementById("role").value;
  let id = document.getElementById("uid").value;
  let pwd = document.getElementById("pwd").value;
  let remember = document.getElementById("remember").checked;
  let msg = document.getElementById("msg");

  if (!role || !id || !pwd) {
    msg.innerText = "⚠️ Fill all fields";
    return;
  }

  try {
    const res = await fetch(API_BASE + "/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password: pwd, role })
    });
    const data = await res.json();
    if (data.success) {
      if (remember) localStorage.setItem("loggedIn", role);
      if (role === "staff") {
        window.location.href = "staff.html";
      } else {
        window.location.href = "admin.html";
      }
    } else {
      msg.innerText = "❌ " + data.message;
    }
  } catch (err) {
    console.error("Login failed:", err);
    msg.innerText = "❌ Server connection error";
  }
}

// Background Floating Cells/Dust and DNA Helix Animation
(function() {
  const container = document.getElementById("particles-js");
  if (!container) return;

  class DNAHelix {
    constructor(options) {
      this.centerX = options.centerX;
      this.centerY = options.centerY;
      this.length = options.length || 600;
      this.radius = options.radius || 50;
      this.turns = options.turns || 2;
      this.tilt = options.tilt || 0; // angle in radians
      this.phase = options.phase || 0;
      this.speed = options.speed || 0.02;
      this.nodeCount = options.nodeCount || 30;
      this.color1 = options.color1 || "#0e7490";
      this.color2 = options.color2 || "#6d28d9";
      this.lineColor = options.lineColor || "#475569";
      this.opacity = options.opacity || 1.0;
    }

    update() {
      this.phase += this.speed;
    }

    draw(ctx, mouseX, mouseY) {
      const points1 = [];
      const points2 = [];
      const halfLength = this.length / 2;
      const fov = 400; // perspective depth

      // Calculate all 3D points projected to 2D
      for (let i = 0; i < this.nodeCount; i++) {
        const t = i / (this.nodeCount - 1);
        const xLocal = t * this.length - halfLength;
        
        const angleOffset = t * this.turns * 2 * Math.PI;
        const currentAngle = angleOffset + this.phase;

        // Strand 1 (3D local coords)
        const y1Local = Math.sin(currentAngle) * this.radius;
        const z1Local = Math.cos(currentAngle) * this.radius;

        // Strand 2 is 180 degrees out of phase
        const y2Local = Math.sin(currentAngle + Math.PI) * this.radius;
        const z2Local = Math.cos(currentAngle + Math.PI) * this.radius;

        // Rotate local points by tilt angle and translate to center
        const cosT = Math.cos(this.tilt);
        const sinT = Math.sin(this.tilt);

        const px1 = this.centerX + xLocal * cosT - y1Local * sinT;
        const py1 = this.centerY + xLocal * sinT + y1Local * cosT;
        
        const px2 = this.centerX + xLocal * cosT - y2Local * sinT;
        const py2 = this.centerY + xLocal * sinT + y2Local * cosT;

        points1.push({ x: px1, y: py1, z: z1Local, index: i, type: 1 });
        points2.push({ x: px2, y: py2, z: z2Local, index: i, type: 2 });
      }

      const renderables = [];

      // Add nodes to renderables
      for (let i = 0; i < this.nodeCount; i++) {
        renderables.push({
          type: 'node',
          z: points1[i].z,
          point: points1[i],
          color: this.color1
        });
        renderables.push({
          type: 'node',
          z: points2[i].z,
          point: points2[i],
          color: this.color2
        });
      }

      // Add backbone segments to renderables
      for (let i = 0; i < this.nodeCount - 1; i++) {
        renderables.push({
          type: 'backbone',
          z: (points1[i].z + points1[i+1].z) / 2,
          pStart: points1[i],
          pEnd: points1[i+1],
          color: this.color1
        });
        renderables.push({
          type: 'backbone',
          z: (points2[i].z + points2[i+1].z) / 2,
          pStart: points2[i],
          pEnd: points2[i+1],
          color: this.color2
        });
      }

      // Add rungs (connecting lines) to renderables
      for (let i = 0; i < this.nodeCount; i++) {
        renderables.push({
          type: 'rung',
          z: (points1[i].z + points2[i].z) / 2,
          p1: points1[i],
          p2: points2[i],
          color: this.lineColor
        });
      }

      // Sort by Z (painter's algorithm) - lower Z is farther away, higher Z is closer
      renderables.sort((a, b) => a.z - b.z);

      // Draw all items
      renderables.forEach(item => {
        // Perspective scale factor
        const scale = fov / (fov - item.z);
        const alpha = ((item.z + this.radius) / (this.radius * 2) * 0.6 + 0.4) * this.opacity;

        if (item.type === 'node') {
          const radius = scale * 5.5;
          
          // Mouse hover interaction
          const dist = Math.hypot(item.point.x - mouseX, item.point.y - mouseY);
          const isHovered = dist < 30;
          const drawRadius = isHovered ? radius * 1.5 : radius;

          ctx.beginPath();
          ctx.arc(item.point.x, item.point.y, drawRadius, 0, Math.PI * 2);
          
          if (isHovered) {
            ctx.fillStyle = "#ffffff";
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.color;
          } else {
            ctx.fillStyle = item.color;
            ctx.shadowBlur = 0;
          }
          
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0; // reset
        } 
        else if (item.type === 'backbone') {
          ctx.beginPath();
          ctx.moveTo(item.pStart.x, item.pStart.y);
          ctx.lineTo(item.pEnd.x, item.pEnd.y);
          ctx.strokeStyle = item.color;
          ctx.lineWidth = scale * 2.5;
          ctx.globalAlpha = alpha * 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        } 
        else if (item.type === 'rung') {
          ctx.beginPath();
          ctx.moveTo(item.p1.x, item.p1.y);
          ctx.lineTo(item.p2.x, item.p2.y);
          
          // Linear gradient to blend DNA strands colors
          const grad = ctx.createLinearGradient(item.p1.x, item.p1.y, item.p2.x, item.p2.y);
          grad.addColorStop(0, item.p1.type === 1 ? this.color1 : this.color2);
          grad.addColorStop(1, item.p2.type === 1 ? this.color1 : this.color2);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = scale * 1.2;
          ctx.globalAlpha = alpha * 0.5;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      });
    }
  }

  // Background Floating Cells/Dust
  class FloatingCell {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, init = false) {
      this.x = Math.random() * w;
      this.y = init ? Math.random() * h : h + 10;
      this.radius = Math.random() * 6 + 2;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.opacity = Math.random() * 0.15 + 0.1;
      this.color = Math.random() > 0.5 ? "#0e7490" : "#0284c7";
    }

    update(w, h) {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -10 || this.x < -10 || this.x > w + 10) {
        this.reset(w, h, false);
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Apply basic canvas sizing styles
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  container.appendChild(canvas);

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  let mouseX = -999;
  let mouseY = -999;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouseX = -999;
    mouseY = -999;
  });

  let helices = [];
  let cells = [];

  function initElements() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    helices = [
      // 1. Large background diagonal helix
      new DNAHelix({
        centerX: width / 2,
        centerY: height / 2,
        length: Math.max(width, height) * 1.3,
        radius: 70,
        turns: 3.5,
        tilt: -Math.PI / 5, // -36 deg
        phase: 0,
        speed: 0.004, // slow rotation
        nodeCount: 50,
        color1: "#0e7490", // deep teal
        color2: "#0284c7", // slate blue
        lineColor: "#64748b",
        opacity: 0.25 // subtle
      }),

      // 2. Left side vertical floating helix
      new DNAHelix({
        centerX: width * 0.15,
        centerY: height * 0.5,
        length: height * 0.9,
        radius: 40,
        turns: 2.2,
        tilt: Math.PI / 14,
        phase: Math.PI / 3,
        speed: 0.008,
        nodeCount: 28,
        color1: "#0ea5e9", // bright sky blue
        color2: "#0f766e", // deep forest teal
        lineColor: "#475569",
        opacity: 0.45
      }),

      // 3. Right side vertical floating helix
      new DNAHelix({
        centerX: width * 0.85,
        centerY: height * 0.5,
        length: height * 0.9,
        radius: 45,
        turns: 2.5,
        tilt: -Math.PI / 12,
        phase: Math.PI / 1.5,
        speed: 0.006,
        nodeCount: 32,
        color1: "#0284c7", // light cobalt
        color2: "#0d9488", // turquoise
        lineColor: "#475569",
        opacity: 0.4
      })
    ];

    cells = [];
    const cellCount = Math.floor((width * height) / 30000); // density-based
    for (let i = 0; i < Math.min(cellCount, 40); i++) {
      cells.push(new FloatingCell(width, height));
    }
  }

  window.addEventListener("resize", initElements);
  initElements();

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update & Draw cells
    cells.forEach(cell => {
      cell.update(width, height);
      cell.draw(ctx);
    });

    // Update & Draw helices
    helices.forEach(helix => {
      helix.update();
      // Re-center relative to dynamic resizing in update loop if viewport size changed
      if (helix.opacity === 0.25) {
        helix.centerX = width / 2;
        helix.centerY = height / 2;
        helix.length = Math.max(width, height) * 1.3;
      } else if (helix.opacity === 0.45) {
        helix.centerX = width * 0.15;
        helix.centerY = height * 0.5;
        helix.length = height * 0.9;
      } else if (helix.opacity === 0.4) {
        helix.centerX = width * 0.85;
        helix.centerY = height * 0.5;
        helix.length = height * 0.9;
      }
      helix.draw(ctx, mouseX, mouseY);
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

