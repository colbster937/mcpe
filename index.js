window.fetch = new Proxy(window.fetch, {
  apply(x, y, z) {
    let url = z[0];

    if (typeof url === 'string') {
      url = new URL(url.trim(), window.location);
      if (url.pathname.endsWith('/index.data')) {
        url.pathname = '/game/mcpe.data';
      } else if (url.pathname.endsWith('/index.wasm')) {
        url.pathname = '/game/mcpe.wasm';
      }
      z[0] = url.toString();
    }

    return Reflect.apply(x, y, z);
  }
});

let p = false;

console.log = new Proxy(console.log, {
  apply(x, y, z) {
    const str = z.join(' ').trim();
    const q = p;

    if (/^\d+\s+fps$/i.test(str)) {
      p = true;
      if (!q) {
        Module.canvas.exitPointerLock();
      }
    } else if (/^\d+\s+fps\s+\d+\s+chunk updates\.\s+\([^)]+\)$/i.test(str)) {
      p = false;
      if (q) {
        Module.canvas.requestPointerLock();
      }
    }

    return Reflect.apply(x, y, z);
  }
});

Element.prototype.requestPointerLock = new Proxy(Element.prototype.requestPointerLock, {
  apply(x, y, z) {
    if (p) {
      return undefined;
    } else {
      return Reflect.apply(x, y, z);
    }
  }
});

const s = 0.4;

document.addEventListener('mousemove', (ev) => {
  if (document.pointerLockElement) {
    Object.defineProperty(ev, 'movementX', { value: ev.movementX * s });
    Object.defineProperty(ev, 'movementY', { value: ev.movementY * s });
  }
}, true);