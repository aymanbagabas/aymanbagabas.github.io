(() => {
  const COPY_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const CHECK_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

  function extractCode(highlight) {
    const codeCell = highlight.querySelector('.lntable td:last-child');
    const source = codeCell || highlight.querySelector('pre code') || highlight.querySelector('pre');
    if (!source) return '';
    const clone = source.cloneNode(true);
    clone.querySelectorAll('.ln, .lnt').forEach((n) => n.remove());
    return clone.innerText.replace(/\n$/, '');
  }

  async function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  document.querySelectorAll('.highlight').forEach((highlight) => {
    if (highlight.parentElement && highlight.parentElement.classList.contains('code-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';
    highlight.parentNode.insertBefore(wrap, highlight);
    wrap.appendChild(highlight);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML = COPY_ICON;
    wrap.appendChild(btn);

    let resetTimer;
    btn.addEventListener('click', async () => {
      try {
        await copy(extractCode(highlight));
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('copied');
        btn.setAttribute('aria-label', 'Copied');
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          btn.innerHTML = COPY_ICON;
          btn.classList.remove('copied');
          btn.setAttribute('aria-label', 'Copy code');
        }, 1500);
      } catch (e) {
        btn.setAttribute('aria-label', 'Copy failed');
      }
    });
  });
})();
