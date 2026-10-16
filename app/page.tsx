'use client';
import dynamic from 'next/dynamic';
import Nav from '@/components/ui/Nav';
import SmoothScroll from '@/components/ui/SmoothScroll';
import TourOverlay from '@/components/ui/TourOverlay';
import DesignDock from '@/components/ui/DesignDock';
import { HotspotCard, ExploreBar, Toast, Loader } from '@/components/ui/Overlays';
import { PainPoints, Estimator, Process, Contact, Footer } from '@/components/ui/Sections';

const Experience = dynamic(() => import('@/components/three/Experience'), { ssr: false });

export default function Home() {
  return (
    <>
      <Loader />
      <SmoothScroll />
      <Experience />
      <Nav />
      <main className="content">
        <TourOverlay />
        <PainPoints />
        <Estimator />
        <Process />
        <Contact />
        <Footer />
      </main>
      <DesignDock />
      <HotspotCard />
      <ExploreBar />
      <Toast />
    </>
  );
}
