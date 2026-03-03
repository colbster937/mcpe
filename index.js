window.fetch = new Proxy(window.fetch, {
  apply(x, y, z) {
    let url = z[0];

    if (typeof url === 'string') {
      let base = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
      url = new URL(url.trim(), base);

      if (/\/(game\/)?index\.data$/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/\/(game\/)?index\.data$/, '/game/mcpe.data');
      } else if (/\/(game\/)?index\.wasm$/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/\/(game\/)?index\.wasm$/, '/game/mcpe.wasm');
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

const title = Object.getOwnPropertyDescriptor(Document.prototype, 'title');

Object.defineProperty(Document.prototype, 'title', {
  get: function () {
    return title.get.call(this);
  },
  set: function () {
    return true;
  },
  configurable: false
});

const s = 0.4;

document.addEventListener('mousemove', (ev) => {
  if (document.pointerLockElement) {
    Object.defineProperty(ev, 'movementX', { value: ev.movementX * s });
    Object.defineProperty(ev, 'movementY', { value: ev.movementY * s });
  }
}, true);