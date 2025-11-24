
import Link from "next/link";
import { Shield, Lock, Cloud, Zap, Key, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                SecureNotes
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="inline-block">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
              <Lock className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Your Encrypted Vault for
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Notes, Passwords & Links
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Keep your sensitive information secure with end-to-end encryption. 
            Access your data anywhere, knowing that only you hold the keys.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Get Started Free
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 rounded-3xl my-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Built for <span className="text-blue-600">Security</span> and <span className="text-cyan-600">Privacy</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">End-to-End Encryption</h3>
            <p className="text-gray-600">
              Your data is encrypted on your device before it ever reaches our servers. We can't read your notes, and neither can anyone else.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cloud className="h-7 w-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Cloud Sync</h3>
            <p className="text-gray-600">
              Access your encrypted vault from any device. Your data syncs seamlessly while staying completely private.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Offline Support</h3>
            <p className="text-gray-600">
              Work offline and your changes sync automatically when you're back online. Your data is always available.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-7 w-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Zero-Knowledge Architecture</h3>
            <p className="text-gray-600">
              We never have access to your encryption keys or unencrypted data. Your privacy is guaranteed by design.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Key className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure Password Manager</h3>
            <p className="text-gray-600">
              Store and manage your passwords securely. Generate strong passwords and never forget your credentials again.
            </p>
          </div>

          <div className="group p-8 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all border border-gray-100">
            <div className="w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-7 w-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Organized Notes & Links</h3>
            <p className="text-gray-600">
              Keep your notes, passwords, and important links organized in one secure place. Search and find anything instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Securing Your Data Today
          </h2>
          <p className="text-xl mb-8 text-blue-50 max-w-2xl mx-auto">
            Join thousands who trust SecureNotes to keep their sensitive information safe and accessible.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 shadow-lg">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-md py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">SecureNotes</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 SecureNotes. Your data, your keys, your privacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
