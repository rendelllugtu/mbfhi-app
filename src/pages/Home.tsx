// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Heart, Users, Award, ArrowRight, CheckCircle, Star, TrendingUp, Shield, Clock, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [visible, end, duration]);

  return { count, ref };
}

export default function Home() {
  const hero = useFadeInOnScroll();
  const stats = useFadeInOnScroll();
  const features = useFadeInOnScroll();
  const testimonials = useFadeInOnScroll();
  const cta = useFadeInOnScroll();

  const facilitiesCount = useCountUp(150);
  const certifiedCount = useCountUp(89);
  const regionsCount = useCountUp(5);

  return (
    <div className="min-h-screen">
      
      {/* HERO SECTION */}
      <section
        ref={hero.ref}
        className={`relative overflow-hidden transition-all duration-1000 ${
          hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
          </div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-white">
              {/* Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                  <Shield className="w-4 h-4" />
                  Official DOH Program
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/30 backdrop-blur-sm rounded-full text-sm font-medium border border-teal-400/30">
                  <TrendingUp className="w-4 h-4" />
                  CALABARZON Region
                </span>
              </div>

              {/* Logos */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src="/doh-logo.png" 
                    alt="DOH Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white rounded-xl flex items-center justify-center p-2 shadow-lg">
                  <img 
                    src="/calabarzon-logo.png" 
                    alt="CALABARZON Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Mother-Baby Friendly
                <span className="block text-teal-200">Hospital Initiative</span>
              </h1>

              {/* Subheadline */}
              <p className="text-xl text-teal-100 mb-4 font-medium">
                Department of Health – CALABARZON
              </p>

              <p className="text-lg text-teal-100/80 mb-8 max-w-xl leading-relaxed">
                Empowering healthcare facilities to deliver exceptional maternal and newborn care through certification, training, and continuous quality improvement.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/apply">
                  <button className="group bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto">
                    Apply for Certification
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <Link to="/about">
                  <button className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto backdrop-blur-sm">
                    Learn More
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-8 border-t border-white/20">
                <div className="flex flex-wrap items-center gap-6 text-sm text-teal-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-300" />
                    <span>DOH Accredited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-300" />
                    <span>National Standards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-300" />
                    <span>Free Assessment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Visual */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative">
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">MBFHI Certification</h3>
                        <p className="text-sm text-gray-500">Quality Healthcare</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Maternal Care Standards</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Newborn Care Protocols</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Facility Assessment</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Certified
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section
        ref={stats.ref}
        className={`py-16 bg-white transition-all duration-700 delay-100 ${
          stats.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div ref={facilitiesCount.ref} className="text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                {facilitiesCount.count}+
              </div>
              <p className="text-gray-600 font-medium">Facilities Assessed</p>
            </div>
            <div className="text-center">
              <div ref={certifiedCount.ref} className="text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                {certifiedCount.count}%
              </div>
              <p className="text-gray-600 font-medium">Certification Rate</p>
            </div>
            <div className="text-center">
              <div ref={regionsCount.ref} className="text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                {regionsCount.count}
              </div>
              <p className="text-gray-600 font-medium">Provinces Covered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                24/7
              </div>
              <p className="text-gray-600 font-medium">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section
        ref={features.ref}
        className={`py-20 bg-gray-50 transition-all duration-700 delay-200 ${
          features.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
              Why Choose MBFHI
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Healthcare Certification
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our program provides a structured pathway to excellence in maternal and newborn care
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Quality Maternal Care
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Promote breastfeeding and safe maternal practices aligned with DOH standards and international best practices.
              </p>
              <div className="flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
                Learn more
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Facility Assessment
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Comprehensive evaluation of hospitals, birthing homes, and health centers using standardized criteria.
              </p>
              <div className="flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
                Learn more
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Official Certification
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Earn recognition for meeting national healthcare standards and commitment to excellence in care.
              </p>
              <div className="flex items-center text-teal-600 font-semibold group-hover:gap-2 transition-all">
                Learn more
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Streamlined Process</h3>
                  <p className="text-gray-600">
                    Simple online application with clear requirements and fast processing times.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Continuous Support</h3>
                  <p className="text-gray-600">
                    Ongoing guidance and resources to maintain and improve your certification status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section
        ref={testimonials.ref}
        className={`py-20 bg-white transition-all duration-700 delay-300 ${
          testimonials.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Facilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what certified facilities say about the MBFHI program
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The MBFHI certification process was straightforward and the support from the DOH team was exceptional. Our facility has seen improved patient satisfaction."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-700 font-bold">RH</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Regional Hospital</p>
                  <p className="text-sm text-gray-500">Batangas Province</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Being MBFHI certified has elevated our reputation and helped us attract more patients. The training resources provided are invaluable."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold">BH</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Birthing Home</p>
                  <p className="text-sm text-gray-500">Cavite Province</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "The assessment process helped us identify areas for improvement. Now we provide better care for mothers and newborns in our community."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 font-bold">HC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Health Center</p>
                  <p className="text-sm text-gray-500">Laguna Province</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section
        ref={cta.ref}
        className={`py-20 transition-all duration-700 delay-400 ${
          cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-12 lg:p-16">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400 rounded-full blur-3xl"></div>
            </div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Ready to Elevate Your Healthcare Facility?
                </h2>
                <p className="text-xl text-teal-100 mb-8 leading-relaxed">
                  Join the growing network of MBFHI-certified facilities providing exceptional maternal and newborn care across CALABARZON.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/apply">
                    <button className="group bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 w-full sm:w-auto">
                      Start Your Application
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                  <Link to="/requirements">
                    <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto">
                      View Requirements
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>

              <div className="hidden lg:flex justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-200" />
                      <span className="text-white font-medium">Free Assessment</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-200" />
                      <span className="text-white font-medium">Expert Guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-200" />
                      <span className="text-white font-medium">National Recognition</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-200" />
                      <span className="text-white font-medium">Continuous Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
