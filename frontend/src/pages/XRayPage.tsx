import React from "react";
import XRayAnalysis from "@/components/xray";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

const XRayPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background pt-20">
        <XRayAnalysis />
      </main>
      <Footer />
    </div>
  );
};

export default XRayPage; 