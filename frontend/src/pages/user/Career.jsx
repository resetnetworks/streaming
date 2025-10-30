// CareerPage.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import Footer from '../../components/user/Footer';
import PageSEO from '../../components/PageSeo/PageSEO';
import IconHeader from '../../components/user/IconHeader';
import { 
  FaMusic, 
  FaHeadphones, 
  FaUsers, 
  FaCode, 
  FaChartLine, 
  FaHeart,
  FaMapMarkerAlt,
  FaClock,
  FaDollarSign,
  FaShieldAlt,
  FaLock,
  FaUserShield
} from 'react-icons/fa';

const CareerPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  const openEmailApplication = (position) => {
    const subject = `Job Application: ${position}`;
    const mailtoLink = `mailto:contact@reset93.net?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoLink, '_blank');
  };

  const careerBenefits = [
    {
      icon: <FaMusic className="text-2xl" />,
      title: "Music Passion",
      description: "Work with what you love - music is at our core"
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: "Creative Team",
      description: "Collaborate with talented musicians and developers"
    },
    {
      icon: <FaCode className="text-2xl" />,
      title: "Tech Innovation",
      description: "Use cutting-edge technology in music applications"
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Growth Opportunities",
      description: "Grow your career in music technology best practices"
    },
    {
      icon: <FaHeart className="text-2xl" />,
      title: "Health Benefits",
      description: "Comprehensive health and wellness package"
    },
    {
      icon: <FaDollarSign className="text-2xl" />,
      title: "Competitive Salary",
      description: "Attractive compensation package with performance bonuses"
    }
  ];

 const jobOpenings = [
  {
    id: 1,
    title: "DevOps Engineer",
    department: "Engineering",
    type: "Full-time",
    location: "on-site",
    experience: "1+ years",
    description: "Looking for a DevOps Engineer to manage CI/CD pipelines, cloud infrastructure, and system reliability.",
    requirements: [
      "Experience with AWS, Docker, and Kubernetes",
      "Proficiency in CI/CD tools like GitHub or Jenkins Actions",
      "Strong scripting skills (Bash, Python, etc.)",
      "Understanding of infrastructure as code (Terraform, Ansible)"
    ]
  },
  {
    id: 2,
    title: "Industrial Engineer",
    department: "Operations",
    type: "Full-time",
    location: "On-site",
    experience: "2+ years",
    description: "Optimize production workflows and design efficient operational systems for scaling manufacturing.",
    requirements: [
      "Bachelor’s degree in Industrial Engineering or related field",
      "Experience with process optimization and Lean Six Sigma principles",
      "Strong analytical and problem-solving skills",
      "Proficiency in data analysis and workflow tools"
    ]
  },
  {
    id: 3,
    title: "HR Manager",
    department: "Human Resources",
    type: "Full-time",
    location: "on-site",
    experience: "2+ years",
    description: "We’re seeking an HR Manager to lead recruitment, employee engagement, and HR strategy.",
    requirements: [
      "Experience managing end-to-end HR processes",
      "Knowledge of labor laws and compliance standards",
      "Strong communication and interpersonal skills",
      "Experience with HR software systems"
    ]
  },
  {
    id: 4,
    title: "ML Engineer",
    department: "AI & Research",
    type: "Full-time",
    location: "on-site",
    experience: "3+ years",
    description: "Develop and deploy machine learning models for recommendation, classification, and audio analysis.",
    requirements: [
      "Proficiency in Python, TensorFlow or PyTorch",
      "Experience with data preprocessing and model optimization",
      "Knowledge of MLOps and deployment pipelines",
      "Strong foundation in statistics and algorithms"
    ]
  },
  {
    id: 5,
    title: "Accountant",
    department: "Finance",
    type: "Full-time",
    location: "On-site",
    experience: "3+ years",
    description: "Handle accounting, bookkeeping, and financial reporting for a growing tech company.",
    requirements: [
      "Bachelor’s degree in Accounting, Finance, or related field",
      "Experience with QuickBooks or similar accounting tools",
      "Strong attention to detail and accuracy",
      "Knowledge of tax regulations and compliance"
    ]
  },
  {
    id: 6,
    title: "Artist Manager",
    department: "Talent Management",
    type: "Full-time",
    location: "on-site",
    experience: "1+ years",
    description: "Work with artists to manage collaborations, schedules, contracts, and promotions.",
    requirements: [
      "Experience in music or talent management",
      "Excellent organizational and negotiation skills",
      "Understanding of contracts and licensing",
      "Strong relationship management abilities"
    ]
  },
  {
    id: 7,
    title: "PCB Designer",
    department: "Hardware",
    type: "Full-time",
    location: "On-site",
    experience: "2+ years",
    description: "Design high-quality PCB layouts for music hardware and embedded systems.",
    requirements: [
      "Experience with Altium Designer, Eagle, or KiCad",
      "Knowledge of PCB manufacturing processes",
      "Understanding of analog and digital circuit design",
      "Attention to signal integrity and EMI considerations"
    ]
  },
  {
    id: 8,
    title: "PCB Assembler",
    department: "Hardware Production",
    type: "Full-time",
    location: "On-site",
    experience: "1+ year",
    description: "Assemble and test printed circuit boards for audio hardware products.",
    requirements: [
      "Experience in soldering and PCB assembly",
      "Knowledge of electronic components and schematics",
      "Ability to work with surface mount and through-hole components",
      "Strong attention to quality and detail"
    ]
  }
];


  // Google Jobs Structured Data
  const jobsStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": jobOpenings.map((job, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.title,
        "description": `${job.description} Requirements: ${job.requirements.join(', ')}`,
        "datePosted": "2025-01-20",
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "Reset Music",
          "sameAs": "https://musicreset.com",
          "logo": "https://musicreset.com/icon.png"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location,
            "addressCountry": "IN"
          }
        },
        "applicantLocationRequirements": {
          "@type": "Country",
          "name": "India"
        },
        "validThrough": "2025-03-20T00:00:00+05:30"
      }
    }))
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <>
      <PageSEO
        title="Careers at Reset Music - Join Our Team"
        description="Explore career opportunities at Reset Music. Join our innovative team working on cutting-edge music streaming technology and audio experiences."
        canonicalUrl="https://musicreset.com/careers"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Careers at Reset Music",
            "description": "Explore career opportunities at Reset Music. Join our innovative team working on cutting-edge music streaming technology.",
            "url": "https://musicreset.com/careers",
            "mainEntity": {
                "@type": "Organization",
                "name": "Reset Music",
                "url": "https://musicreset.com",
                "logo": "https://musicreset.com/icon.png",
                "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "contact@reset93.net",
                    "contactType": "HR department"
                }
            },
            "dateModified": "2025-01-20"
          },
          jobsStructuredData
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-[#020216] via-[#0d1b3f] to-[#0a0a23] text-white">
        <IconHeader />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >

              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#88b2ef] to-[#3b82f6]">
                Careers at Reset Music
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Join us in revolutionizing how people create, discover, and experience music.
              </p>
              <div className="button-wrapper cursor-pointer shadow-sm shadow-black inline-block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="custom-button text-lg"
                  onClick={() => document.getElementById('openings').scrollIntoView({ behavior: 'smooth' })}
                >
                  View Open Positions
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
        <div className='gradiant-line'></div>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#88b2ef]">Why Join Reset Music?</h2>
              <p className="text-gray-400 text-lg">We offer more than just a job - we offer a passion</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {careerBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="subscription-wrapper w-full"
                >
                  <div className="subscription-card p-6 rounded-xl border border-slate-700 hover:border-[#3b82f6] transition-all duration-300 group cursor-pointer">
                    <div className="text-[#3b82f6] mb-4 group-hover:scale-110 transition-transform">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <div className='gradiant-line'></div>

        {/* Job Openings Section */}
        <section id="openings" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-[#88b2ef]">Open Positions</h2>
              <p className="text-gray-400 text-lg">Join our team and help shape the future of music</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="space-y-6"
            >
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={job.id}
                  variants={itemVariants}
                  className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 hover:border-[#3b82f6] transition-all duration-300"
                  itemScope
                  itemType="https://schema.org/JobPosting"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2" itemProp="title">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-4 mb-3">
                          <span className="flex items-center text-gray-400">
                            <FaHeadphones className="mr-2 text-[#3b82f6]" />
                            <span itemProp="department">{job.department}</span>
                          </span>
                          <span className="flex items-center text-gray-400">
                            <FaClock className="mr-2 text-[#3b82f6]" />
                            <span itemProp="employmentType">{job.type}</span>
                          </span>
                          <span className="flex items-center text-gray-400">
                            <FaMapMarkerAlt className="mr-2 text-[#3b82f6]" />
                            <span itemProp="jobLocation">{job.location}</span>
                          </span>
                          <span className="flex items-center text-gray-400">
                            <FaChartLine className="mr-2 text-[#3b82f6]" />
                            {job.experience}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-4" itemProp="description">
                          {job.description}
                        </p>
                      </div>
                      <div className="button-wrapper cursor-pointer shadow-sm shadow-black mt-4 lg:mt-0 lg:ml-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => openEmailApplication(job.title)}
                          className="custom-button whitespace-nowrap"
                          itemProp="applicationUrl"
                        >
                          Apply Now
                        </motion.button>
                      </div>
                    </div>
                    
                    {selectedJob === job.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-slate-700"
                      >
                        <h4 className="font-semibold mb-3 text-[#88b2ef]">Requirements:</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                    
                    <button
                      onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                      className="text-[#3b82f6] hover:text-[#88b2ef] mt-4 text-sm font-medium transition-colors duration-200"
                    >
                      {selectedJob === job.id ? 'Show Less' : 'View Details'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <div className='gradiant-line'></div>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-[#88b2ef]">Don't See the Perfect Role?</h2>
              <p className="text-xl text-gray-300 mb-8">
                We're always looking for talented people passionate about music and technology.
                Send us your resume and tell us how you can contribute to Reset Music.
              </p>
              <div className="button-wrapper cursor-pointer shadow-sm shadow-black inline-block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openEmailApplication("General Application")}
                  className="custom-button text-lg"
                >
                  Send General Application
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default CareerPage;