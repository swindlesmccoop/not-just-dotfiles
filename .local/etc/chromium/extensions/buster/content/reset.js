(function () {
  const reset = function (challengeUrl) {
    for (const [id, client] of Object.entries(___grecaptcha_cfg.clients)) {
      for (const [_, items] of Object.entries(client)) {
        if (items instanceof Object) {
          for (const [_, v] of Object.entries(items)) {
            if (v instanceof Element && v.src === challengeUrl) {
              (grecaptcha.reset || grecaptcha.enterprise.reset)(id);
              return;
            }
          }
        }
      }
    }
  };

  const onMessage = function (ev) {
    ev.stopImmediatePropagation();
    window.clearTimeout(timeoutId);

    reset(ev.detail);
  };

  const timeoutId = window.setTimeout(function () {
    document.removeEventListener('___resetCaptcha', onMessage, {
      capture: true,
      once: true
    });
  }, 10000); // 10 seconds

  document.addEventListener('___resetCaptcha', onMessage, {
    capture: true,
    once: true
  });
})();
