/**
 * Home Page
 * Landing page with feature showcase
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Shield,
  Image,
  Video,
  Layers,
  ArrowRight,
  Check,
  Star,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered',
      description: 'Advanced face detection and swapping powered by machine learning algorithms.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Lightning Fast',
      description: 'Process images in seconds with our optimized processing pipeline.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure',
      description: 'Your images are processed securely and never stored permanently.',
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: 'High Quality',
      description: 'Preserve image quality with our advanced blending algorithms.',
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'Video Support',
      description: 'Swap faces in videos for dynamic content creation.',
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Batch Processing',
      description: 'Process multiple images at once for efficient workflows.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Upload Images',
      description: 'Select your source face and target image to begin the swap.',
    },
    {
      step: '02',
      title: 'Detect Faces',
      description: 'Our AI automatically detects and maps facial features.',
    },
    {
      step: '03',
      title: 'Customize',
      description: 'Adjust settings for perfect blending and expression preservation.',
    },
    {
      step: '04',
      title: 'Download',
      description: 'Get your swapped image in high quality, ready to use.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-bg text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Professional Face Swap
              <br />
              <span className="text-primary-200">Made Simple</span>
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
              Create stunning face swaps with our AI-powered studio. 
              Perfect for content creators, designers, and entertainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/studio"
                  className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg font-semibold"
                >
                  Open Studio
                  <ArrowRight className="w-5 h-5 ml-2 inline" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg font-semibold"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-gray-50">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create professional face swaps with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-hover bg-white text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl gradient-bg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create your first face swap in four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="text-6xl font-bold gradient-text mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start for free, upgrade when you need more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
                <p className="text-gray-600 mb-6">Perfect for trying out</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  5 swaps per day
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Standard quality
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Basic support
                </li>
              </ul>
              <Link
                to="/register"
                className="btn-outline w-full text-center block"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="card bg-white border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Popular
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">$19</div>
                <p className="text-gray-600 mb-6">For professionals</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Unlimited swaps
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Ultra HD quality
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Video support
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/register"
                className="btn-primary w-full text-center block"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card bg-white border-2 border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">Custom</div>
                <p className="text-gray-600 mb-6">For large teams</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Everything in Pro
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  API access
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-700">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Custom integrations
                </li>
              </ul>
              <button className="btn-ghost w-full border-2 border-gray-300">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Create Amazing Face Swaps?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of creators using Face Swap Studio today.
          </p>
          <Link
            to={isAuthenticated ? '/studio' : '/register'}
            className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 text-lg font-semibold inline-flex items-center"
          >
            {isAuthenticated ? 'Open Studio' : 'Start Creating'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl font-bold">FS</span>
                </div>
                <span className="text-xl font-bold text-white">Face Swap Studio</span>
              </div>
              <p className="text-sm">
                Professional face swapping made simple for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/studio" className="hover:text-white">Studio</Link></li>
                <li><Link to="/projects" className="hover:text-white">Projects</Link></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Face Swap Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
