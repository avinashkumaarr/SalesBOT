import { useEffect, useRef } from 'react';

export default function CosmicVortex() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Particle class
    class Particle {
      constructor(isStar = false) {
        this.isStar = isStar;
        this.reset();
      }

      reset() {
        if (this.isStar) {
          // Background stars
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.size = Math.random() * 1.2;
          this.opacity = Math.random() * 0.8 + 0.2;
          this.speed = Math.random() * 0.02 + 0.005;
          this.offset = Math.random() * Math.PI * 2;
        } else {
          // Accretion disk particles
          this.angle = Math.random() * Math.PI * 2;
          // Accretion disk radial range
          this.r = Math.random() * (Math.min(width, height) * 0.5 - 60) + 60;
          this.originalR = this.r;
          
          // Keplerian-like speed: closer particles spin faster
          this.speed = (Math.random() * 0.8 + 0.4) / Math.sqrt(this.r);
          
          // Particle dimensions
          this.size = Math.random() * 1.5 + 0.5;
          this.alpha = Math.random() * 0.5 + 0.3;
          
          // Color variance: blue, cyan, deep indigo, purple highlights
          const rand = Math.random();
          if (rand < 0.4) {
            this.color = `rgba(96, 165, 250, ${this.alpha})`; // Cyan / Blue #60A5FA
          } else if (rand < 0.75) {
            this.color = `rgba(59, 130, 246, ${this.alpha})`; // Royal Blue #3B82F6
          } else {
            this.color = `rgba(139, 92, 246, ${this.alpha})`; // Purple #8B5CF6
          }
          
          // Spiral inward velocity
          this.radialDrift = -0.05 * (Math.random() * 0.4 + 0.1);
        }
      }

      update(time) {
        if (this.isStar) {
          // Twinkle effect
          this.opacity = Math.sin(time * this.speed + this.offset) * 0.4 + 0.6;
        } else {
          // Vortex physics
          this.angle += this.speed * 0.4;
          this.r += this.radialDrift;
          
          // Pull toward center, reset if too close to the singularity
          if (this.r < 45) {
            this.reset();
            this.r = Math.min(width, height) * 0.5 * (Math.random() * 0.2 + 0.8);
          }
        }
      }

      draw() {
        if (this.isStar) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Calculate coordinates relative to center
          const centerX = width / 2;
          const centerY = height / 2.5; // Offset slightly upward like the image
          
          // Elliptical rotation for perspective depth (simulating a tilted black hole disk)
          const x = centerX + Math.cos(this.angle) * this.r;
          const y = centerY + Math.sin(this.angle) * this.r * 0.55;

          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(x, y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Initialize stars and accretion particles
    const stars = Array.from({ length: 150 }, () => new Particle(true));
    const vortexParticles = Array.from({ length: 800 }, () => new Particle(false));

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      
      // Reset stars positions for new dimensions
      stars.forEach(star => star.reset());
      vortexParticles.forEach(p => p.reset());
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let time = 0;
    const render = () => {
      time++;
      // Clear with slight trailing fade to create particle trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Twinkling Stars
      stars.forEach((star) => {
        star.update(time);
        star.draw();
      });

      // 2. Draw Accretion Disk Glowing Gas (radial gradient backdrops)
      const centerX = width / 2;
      const centerY = height / 2.5;

      // Outer soft blue glow
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, 40,
        centerX, centerY, Math.min(width, height) * 0.4
      );
      outerGlow.addColorStop(0, 'rgba(59, 130, 246, 0.12)');
      outerGlow.addColorStop(0.5, 'rgba(96, 165, 250, 0.04)');
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, width * 0.5, height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Update & Draw Vortex Particles
      vortexParticles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      // 4. Draw Event Horizon Singularity (black hole core)
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#60A5FA';
      
      // Singularity core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 52, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing blue rim
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      // Event horizon overlay to cover edges cleanly
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 48, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-[650px] pointer-events-none z-0"
    />
  );
}
