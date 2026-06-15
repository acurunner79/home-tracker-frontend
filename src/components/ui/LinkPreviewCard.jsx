// client/src/components/ui/LinkPreviewCard.jsx
import React, { useState, useEffect } from 'react';

function getHost(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

export default function LinkPreviewCard({ url, label }) {
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const host = getHost(url);

  useEffect(() => {
    let cancelled = false;
    async function fetchMeta() {
      try {
        const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
        const json = await res.json();
        const doc = new DOMParser().parseFromString(json.contents || '', 'text/html');

        const title =
          doc.querySelector('meta[property="og:title"]')?.content ||
          doc.querySelector('meta[name="twitter:title"]')?.content ||
          doc.querySelector('title')?.textContent ||
          host;

        const desc =
          doc.querySelector('meta[property="og:description"]')?.content ||
          doc.querySelector('meta[name="description"]')?.content ||
          '';

        let img =
          doc.querySelector('meta[property="og:image"]')?.content ||
          doc.querySelector('meta[name="twitter:image"]')?.content ||
          '';

        if (img && !img.startsWith('http')) {
          try { img = new URL(img, url).href; } catch { img = ''; }
        }

        if (!cancelled) setMeta({ title: title.slice(0, 100), desc: desc.slice(0, 160), img });
      } catch {
        if (!cancelled) setMeta({ title: host, desc: '', img: '' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMeta();
    return () => { cancelled = true; };
  }, [url]);

  const favicon = `https://www.google.com/s2/favicons?domain=${host}&sz=32`;

  const handleClick = () => window.open(url, '_blank', 'noopener,noreferrer');

  if (loading) {
    return (
      <div className="link-card">
        <div className="link-card-img-placeholder skeleton-box" />
        <div className="link-card-body" style={{ gap: 6 }}>
          {label && <div className="skeleton-box" style={{ height: 10, width: '35%' }} />}
          <div className="skeleton-box" style={{ height: 13, width: '70%' }} />
          <div className="skeleton-box" style={{ height: 11, width: '90%' }} />
          <div className="skeleton-box" style={{ height: 11, width: '50%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="link-card" onClick={handleClick} role="link" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}>
      {meta.img ? (
        <img
          className="link-card-img" src={meta.img} alt=""
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div
        className="link-card-img-placeholder"
        style={{ display: meta.img ? 'none' : 'flex' }}
      >
        🔗
      </div>
      <div className="link-card-body">
        {label && <div className="link-card-user-label">{label}</div>}
        <div className="link-card-title">{meta.title || host}</div>
        {meta.desc && <div className="link-card-desc">{meta.desc}</div>}
        <div className="link-card-host">
          <img className="link-card-favicon" src={favicon} alt="" onError={e => e.target.style.display = 'none'} />
          {host}
        </div>
      </div>
    </div>
  );
}
