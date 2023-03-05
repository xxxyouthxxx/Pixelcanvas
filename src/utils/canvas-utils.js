export function zoomIn() {
    if (z >= 0.4) return;
    clearInterval(anim);
    let dz = 0.005;
    anim = setInterval(function() {
      if (dz < 0.2) dz *= 1.1;
      z *= 1 + dz;
      pos();
      if (z >= 0.4) clearInterval(anim);
    }, 15);
  }
  