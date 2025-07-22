import{j as e,E as w,q as C,v as S,w as E,u as R,b as Y,r as m,P as z,y as M,C as u,t as v,Q as U}from"./index-Bq32TEZ8.js";const B=C("pk_test_51Kr3X3SJADrx40al3R8tFGDrAXJPHUKWYXdV5hDRYRG8Mld4FRaJ7fRozKbYxeUShBinMsfXCWNrj20OAgfojcme0093XF6ijY"),D=({itemType:a,itemId:r,amount:i,onSuccess:n,onClose:t})=>{const l=S(),o=E(),x=R(),{clientSecret:h,loading:N,error:P}=Y(s=>s.payment),[p,f]=m.useState(!1);m.useEffect(()=>(x(z({itemType:a,itemId:r,amount:i})),()=>{x(M())}),[a,r,i,x]);const k=async s=>{if(s.preventDefault(),!l||!o||!h)return;f(!0);const c=o.getElement(u),d=await l.confirmCardPayment(h,{payment_method:{card:c}});if(d.error){v.error("Payment failed: "+d.error.message),f(!1);return}v.success("✅ Payment successful!"),x(U({itemType:a,itemId:r})),n==null||n(),t==null||t(),f(!1)},[y,g]=m.useState(""),[j,b]=m.useState("");return m.useEffect(()=>{if(!o)return;const s=o.getElement(u);s&&s.on("change",c=>{var d;c.complete?(g(c.brand||""),b(((d=c.value)==null?void 0:d.last4)||"")):(g(""),b(""))})},[o]),N?e.jsx("div",{className:"flex justify-center items-center py-8",children:e.jsx("div",{className:"animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400"})}):P?e.jsx("div",{className:"text-red-400 text-sm p-4 text-center",children:"Failed to initialize payment. Try again later."}):e.jsxs("form",{onSubmit:k,className:"space-y-5",children:[e.jsxs("div",{className:"flex items-center space-x-2 text-xs text-green-400",children:[e.jsx("svg",{className:"w-4 h-4",fill:"currentColor",viewBox:"0 0 20 20",children:e.jsx("path",{fillRule:"evenodd",d:"M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z",clipRule:"evenodd"})}),e.jsx("span",{children:"Your payment is encrypted & secure"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-200",children:"Card Details"}),e.jsx("div",{className:"bg-gray-800 p-3 rounded-lg border border-gray-700 focus-within:border-indigo-500 transition",children:e.jsx(u,{options:{style:{base:{fontSize:"16px",color:"#f3f4f6","::placeholder":{color:"#9ca3af"},iconColor:"#6366f1"},invalid:{color:"#f87171",iconColor:"#f87171"}},hidePostalCode:!0}})}),y&&j&&e.jsxs("p",{className:"text-xs text-gray-400",children:[y.toUpperCase()," •••• ",j]})]}),e.jsxs("div",{className:"flex justify-end space-x-3",children:[e.jsx("button",{type:"button",onClick:t,className:"px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md disabled:opacity-50",disabled:p,children:"Cancel"}),e.jsx("button",{type:"submit",className:"px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 flex items-center",disabled:p||!l,children:p?e.jsxs(e.Fragment,{children:[e.jsxs("svg",{className:"animate-spin -ml-1 mr-2 h-4 w-4",fill:"none",viewBox:"0 0 24 24",children:[e.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),e.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),"Processing..."]}):`Pay ₹${i}`})]}),e.jsxs("div",{className:"text-center text-xs text-gray-500 mt-4",children:["Powered by"," ",e.jsx("a",{href:"https://stripe.com",target:"_blank",rel:"noopener noreferrer",className:"underline hover:text-gray-300",children:"Stripe"})]})]})},O=({itemType:a,itemId:r,amount:i,onSuccess:n,onClose:t})=>e.jsxs("div",{className:"fixed inset-0 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn",onClick:t,children:[e.jsxs("div",{className:"bg-gray-900/95 border border-gray-700/60 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp",onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-xl font-bold text-white",children:"Complete Your Purchase"}),e.jsx("p",{className:"text-sm text-gray-400 mt-1",children:"One-time secure payment via Stripe"})]}),e.jsx("button",{onClick:t,className:"text-gray-400 hover:text-gray-200",children:e.jsx("svg",{className:"h-6 w-6",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})})]}),e.jsx("div",{className:"mt-6",children:e.jsx(w,{stripe:B,children:e.jsx(D,{itemType:a,itemId:r,amount:i,onSuccess:n,onClose:t})})})]}),e.jsx("style",{children:`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `})]});export{O};
