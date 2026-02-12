
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center py-12">
      <div className="text-center max-w-3xl px-4">
        <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase mb-6 inline-block">
          Trusted by 5,000+ Educators
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Next-Generation <br/>
          <span className="text-indigo-600">Online Examination</span> Platform
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Create, conduct, and analyze examinations with ease. Features instant grading, 
          detailed analytics, and AI-driven insights for students and administrators.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
          >
            Get Started <i className="fas fa-arrow-right"></i>
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
            Watch Demo
          </button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl px-4">
        {[
          { icon: 'fa-bolt', title: 'Instant Results', desc: 'No more waiting. Students get their scores and detailed analysis immediately after submission.' },
          { icon: 'fa-shield-halved', title: 'Secure Engine', desc: 'Proctoring features, tab-switch detection, and randomized questions ensure integrity.' },
          { icon: 'fa-chart-pie', title: 'Deep Analytics', desc: 'Comprehensive dashboards for admins to track student progress and question performance.' }
        ].map((feature, idx) => (
          <div key={idx} className="p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-2xl mb-6">
              <i className={`fas ${feature.icon}`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
