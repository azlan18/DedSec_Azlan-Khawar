import React from "react";
import CTScanAnalysis from "@/components/ctscan";
import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";

const CTScan: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-background pt-20">
        <CTScanAnalysis />
      </main>
      <Footer />
    </div>
  );
};

export default CTScan;