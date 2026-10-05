import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/shared/layouts/Navbar";
import { Footer } from "@/shared/layouts/Footer";
import { Link } from "react-router";

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    description:
      "How LeadHive AI handles information shared through this website and product enquiries.",
    sections: [
      [
        "Information we collect",
        "We may collect contact and business information you choose to provide, including your name, work email, company, preferred communication channels, and approximate conversation volume. Technical information such as browser type and basic usage data may also be collected by our hosting and analytics providers.",
      ],
      [
        "How we use information",
        "We use submitted information to respond to enquiries, arrange product demonstrations, improve the website, maintain security, and communicate about LeadHive AI where appropriate. We do not sell personal information.",
      ],
      [
        "Service providers",
        "We may use trusted service providers for website hosting, email, analytics, and product delivery. They may process limited information only for the services they provide to us and under appropriate safeguards.",
      ],
      [
        "Data retention and security",
        "We retain information only for as long as reasonably needed for the purpose it was collected, legal requirements, and legitimate business operations. We use proportionate administrative and technical measures to protect it.",
      ],
      [
        "Your choices",
        "You may ask to access, correct, or delete information you have provided, subject to applicable law. You can also opt out of non-essential communications at any time.",
      ],
      [
        "Contact",
        "Questions about privacy can be sent to support@leadhive-ai.com. This policy is a working company template and should be reviewed by qualified legal counsel before production use.",
      ],
    ],
  },
  terms: {
    title: "Terms of Use",
    description: "The terms that apply when using the LeadHive AI website.",
    sections: [
      [
        "Using this website",
        "You may use this website for lawful business purposes and to learn about LeadHive AI. You must not attempt to disrupt the site, access restricted systems, introduce malicious code, or misuse its content.",
      ],
      [
        "Product information",
        "Website content is provided for general information. Product capabilities, integrations, availability, and commercial terms may change. A separate written agreement will govern any paid LeadHive AI service.",
      ],
      [
        "Illustrative examples",
        "Interface data, qualification scenarios, and campaign metrics shown on this website are illustrative demonstrations unless explicitly identified as verified customer results. They are not guarantees of future performance.",
      ],
      [
        "Intellectual property",
        "LeadHive AI, its website, product interfaces, branding, and original content are owned by or licensed to M3Hive. No rights are granted except the limited right to use this website under these terms.",
      ],
      [
        "Availability and liability",
        "We aim to keep this website accurate and available, but provide it on an as-available basis. To the extent permitted by law, we are not liable for indirect losses arising solely from use of this informational website.",
      ],
      [
        "Contact and updates",
        "Questions can be sent to support@leadhive-ai.com. We may update these terms as the product and legal requirements evolve. This page is a working company template and should be reviewed by qualified legal counsel before production use.",
      ],
    ],
  },
};

export function LegalPage({ type }) {
  const page = legalContent[type];

  useEffect(() => {
    document.title = `${page.title} | LeadHive AI`;
    const canonical = document.querySelector('link[rel="canonical"]');
    const description = document.querySelector('meta[name="description"]');
    if (canonical) canonical.href = `https://leadhive-ai.vercel.app/${type}`;
    if (description) description.content = page.description;
    window.scrollTo(0, 0);
  }, [page.description, page.title, type]);

  return (
    <div className="site-shell legal-shell">
      <Navbar />
      <main className="legal-page">
        <header className="legal-hero">
          <div className="container">
            <Link className="legal-back" to="/">
              <ArrowLeft /> Back to LeadHive AI
            </Link>
            <p className="eyebrow light">Legal</p>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            <small>Last updated: 26 August 2026</small>
          </div>
        </header>
        <div className="container legal-content">
          <aside>
            LeadHive AI
            <br />
            Company information
          </aside>
          <article>
            {page.sections.map(([heading, copy]) => (
              <section key={heading}>
                <h2>{heading}</h2>
                <p>{copy}</p>
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}