import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions | Hlumisa Properties",
  description: "Read the terms and conditions for using Hlumisa Properties website and services.",
};

export default function TermsPage() {
  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Legal</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Terms <span className="text-amber-200">&</span> Conditions
          </h1>
          <p className="mt-4 text-stone-400">Last updated: 24 July 2026</p>
        </div>

        <div className="mx-auto max-w-3xl space-y-8">
          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Agreement</p>
            <h2 className="mb-4 text-xl font-semibold text-white">1. Agreement to Terms</h2>
            <p className="leading-relaxed text-stone-300">
              By accessing and using the Hlumisa Properties website, you accept and agree to be bound by
              these Terms and Conditions. If you do not agree to these terms, please do not use our website
              or services. These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Services</p>
            <h2 className="mb-4 text-xl font-semibold text-white">2. Description of Services</h2>
            <p className="leading-relaxed text-stone-300">
              Hlumisa Properties provides a platform for viewing, marketing, and facilitating the sale and
              rental of luxury properties in South Africa. Our services include property listings, agent
              connections, and related real estate services. We act as an intermediary between property
              buyers, sellers, landlords, and tenants.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">User Obligations</p>
            <h2 className="mb-4 text-xl font-semibold text-white">3. User Obligations</h2>
            <div className="space-y-5">
              {[
                {
                  title: "Accurate Information",
                  desc: "You agree to provide accurate, current, and complete information when using our services.",
                },
                {
                  title: "Lawful Use",
                  desc: "You agree to use our services only for lawful purposes and in accordance with these Terms.",
                },
                {
                  title: "No Misuse",
                  desc: "You agree not to misuse our services, including by attempting to gain unauthorised access to any part of the Service.",
                },
                {
                  title: "Communication",
                  desc: "You agree not to use our contact systems for spam, harassment, or unsolicited advertising.",
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
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Property Listings</p>
            <h2 className="mb-4 text-xl font-semibold text-white">4. Property Listings</h2>
            <p className="leading-relaxed text-stone-300">
              While we strive for accuracy, Hlumisa Properties does not guarantee the accuracy, completeness,
              or reliability of any property listings, descriptions, pricing, or images displayed on our
              website. Property information is provided by third parties and may contain errors or omissions.
              We recommend verifying all information independently before making any property-related decisions.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Intellectual Property</p>
            <h2 className="mb-4 text-xl font-semibold text-white">5. Intellectual Property</h2>
            <p className="leading-relaxed text-stone-300">
              All content on this website, including but not limited to text, graphics, logos, images, and
              software, is the property of Hlumisa Properties or its content suppliers and is protected by
              South African and international copyright laws. You may not reproduce, distribute, modify, or
              create derivative works without our prior written consent.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Limitation</p>
            <h2 className="mb-4 text-xl font-semibold text-white">6. Limitation of Liability</h2>
            <p className="leading-relaxed text-stone-300">
              Hlumisa Properties shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of your use of or inability to use the Service. Our total
              liability shall not exceed the amount you paid to us, if any, in the twelve months preceding
              the claim. We are not responsible for any transactions between users and third parties.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Changes</p>
            <h2 className="mb-4 text-xl font-semibold text-white">7. Changes to Terms</h2>
            <p className="leading-relaxed text-stone-300">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately
              upon posting on this page. Your continued use of the Service after any changes constitutes
              your acceptance of the new Terms. We encourage you to review these Terms periodically.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Governing Law</p>
            <h2 className="mb-4 text-xl font-semibold text-white">8. Governing Law</h2>
            <p className="leading-relaxed text-stone-300">
              These Terms shall be governed by and construed in accordance with the laws of the Republic
              of South Africa. Any disputes arising from these Terms or your use of our services shall
              be subject to the exclusive jurisdiction of the courts of South Africa.
            </p>
          </div>

          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-amber-200/80">Contact</p>
            <h2 className="mb-4 text-xl font-semibold text-white">9. Contact Information</h2>
            <p className="leading-relaxed text-stone-300">
              If you have any questions about these Terms and Conditions, please contact us at our
              official email address or visit our <Link href="/contact" className="text-amber-200 hover:underline">contact page</Link> for
              more information.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/privacy"
            className="mr-4 text-amber-200 hover:underline"
          >
            Privacy Policy
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