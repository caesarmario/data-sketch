import { useCallback, useState } from 'react';
import { useAsciiImage } from '../hooks/useAsciiImage';
import { asciiPlaceholderHTML } from '../asciiPlaceholder';

export default function AsciiImage({ src, alt, priority = false }: {
  src: string; alt: string; priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const unavailable = useCallback(() => setFailedSrc(src), [src]);
  const { containerRef, imageRef, placeholderRef } = useAsciiImage(src, unavailable);
  return (
    <div key={src} ref={containerRef} className="ascii-image ascii-diagram" data-ascii-image="" data-image-state="pending">
      {failedSrc === src ? <div className="ascii-image-fallback" role="img" aria-label={alt}>
        <span aria-hidden="true">Diagram preview unavailable</span>
      </div> : <img ref={imageRef} src={src} alt={alt} width={1080} height={1350}
        loading={priority ? 'eager' : 'lazy'} {...{ fetchpriority: priority ? 'high' : 'auto' }} decoding="async" />}
      <div ref={placeholderRef} className="ascii-image-placeholder" hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: asciiPlaceholderHTML }} />
    </div>
  );
}
