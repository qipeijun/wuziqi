// Simple Canvas Confetti implementation
// Based on a simplified physics model

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export class ConfettiSystem {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private width: number = 0;
  private height: number = 0;

  private colors = ['#2383E2', '#D44C47', '#FFD700', '#32CD32', '#FF69B4'];

  constructor() {
    this.init();
  }

  private init() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  private createParticle(x: number, y: number): Particle {
    const angle = Math.random() * Math.PI * 2;
    const velocity = 10 + Math.random() * 20;
    
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 10, // Initial upward burst
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: 1,
      decay: 0.01 + Math.random() * 0.02,
      size: 5 + Math.random() * 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    };
  }

  public burst(x?: number, y?: number) {
    const originX = x ?? this.width / 2;
    const originY = y ?? this.height / 2;

    // Create 100 particles
    for (let i = 0; i < 100; i++) {
      this.particles.push(this.createParticle(originX, originY));
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Physics
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.5; // Gravity
      p.vx *= 0.95; // Air resistance
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.height) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  };
}

export const confetti = new ConfettiSystem();
