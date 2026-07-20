export const metadata = {
  title: "Contact | Hlumisa Properties",
  description: "Get in touch with Hlumisa Properties — South Africa's premier luxury real estate agency.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] gold-text">Get in Touch</p>
        <h1 className="text-5xl font-bold text-white">Contact Us</h1>
        <p className="mx-auto mt-4 max-w-xl text-stone-400">
          Ready to find your dream property? We'd love to hear from you.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2">
        {/* ─── Contact form ─── */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
          <h2 className="mb-6 text-2xl font-bold text-white font-serif">Send a Message</h2>
          <form
            action="mailto:info@hlumisaproperties.co.za"
            method="POST"
            encType="text/plain"
            className="space-y-5"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-600/50"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-600/50"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                Phone (optional)
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-600/50"
                placeholder="+27 82 555 0000"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stone-400">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={5}
                className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-amber-600/50"
                placeholder="Tell us about what you're looking for..."
              />
            </div>
            <button
              type="submit"
              className="gold-gradient w-full rounded-full px-8 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* ─── Contact details ─── */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
            <h2 className="mb-6 text-2xl font-bold text-white font-serif">Our Details</h2>
            <div className="space-y-5 text-sm text-stone-300">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">Email</p>
                <a href="mailto:info@hlumisaproperties.co.za" className="gold-text transition hover:underline">
                  info@hlumisaproperties.co.za
                </a>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">Phone</p>
                <p>+27 (0) 82 555 0001</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">Address</p>
                <p>
                  Umhlanga Ridge<br />
                  Durban, 4319<br />
                  South Africa
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-500">Office Hours</p>
                <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8">
            <h2 className="mb-4 text-2xl font-bold text-white font-serif">Follow Us</h2>
            <div className="flex gap-4">
              {["Facebook", "Instagram", "LinkedIn"].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-stone-400 transition hover:border-white/20 hover:text-white"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}