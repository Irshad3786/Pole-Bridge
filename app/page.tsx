import Logo from "@/components/Logo";
import Nav from "@/components/Nav";
import Link from "next/link";


export default function Home() {
  return (
    <div className="w-full">
      <Nav />
      

      <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 md:px-6 py-12 md:py-0">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Welcome to Poll-Bridge <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-900">With AI</span></h1>
          <p className="text-base md:text-xl text-gray-600 mb-8">Create, share, and analyze polls with ease using artificial intelligence</p>
          <button>
          <Link href={"/login"} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-900 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14">
              <path fill="#fff" fillRule="evenodd" d="m6.547 10.263l-2.81-2.81c.309-.517.617-1.052.922-1.584c1.016-1.766 2.008-3.49 2.938-4.387c2.524-2.524 5.981-1.06 5.981-1.06s1.464 3.457-1.06 5.981c-.89.922-2.587 1.9-4.34 2.908c-.546.315-1.097.632-1.631.952m2.14-6.532a1.582 1.582 0 1 1 3.164 0a1.582 1.582 0 0 1-3.163 0m-4.09-.232C3.18 3.122 1.849 3.82.668 4.903a.48.48 0 0 0 .089.765l1.905 1.148l.002-.004c.275-.46.582-.993.894-1.533c.355-.617.716-1.243 1.04-1.78m2.587 7.84l1.148 1.905a.48.48 0 0 0 .765.088c1.083-1.18 1.782-2.512 1.404-3.93c-.522.314-1.07.63-1.613.943l-.083.048c-.548.316-1.091.628-1.616.943zM2.622 9.343a2 2 0 0 1 1.402 3.46c-.222.212-.569.379-.89.506a11 11 0 0 1-1.1.358c-.367.1-.717.18-.982.233a6 6 0 0 1-.336.059q-.066.009-.133.013a.5.5 0 0 1-.198-.022a.5.5 0 0 1-.241-.156a.5.5 0 0 1-.11-.22a.6.6 0 0 1-.012-.176c.003-.04.009-.086.015-.128c.013-.088.033-.203.06-.334c.053-.264.135-.612.235-.977c.1-.364.222-.754.359-1.095c.128-.321.294-.667.506-.888a2 2 0 0 1 1.425-.633" clipRule="evenodd"/>
            </svg>
            Let's Start
          </Link>
          </button>
        </div>
      </section>


      <section id="about" className="min-h-screen flex items-center justify-center bg-white px-4 md:px-6 py-12 md:py-0">
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">About Poll-Bridge</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
              <p className="text-gray-600">Create polls in seconds with our intuitive interface. No technical knowledge required.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Analytics</h3>
              <p className="text-gray-600">Get instant insights with live dashboards and comprehensive data analysis tools.</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Anywhere</h3>
              <p className="text-gray-600">Easily share polls with your audience via link, email, or social media.</p>
            </div>
          </div>
        </div>
      </section>


      <section id="contact" className="min-h-screen flex items-center justify-center bg-gray-50 px-4 md:px-6 py-12 md:py-0">
        <div className="max-w-2xl w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Get In Touch</h2>
          <form className="bg-white p-4 md:p-8 rounded-lg shadow-lg">
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Name</label>
              <input type="text" placeholder="Your name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input type="email" placeholder="Your email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Message</label>
              <textarea placeholder="Your message" rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-purple-900 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 md:py-8 px-4 md:px-6 text-center">
        <p className="text-sm md:text-base">&copy; 2026 Poll-Bridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
