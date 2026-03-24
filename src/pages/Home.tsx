// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Heart, Users, Award, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function Home() {
  const hero = useFadeInOnScroll();
  const features = useFadeInOnScroll();
  const cta = useFadeInOnScroll();

  return (
    <div className="space-y-20 text-left">
      
      {/* HERO */}
      <section
        ref={hero.ref}
        className={`transition-all duration-700 ${
          hero.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid md:grid-cols-2 gap-10 items-center">
          
          <div>
            {/* LOGOS */}
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center p-2 shadow-sm">
                <img 
                  src="/doh-logo.png" 
                  alt="DOH Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center p-2 shadow-sm">
                <img 
                  src="/calabarzon-logo.png" 
                  alt="CALABARZON Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Department of Health – CALABARZON
            </h1>

            <p className="text-lg text-gray-700 mb-4">
              Mother-Baby Friendly Hospital Initiative (MBFHI)
            </p>

            <p className="text-gray-600 mb-8">
              Supporting healthcare facilities in delivering safe, quality,
              and compassionate care for mothers and newborns across the region.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch">
              <Link to="/apply">
                 <a className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-md font-medium flex items-center justify-center gap-2 h-12 w-full sm:w-auto">
                  Apply for Certification 
                  <ArrowRight size={18} />
                </a>
              </Link>

              <Link to="/about">
                <a className="border border-teal-700 text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium flex items-center justify-center h-12 w-full sm:w-auto">
                  About the Program
                </a>
              </Link>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="w-72 h-72 bg-teal-50 border rounded-xl flex items-center justify-center">
              <Heart size={90} className="text-teal-700 opacity-40" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        ref={features.ref}
        className={`transition-all duration-700 delay-100 ${
          features.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
          Program Highlights
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <Heart className="text-teal-700 mb-4" size={26} />
            <h3 className="font-semibold text-lg mb-2">
              Quality Maternal Care
            </h3>
            <p className="text-gray-600 text-sm">
              Promote breastfeeding and safe maternal practices aligned with DOH standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <Users className="text-teal-700 mb-4" size={26} />
            <h3 className="font-semibold text-lg mb-2">
              Facility Assessment
            </h3>
            <p className="text-gray-600 text-sm">
              Structured evaluation of hospitals and birthing facilities.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <Award className="text-teal-700 mb-4" size={26} />
            <h3 className="font-semibold text-lg mb-2">
              Official Certification
            </h3>
            <p className="text-gray-600 text-sm">
              Recognition for facilities meeting national healthcare standards.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={cta.ref}
        className={`transition-all duration-700 delay-200 ${
          cta.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-teal-700 text-white rounded-lg p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Start Your MBFHI Journey
          </h2>

          <p className="text-teal-100 mb-6">
            Apply today and be part of a nationwide movement for better maternal and child healthcare.
          </p>

          <Link to="/apply">
            <a className="bg-white text-teal-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 inline-block">
              Begin Application
            </a>
          </Link>
        </div>
      </section>

    </div>
  );
}