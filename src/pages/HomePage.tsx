import Hero from '@/components/sections/Hero'
import CatalogGrid from '@/components/sections/CatalogGrid'
import AboutSplit from '@/components/sections/AboutSplit';
import USP from '@/components/sections/USP'
import Reviews from '@/components/sections/Reviews'
import CTA from '@/components/sections/CTA'

export default function HomePage(){
  return (
    <>
      <Hero/>
      <CatalogGrid/>
      <AboutSplit/>
      <USP/>
      <Reviews/>
      <CTA/>
    </>
  )
}
