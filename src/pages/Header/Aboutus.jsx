import { Building2, Users, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Testimonials from "@/components/ui/testimonials-demo";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Hero Section */}
        <ContainerScroll
          titleComponent={
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-stone-900">
                About Shreejee Real Estate
              </h1>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                Your Gateway to Property Success in Dehradun
              </p>
              <p className="text-lg text-stone-500 max-w-3xl mx-auto">
                Empowering individuals through our innovative MLM plan to build wealth and achieve financial freedom in the thriving Dehradun real estate market.
              </p>
            </>
          }
        >
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80"
            alt="Dehradun Cityscape"
            className="mx-auto rounded-2xl object-cover h-full object-left-top"
            draggable={false}
          />
        </ContainerScroll>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <Award className="h-5 w-5 text-blue-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone-600">
                To democratize real estate investment and create a community of successful property partners who contribute to and benefit from the development of Dehradun.
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-stone-600 list-disc list-inside">
                <li>Empower individuals with accessible property investment platforms</li>
                <li>Maintain transparency and fair business practices</li>
                <li>Foster sustainable income through a robust MLM structure</li>
                <li>Build trust through integrity and successful outcomes</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-10">
            Why Choose Shreejee Real Estate?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Prime Location", desc: "Focus on Dehradun's growing market" },
              { icon: Users, title: "Proven Plan", desc: "Structured MLM with multiple income streams" },
              { icon: Award, title: "Quality Properties", desc: "Curated, high-standard listings" },
              { icon: ShieldCheck, title: "Supportive Community", desc: "Training and dedicated support" }
            ].map((item, index) => (
              <Card key={index} className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-semibold text-lg text-stone-800 mb-2">{item.title}</h3>
                  <p className="text-stone-600 text-sm">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white rounded-xl shadow-sm p-6 border border-stone-200">
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-6">
            How Our MLM Plan Works
          </h2>
          <p className="text-center text-stone-600 mb-6 max-w-3xl mx-auto">
            Built on the principle of "Earning While Serving." Earn commissions through referrals and build a network for residual income.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4">
              <Badge variant="secondary" className="mb-3">1</Badge>
              <h3 className="font-semibold text-stone-800 mb-2">Direct Referral Bonus</h3>
              <p className="text-stone-600 text-sm">Earn on every successful referral</p>
            </div>
            <div className="text-center p-4">
              <Badge variant="secondary" className="mb-3">2</Badge>
              <h3 className="font-semibold text-stone-800 mb-2">Team Building Incentives</h3>
              <p className="text-stone-600 text-sm">Grow income as your network expands</p>
            </div>
            <div className="text-center p-4">
              <Badge variant="secondary" className="mb-3">3</Badge>
              <h3 className="font-semibold text-stone-800 mb-2">Performance Rewards</h3>
              <p className="text-stone-600 text-sm">Unlock bonuses at higher ranks</p>
            </div>
          </div>
        </section>

        {/* Commitment */}
        <section className="bg-blue-50 rounded-xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-center text-stone-800 mb-6">
            Our Commitment to You
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-stone-700">Legal Compliance & KYC Verified Network</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-stone-700">Regular Market Insights & Updates</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-stone-700">Dedicated Support Team</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <span className="text-stone-700">Transparent Business Practices</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-3xl font-bold text-stone-800">
            Ready to Grow With Us?
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Join our network today and take the first step towards building wealth in Dehradun's real estate market.
          </p>
          <div className="pt-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
              Explore Our Properties
            </Button>
          </div>
        </section>

        <Testimonials.Testimonials />
      </div>
    </div>
  );
}