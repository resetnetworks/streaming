// CardStat.jsx
import React from "react";

const CardStat = ({ label = "Views", value = "750k" }) => (
  <div className="card-container">
    <div className="card">
      <div className="label">{label}</div>
      <div className="text">{value}</div>
    </div>
    
    <style jsx="true">{`
      .card-container {
        --card-width: 191px;
        --card-height: 110px;
        --label-font-size: 0.9rem;
        --value-font-size: 2rem;
        --padding: 15px;
        
        width: 100%;
        max-width: var(--card-width);
        height: var(--card-height);
        border-radius: 12px;
        padding: 1px;
        background: linear-gradient(135deg, #ffffff, #0c0d0d);
        position: relative;
      }
      
      .card {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        background: 
          radial-gradient(circle 180px at 0% 0%, #444444, #0E1525),
          #222126B2;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        flex-direction: column;
        color: #fff;
        position: relative;
        overflow: hidden;
        padding: var(--padding);
      }
      
      .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #222126B2;
        border-radius: 10px;
        z-index: 1;
      }
      
      .card .label {
        font-size: var(--label-font-size);
        color: #c7c7c7;
        font-weight: 500;
        margin-bottom: 4px;
        padding-bottom: 4px;
        width: 100%;
        position: relative;
        z-index: 2;
      }
      
      .card .label::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 20%;
        height: 2px;
        background: linear-gradient(90deg,#000000, #0459FE);
        z-index: 2;
      }
      
      .card .text {
        font-size: var(--value-font-size);
        color: white;
        line-height: 1;
        z-index: 2;
        position: relative;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .card-container {
          --card-width: 120px;
          --card-height: 80px;
          --value-font-size: 1.8rem;
        }

         .card .text {
        --value-font-size: 1.4rem;
      }
          .card .label {
        --label-font-size: 0.7rem;
      }
      }
    `}</style>
  </div>
);

export default CardStat;