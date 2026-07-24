export const metadata = {
  title: "Contact | Hlumisa Properties",
  description: "Get in touch with Hlumisa Properties — South Africa's premier luxury real estate agency.",
};

export default function ContactPage() {
  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-200/80">Get in Touch</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            Contact <span className="text-amber-200">Us</span>
          </h1>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ─── Contact form ─── */}
          <div className="backdrop-card rounded-[1.5rem] p-6">
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-amber-200/80">Send a Message</p>
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500"
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
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 resize-none"
                  placeholder="Tell us about what you're looking for..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-amber-200 px-8 py-4 text-sm font-semibold text-stone-950 transition hover:bg-amber-100"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* ─── Contact details ─── */}
          <div className="space-y-6">
            <div className="backdrop-card rounded-[1.5rem] p-6">
              <p className="mb-5 text-xs uppercase tracking-[0.3em] text-amber-200/80">Our Details</p>
              <div className="space-y-5 text-sm">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-stone-500">Email</p>
                  <a href="mailto:info@hlumisaproperties.co.za" className="text-amber-200 transition hover:underline">
                    info@hlumisaproperties.co.za
                  </a>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-stone-500">Phone</p>
                  <p className="text-stone-300">+27 (0) 82 555 0001</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-stone-500">Address</p>
                  <p className="text-stone-300">
                    Umhlanga Ridge<br />
                    Durban, 4319<br />
                    South Africa
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-stone-500">Office Hours</p>
                  <p className="text-stone-300">Mon – Fri: 8:00 AM – 5:00 PM</p>
                  <p className="text-stone-300">Saturday: 9:00 AM – 1:00 PM</p>
                  <p className="text-stone-500">Sunday: Closed</p>
                </div>
              </div>
            </div>

            <div className="backdrop-card rounded-[1.5rem] p-6">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-amber-200/80">Follow Us</p>
              <div className="flex flex-wrap gap-3">
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
    </div>
  );
}