import Hero from "@/components/hero/hero";
import CategoriesSection from "@/components/CategoriesSection/CategoriesSection";
import ProductsSection from "@/components/productsSection/productSection";
import BenefitsSection from "@/components/benefictsSection/BenefitsSection";
import ProcessBuy from "@/components/processBuy/processBuy";

export default function InicioPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Hero />
             <CategoriesSection />
             <ProductsSection />
             <BenefitsSection />
             <ProcessBuy />
             
        </div>
    );
}   