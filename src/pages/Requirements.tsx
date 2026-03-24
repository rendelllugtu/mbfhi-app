// src/pages/Requirements.tsx
import { FileText, Download, CheckCircle, Users, Shield, Heart, Baby, ClipboardList } from "lucide-react";
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

export default function Requirements() {
  const header = useFadeInOnScroll();
  const overview = useFadeInOnScroll();
  const criteria = useFadeInOnScroll();
  const checklist = useFadeInOnScroll();
  const process = useFadeInOnScroll();

  return (
    <div className="space-y-16">
      
      {/* HEADER */}
      <section
        ref={header.ref}
        className={`transition-all duration-700 text-center ${
          header.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText size={32} className="text-teal-700" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            MBFHI Requirements
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Learn about the requirements and standards healthcare facilities must meet to achieve Mother-Baby Friendly Hospital certification.
        </p>
      </section>

      {/* OVERVIEW */}
      <section
        ref={overview.ref}
        className={`transition-all duration-700 delay-100 ${
          overview.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-teal-700 mb-3">
            What is MBFHI?
          </h2>
          <p className="text-gray-700 mb-4">
            The Mother-Baby Friendly Hospital Initiative (MBFHI) is a global certification program that recognizes healthcare facilities for implementing practices that support breastfeeding, mother-baby bonding, and quality maternal and newborn care.
          </p>
          <p className="text-gray-700">
            Certification is granted to facilities that meet the WHO/UNICEF Global Standards for Baby-Friendly Hospitals and the specific requirements set by the Department of Health Philippines.
          </p>
        </div>
      </section>

      {/* CORE REQUIREMENTS GRID */}
      <section
        ref={criteria.ref}
        className={`transition-all duration-700 delay-200 ${
          criteria.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Core Requirements
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Breastfeeding Support */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Baby size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Breastfeeding Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Implement International Code of Marketing of Breastmilk Substitutes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Train all staff in breastfeeding support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Provide prenatal breastfeeding education</span>
              </li>
            </ul>
          </div>

          {/* Mother-Baby Care */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Heart size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Mother-Baby Care</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Rooming-in (24-hour mother-baby contact)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Skin-to-skin contact immediately after birth</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Support for responsive feeding cues</span>
              </li>
            </ul>
          </div>

          {/* Staff Training */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Staff Training</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Minimum 18 hours breastfeeding training for staff</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Competency assessment for lactation support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Regular updates and continuous education</span>
              </li>
            </ul>
          </div>

          {/* Policies & Protocols */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Shield size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Policies & Protocols</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Written breastfeeding policy posted</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Documented infant feeding practices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>No promotion of breastmilk substitutes</span>
              </li>
            </ul>
          </div>

          {/* Facility Standards */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <ClipboardList size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Facility Standards</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Designated lactation room/area</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Proper equipment for milk expression</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Clean and safe environment for mothers</span>
              </li>
            </ul>
          </div>

          {/* Community Linkages */}
          <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Users size={24} className="text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-3">Community Linkages</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Post-discharge breastfeeding support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Referral system for lactation concerns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={16} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span>Coordination with community health workers</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* SELF-ASSESSMENT CHECKLIST */}
      <section
        ref={checklist.ref}
        className={`transition-all duration-700 delay-300 ${
          checklist.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-white rounded-lg border shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={24} className="text-teal-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Self-Assessment Checklist
              </h2>
              <p className="text-gray-600 text-sm">
                Download and complete this checklist before applying for certification
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              What's Included in the Self-Assessment Tool:
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span><strong>10 Steps to Successful Breastfeeding</strong> - Criteria based on WHO/UNICEF standards</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span><strong>Compliance Rating System</strong> - Score yourself on each requirement</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span><strong>Evidence Checklist</strong> - Documentation needed for each criterion</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span><strong>Gap Analysis Format</strong> - Identify areas needing improvement</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle size={20} className="text-teal-700 mt-0.5 flex-shrink-0" />
                <span><strong>Action Plan Template</strong> - Plan your pathway to certification</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="/files/MBFHI-Self-Assessment-Checklist.pdf"
              download="MBFHI-Self-Assessment-Checklist.pdf"
              className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-3 rounded-md font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Download size={18} />
              Download Self-Assessment Checklist (PDF)
            </a>

            <a
              href="/apply"
              className="border border-teal-700 text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Application
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            File Size: ~250 KB | Format: PDF | Last Updated: 2024
          </p>
        </div>
      </section>

      {/* CERTIFICATION PROCESS */}
      <section
        ref={process.ref}
        className={`transition-all duration-700 delay-400 ${
          process.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Certification Process
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          
          {[
            {
              step: "1",
              title: "Self-Assessment",
              desc: "Download and complete the self-assessment checklist to evaluate your facility's readiness",
              icon: <ClipboardList size={24} className="text-white" />
            },
            {
              step: "2",
              title: "Application",
              desc: "Submit your facility information and self-assessment results through our online portal",
              icon: <FileText size={24} className="text-white" />
            },
            {
              step: "3",
              title: "External Assessment",
              desc: "DOH-accredited assessors conduct on-site evaluation of your facility",
              icon: <Users size={24} className="text-white" />
            },
            {
              step: "4",
              title: "Certification",
              desc: "Receive your MBFHI certification upon meeting all requirements",
              icon: <Shield size={24} className="text-white" />
            }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition text-center"
            >
              <div className="w-14 h-14 bg-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600">
                {item.desc}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* ADDITIONAL RESOURCES */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Additional Resources
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/files/MBFHI-Guidelines.pdf"
            target="_blank"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition"
          >
            <FileText size={24} className="text-teal-700" />
            <div>
              <p className="font-medium text-gray-900">MBFHI Guidelines</p>
              <p className="text-sm text-gray-500">Complete program guidelines (PDF)</p>
            </div>
          </a>

          <a
            href="/files/DOH-Breastfeeding-Policy.pdf"
            target="_blank"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition"
          >
            <FileText size={24} className="text-teal-700" />
            <div>
              <p className="font-medium text-gray-900">DOH Breastfeeding Policy</p>
              <p className="text-sm text-gray-500">Administrative orders on breastfeeding (PDF)</p>
            </div>
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 text-white rounded-lg p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to Begin Your MBFHI Journey?
        </h2>

        <p className="text-teal-100 mb-6 max-w-xl mx-auto">
          Download the self-assessment checklist, evaluate your facility, and submit your application today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/files/MBFHI-Self-Assessment-Checklist.pdf"
            download
            className="bg-white text-teal-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 inline-flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Checklist
          </a>

          <a
            href="/contact"
            className="border border-white text-white hover:bg-teal-600 px-6 py-3 rounded-md font-medium inline-flex items-center justify-center"
          >
            Contact Us
          </a>
        </div>
      </section>

    </div>
  );
}
