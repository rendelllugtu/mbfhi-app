// src/pages/Contact.tsx
import { MapPin, Phone, Mail, Facebook } from "lucide-react";
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

export default function Contact() {
  const header = useFadeInOnScroll();
  const info = useFadeInOnScroll();
  const map = useFadeInOnScroll();

  return (
    <div className="space-y-12">
      
      {/* HEADER */}
      <section
        ref={header.ref}
        className={`transition-all duration-700 ${
          header.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Contact Us
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Get in touch with the Department of Health CALABARZON MBFHI team. 
          We're here to help with your Mother-Baby Friendly Hospital Initiative inquiries.
        </p>
      </section>

      {/* CONTACT INFO CARDS */}
      <section
        ref={info.ref}
        className={`transition-all duration-700 delay-100 ${
          info.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* ADDRESS */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition text-center">
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Our Office</h3>
            <p className="text-gray-600 text-sm">
              Department of Health CALABARZON<br />
              Regional Health Office<br />
              Cavite, Philippines
            </p>
          </div>

          {/* PHONE */}
          <a 
            href="tel:+63288801234" 
            className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition text-center block"
          >
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={28} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-teal-700 hover:underline text-sm">
              (02) 8880-1234
            </p>
          </a>

          {/* EMAIL */}
          <a 
            href="mailto:mbfhi.calabarzon@doh.gov.ph" 
            className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition text-center block"
          >
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-teal-700 hover:underline text-sm">
              mbfhi.calabarzon@doh.gov.ph
            </p>
          </a>

          {/* FACEBOOK */}
          <a 
            href="https://www.facebook.com/DOHCALABARZON" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition text-center block"
          >
            <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Facebook size={28} className="text-teal-700" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Facebook</h3>
            <p className="text-teal-700 hover:underline text-sm">
              DOH CALABARZON
            </p>
          </a>

        </div>
      </section>

      {/* MAP SECTION */}
      <section
        ref={map.ref}
        className={`transition-all duration-700 delay-200 ${
          map.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Find Us on the Map
        </h2>
        
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="aspect-video md:aspect-[21/9]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.8374746!2d120.8789743!3d14.4436896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c7f1a3f0f0f0%3A0x0!2sCavite%20Provincial%20Capitol!5e0!3m2!1sen!2sph!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DOH CALABARZON Office Location"
              className="w-full h-full"
            />
          </div>
          
          <div className="p-4 bg-gray-50 border-t">
            <p className="text-sm text-gray-600 text-center">
              <MapPin size={14} className="inline mr-1 text-teal-700" />
              Department of Health CALABARZON Regional Office, Capitol Compound, Trece Martires City, Cavite
            </p>
          </div>
        </div>
      </section>

      {/* ADDITIONAL CTA */}
      <section className="bg-teal-700 text-white rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-teal-100 mb-6 max-w-xl mx-auto">
          Interested in applying for MBFHI certification? Our team is ready to guide you through the process.
        </p>
        <a 
          href="/apply" 
          className="bg-white text-teal-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 inline-block"
        >
          Apply for Certification
        </a>
      </section>

    </div>
  );
}
