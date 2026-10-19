import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/shared/layouts/Navbar";
import { Footer } from "@/shared/layouts/Footer";
import { Link } from "react-router";

const terms = [["Using this website", "You may use this website for lawful business purposes and to learn about LeadHive AI. You must not attempt to disrupt the site, access restricted systems, introduce malicious code, or misuse its content."], ["Product information", "Website content is provided for general information. Product capabilities, integrations, availability, and commercial terms may change. A separate written agreement will govern any paid LeadHive AI service."], ["Illustrative examples", "Interface data, qualification scenarios, and campaign metrics shown on this website are illustrative demonstrations unless explicitly identified as verified customer results. They are not guarantees of future performance."], ["Intellectual property", "LeadHive AI, its website, product interfaces, branding, and original content are owned by or licensed to M3Hive. No rights are granted except the limited right to use this website under these terms."], ["Availability and liability", "We aim to keep this website accurate and available, but provide it on an as-available basis. To the extent permitted by law, we are not liable for indirect losses arising solely from use of this informational website."], ["Contact and updates", "Questions can be sent to support@leadhive-ai.com. We may update these terms as the product and legal requirements evolve. This page is a working company template and should be reviewed by qualified legal counsel before production use."]];

export function LegalPage({ type }) {
  const privacy = type === "privacy";
  useEffect(() => {
    if (privacy) window.location.replace("/privacy/index.html");
    else window.location.replace("/terms/index.html");
  }, [privacy]);
  if (privacy || type === "terms") return null;
  return <div className="site-shell legal-shell"><Navbar /><main className="legal-page"><header className="legal-hero"><div className="container"><Link className="legal-back" to="/"><ArrowLeft /> Back to LeadHive AI</Link><p className="eyebrow light">Legal</p><h1>Terms of Use</h1><p>The terms that apply when using the LeadHive AI website.</p><small>Last updated: 26 August 2026</small></div></header><div className="container legal-content"><aside>LeadHive AI<br />Company information</aside><article>{terms.map(([heading, copy]) => <section key={heading}><h2>{heading}</h2><p>{copy}</p></section>)}</article></div></main><Footer /></div>;
}
