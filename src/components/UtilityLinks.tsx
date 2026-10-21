import { siteConfig } from '../../site.config.mjs';

export default function UtilityLinks({ inline = false }: { inline?: boolean }) {
  return (
    <nav className={`utility-links${inline ? ' utility-links-inline' : ''}`} aria-label="Site information">
      <span className="utility-version" aria-label={`Build ${siteConfig.buildVersion}`}>{siteConfig.buildVersion}</span>
      <span aria-hidden="true">•</span>
      <a href="/humans.txt">humans.txt</a>
      <span aria-hidden="true">•</span>
      <a href="/llms.txt">llms.txt</a>
    </nav>
  );
}
