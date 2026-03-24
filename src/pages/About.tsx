import { CheckCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* FADE-IN HOOK */
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

export default function About() {
  const section = useFadeInOnScroll();

  return (
    <div
      ref={section.ref}
      className={`max-w-4xl mx-auto p-6 space-y-6 transition-all duration-700 ${
        section.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >

      {/* HEADER */}
      <h2 className="text-2xl font-bold text-[#2EB8C4]">
        About Us
      </h2>

      {/* INTRO */}
      <p className="text-gray-700">
        The Mother-Baby Friendly Hospital Initiative (MBFHI) is a global effort
        to improve the quality of maternal and infant healthcare through
        evidence-based practices and compassionate care.
      </p>

      <p className="text-gray-700">
        In the CALABARZON region, this initiative supports healthcare facilities
        in delivering safe, high-quality, and respectful care for mothers and
        newborns.
      </p>

      {/* MISSION */}
      <div>
        <h3 className="text-lg font-semibold text-[#2EB8C4] mb-2">
          Our Mission
        </h3>
        <p className="text-gray-700">
          To promote and support healthcare facilities in implementing
          evidence-based practices that improve outcomes for mothers and babies,
          ensuring every family receives compassionate and high-quality care.
        </p>
      </div>

      {/* VISION */}
      <div>
        <h3 className="text-lg font-semibold text-[#2EB8C4] mb-2">
          Our Vision
        </h3>
        <p className="text-gray-700">
          A region where every mother and baby has access to respectful,
          mother-baby friendly healthcare that supports bonding and promotes
          optimal health outcomes.
        </p>
      </div>

      {/* PRINCIPLES */}
      <div>
        <h3 className="text-lg font-semibold text-[#2EB8C4] mb-3">
          Core Principles
        </h3>

        <div className="space-y-2">
          {[
            "Evidence-based care practices",
            "Respect for cultural diversity and individual needs",
            "Support for breastfeeding and mother-baby bonding",
            "Comprehensive prenatal and postnatal care",
            "Family involvement in healthcare decisions",
            "Continuous quality improvement",
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle size={18} className="text-[#2EB8C4] mt-1" />
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CERTIFICATION PROCESS CARDS */}
<div className="mt-10">
  <h3 className="text-lg font-bold text-[#2EB8C4] mb-3">
    Certification Process
  </h3>

  <div className="grid md:grid-cols-4 gap-6">
    
    {[
      {
        step: "1",
        title: "Application",
        desc: "Submit your facility information",
      },
      {
        step: "2",
        title: "Review",
        desc: "Initial document review",
      },
      {
        step: "3",
        title: "Assessment",
        desc: "On-site evaluation by experts",
      },
      {
        step: "4",
        title: "Certification",
        desc: "Receive MBFHI certification",
      },
    ].map((item, index) => (
      <div
        key={index}
        className="bg-gray-50 border rounded-xl p-6 text-center shadow-sm hover:shadow-md transition"
      >
        {/* STEP CIRCLE */}
        <div className="w-12 h-12 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
          {item.step}
        </div>

        {/* TITLE */}
        <h4 className="font-semibold text-gray-900 mb-2">
          {item.title}
        </h4>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-600">
          {item.desc}
        </p>
      </div>
    ))}

  </div>
</div>

      {/* 📄 DOWNLOADABLE GUIDELINES */}
      <div>
        <h3 className="text-lg font-semibold text-[#2EB8C4] mb-2">
          Downloadable Guidelines
        </h3>

        <p className="text-gray-700 mb-3">
          Access official guidelines and reference materials related to the
          Mother-Baby Friendly Hospital Initiative.
        </p>

        <div className="space-y-2">
          <a
            href="/files/MBFHI-Guidelines.pdf"
            target="_blank"
            className="block text-teal-700 hover:underline"
          >
            📄 MBFHI Guidelines (PDF)
          </a>

          <a
            href="/files/DOH-Breastfeeding-Policy.pdf"
            target="_blank"
            className="block text-teal-700 hover:underline"
          >
            📄 DOH Breastfeeding Policy (PDF)
          </a>
        </div>
      </div>

    </div>
  );
}