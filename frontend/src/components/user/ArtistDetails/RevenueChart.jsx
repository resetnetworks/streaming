import React, { useEffect, useRef, useState } from 'react';
import Chart from 'react-apexcharts';

const RevenueChart = () => {
  const chartRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCircle, setActiveCircle] = useState(0);
  
  const series = [85, 10, 5];
  
  const options = {
    chart: {
      type: 'donut',
      width: 700,
      height: 700,
      animations: {
        enabled: true,
        easing: 'easeInOutCirc',
        speed: 1200,
        animateGradually: {
          enabled: true,
          delay: 300
        },
        dynamicAnimation: {
          enabled: true,
          speed: 600
        }
      },
      dropShadow: {
        enabled: true,
        top: 8,
        left: 8,
        blur: 15,
        color: '#1a237e',
        opacity: 0.3
      }
    },
    labels: ['Your Share', 'Reset Music', 'Payment Fee'],
    colors: ['#4A90E2', '#E94B8C', '#F5A623'],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'radial',
        shadeIntensity: 0.5,
        gradientToColors: ['#2171b5', '#c51b7d', '#d73027'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      }
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: '45%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'jura, sans-serif',
              fontWeight: 'bold',
              color: '#333',
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '20px',
              fontFamily: 'jura, sans-serif',
              fontWeight: 'bold',
              color: '#4A90E2',
              offsetY: 5,
              formatter: function (val) {
                return val + '%';
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Revenue Split',
              fontSize: '14px',
              fontFamily: 'jura, sans-serif',
              fontWeight: 'normal',
              color: '#666',
              formatter: function (w) {
                return '100%';
              }
            },
            // Yahan center mein white background aur shadow add kiya hai
            background: {
              enabled: true,
              foreColor: '#fff',
              padding: 10,
              borderRadius: 12,
              borderWidth: 0,
              borderColor: '#fff',
              opacity: 0.9,
              background: {
                color: '#ffffff'
              },
              dropShadow: {
                enabled: true,
                top: 2,
                left: 2,
                blur: 8,
                color: '#000000',
                opacity: 0.15
              }
            }
          }
        },
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val, { seriesIndex, w }) {
        return [`${w.config.labels[seriesIndex]}`, `${val}%`];
      },
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'jura, sans-serif',
        colors: ['#ffffff']
      },
      background: {
        enabled: true,
        foreColor: '#fff',
        padding: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fff',
        opacity: 0.8,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          color: '#000',
          opacity: 0.35
        }
      }
    },
    legend: {
      show: false
    },
    stroke: {
      width: 3,
      colors: ['#ffffff'],
      lineCap: 'round'
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '14px',
        fontFamily: 'jura, sans-serif'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          width: 450,
          height: 450
        }
      }
    }]
  };

  const textSections = [
    {
      id: 'free',
      title: 'Artist Accounts Are Free',
      content: 'No upfront costs, no hidden fees. Start uploading your music today and build your audience without any barriers.',
      color: '#4A90E2'
    },
    {
      id: 'revenue',
      title: 'Fair Revenue Sharing',
      content: 'We take only 10% from merch sales and 15% from digital music. The remaining 85% goes directly to your PayPal account.',
      color: '#E94B8C'
    },
    {
      id: 'payout',
      title: 'Quick Payouts',
      content: 'Get paid fast! Payments typically reach your PayPal account within 24 to 48 hours of a sale.',
      color: '#F5A623'
    },
    {
      id: 'pro',
      title: 'Upgrade to Pro',
      content: 'For just $10/month, unlock advanced analytics, priority support, and exclusive features to grow your music career.',
      color: '#9C27B0'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    const interval = setInterval(() => {
      setActiveCircle((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Centered Header */}
      <div className="text-center mb-8 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Simple & 
          <span className="text-transparent bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text"> 
            Transparent
          </span>
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-300">Pricing</h2>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-24 justify-center items-center">
        
        {/* Left Side - Chart */}
        <div 
          ref={chartRef}
          className={`flex justify-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}
        >
          <Chart 
            options={options} 
            series={series} 
            type="donut" 
            width="700" 
            height="700" 
          />
        </div>

        {/* Right Side - Text Content - Mobile Optimized */}
        <div className={`space-y-6 md:space-y-8 px-8 md:px-0 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        }`}>

          {/* Animated Content Sections */}
          <div className="space-y-4 md:space-y-6">
            {textSections.map((section, index) => (
              <div
                key={section.id}
                className={`relative pl-12 md:pl-16 transition-all duration-500 ${
                  activeCircle === index ? 'transform scale-105' : ''
                }`}
              >
                <div 
                  className={`absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full border-3 md:border-4 flex items-center justify-center transition-all duration-500 ${
                    activeCircle === index 
                      ? 'border-white shadow-lg scale-110' 
                      : 'border-gray-200'
                  }`}
                  style={{ 
                    backgroundColor: activeCircle === index ? section.color : 'white',
                    boxShadow: activeCircle === index ? `0 0 20px ${section.color}40` : 'none'
                  }}
                >
                  <div 
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                      activeCircle === index ? 'bg-white' : 'bg-gray-300'
                    }`}
                  />
                </div>

                <div className={`transition-all duration-300 ${
                  activeCircle === index ? 'text-gray-800' : 'text-gray-600'
                }`}>
                  <h3 
                    className={`text-lg md:text-xl font-semibold mb-1 md:mb-2 transition-all duration-300 ${
                      activeCircle === index ? 'text-gray-900' : 'text-gray-700'
                    }`}
                    style={{ 
                      color: activeCircle === index ? section.color : undefined 
                    }}
                  >
                    {section.title}
                  </h3>
                  <p className={`text-sm md:text-base leading-relaxed transition-all duration-300 ${
                    activeCircle === index ? 'text-gray-200 font-medium' : 'text-gray-500'
                  }`}>
                    {section.content}
                  </p>
                </div>

                <div 
                  className={`absolute left-4 md:left-5 top-10 md:top-12 bottom-0 w-0.5 transition-all duration-300 ${
                    activeCircle === index ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundColor: section.color }}
                />
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="pt-6 md:pt-8">
            <button className="w-full md:w-auto group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="mr-2">Learn More About Pricing</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
      <div className='gradiant-line mt-6 md:mt-10'></div>
    </div>
  );
};

export default RevenueChart;
