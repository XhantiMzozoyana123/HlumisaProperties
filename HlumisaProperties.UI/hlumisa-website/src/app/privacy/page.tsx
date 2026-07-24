import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Hlumisa Properties",
  description: "Learn how Hlumisa Properties collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Privacy <span className="text-amber-200">Policy</span>
          </h1>
          <p className="mt-4 text-stone-400">Last updated: 24 July 2026</p>
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Introduction</p>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Introduction</h2>
            <p className="leading-relaxed text-stone-300">
              Hlumisa Properties is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you visit our website or use
              our services. We comply with the Protection of Personal Information Act (POPIA) of South Africa
              and other applicable data protection laws.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Collection</p>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Information We Collect</h2>
            <div className="space-y-5">
              {[
                {
                  title: "Personal Information",
                  desc: "Name, email address, phone number, physical address, and identification details when you register, inquire about properties, or contact us.",
                },
                {
                  title: "Financial Information",
                  desc: "Payment details, bank information, and credit references when processing transactions or verifying affordability.",
                },
                {
                  title: "Technical Data",
                  desc: "IP address, browser type, device information, and usage data collected automatically through cookies and similar technologies.",
                },
                {
                  title: "Property Information",
                  desc: "Details about properties you own, are interested in buying or renting, or have transacted through our platform.",
                },
              ].map((item) => (
                <div key={item.title} className="border-l-2 border-amber-200/50 pl-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-stone-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Usage</p>
            <h2 className="mb-4 text-xl font-semibold text-white">3. How We Use Your Information</h2>
            <p className="leading-relaxed text-stone-300">
              We use the information we collect to provide, maintain, and improve our services; process
              transactions; send property alerts and marketing communications (with your consent); respond
              to inquiries; comply with legal obligations; and protect against fraud or unauthorised use.
              We will only use your information for purposes compatible with those for which it was collected.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Sharing</p>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Information Sharing</h2>
            <p className="leading-relaxed text-stone-300">
              We may share your information with property owners, estate agents, conveyancers, bond
              originators, and other service providers involved in property transactions. We may also
              share data with marketing partners, analytics providers, and legal authorities when required
              by law. All third parties are bound by confidentiality and data protection obligations.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Cookies</p>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Cookies & Tracking</h2>
            <p className="leading-relaxed text-stone-300">
              We use cookies, web beacons, and similar tracking technologies to enhance your experience,
              analyse site usage, and deliver personalised content. You can control cookie preferences
              through your browser settings. Disabling cookies may affect some website functionality.
              We use essential cookies, analytics cookies, and marketing cookies with your consent.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Security</p>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Data Security</h2>
            <p className="leading-relaxed text-stone-300">
              We implement appropriate technical and organisational measures to protect your personal
              information, including encryption, secure servers, access controls, and regular security
              assessments. However, no method of transmission over the internet is 100% secure, and we
              cannot guarantee absolute security of your data.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Retention</p>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Data Retention</h2>
            <p className="leading-relaxed text-stone-300">
              We retain your personal information for as long as necessary to fulfil the purposes for
              which it was collected, comply with legal obligations, resolve disputes, and enforce our
              agreements. Property transaction records are typically retained for the period required
              by South African law, after which data is securely deleted or anonymised.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Your Rights</p>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Your Rights</h2>
            <p className="leading-relaxed text-stone-300">
              Under POPIA, you have the right to access, correct, or delete your personal information;
              object to processing; restrict processing; data portability; and withdraw consent. To
              exercise these rights, please contact us using the details provided below. We will respond
              to all requests within the timeframe required by law.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Children</p>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Children's Privacy</h2>
            <p className="leading-relaxed text-stone-300">
              Our services are not directed to individuals under the age of 18. We do not knowingly
              collect personal information from children. If you become aware that a child has provided
              us with personal data, please contact us and we will take steps to delete such information.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Changes</p>
            <h2 className="mb-4 text-xl font-semibold text-white">10. Changes to This Policy</h2>
            <p className="leading-relaxed text-stone-300">
              We may update this Privacy Policy from time to time to reflect changes in our practices
              or legal requirements. The updated policy will be posted on this page with a revised
              "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Contact</p>
            <h2 className="mb-4 text-xl font-semibold text-white">11. Contact Us</h2>
            <p className="leading-relaxed text-stone-300">
              If you have any questions about this Privacy Policy or our data practices, please contact
              us via our <Link href="/contact" className="text-amber-200 hover:underline">contact page</Link> or
              email our data protection officer directly.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/terms"
            className="mr-4 text-amber-200 hover:underline"
          >
            Terms & Conditions
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-amber-200 px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}