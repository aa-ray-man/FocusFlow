import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Timer, BarChart3, CheckCircle, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const features = [{
  icon: Target,
  title: "Smart Habit Tracking",
  description: "Build lasting study habits with intelligent tracking and gentle reminders.",
  color: "text-mint"
}, {
  icon: Timer,
  title: "Pomodoro Timer",
  description: "Stay focused with customizable work sessions and strategic breaks.",
  color: "text-lavender"
}, {
  icon: BarChart3,
  title: "Progress Analytics",
  description: "Visualize your productivity patterns and celebrate your growth.",
  color: "text-peach"
}];
const testimonials = [{
  name: "Divija Sharma",
  role: "Computer Science Student",
  content: "FocusFlow transformed my study routine. I went from cramming to consistent daily progress.",
  rating: 5
}, {
  name: "Abhiraj Singh",
  role: "Medical Student",
  content: "The habit tracking keeps me accountable. I've maintained my study streak for 3 months now!",
  rating: 5
}, {
  name: "Aayushi Verma",
  role: "MBA Student",
  content: "Finally, a productivity app that understands the student mindset. Clean, simple, effective.",
  rating: 5
}];
const faqs = [{
  question: "Is FocusFlow free to use?",
  answer: "Yes! FocusFlow offers a comprehensive free plan with all core features. Premium features will be available for advanced users who want additional customization options."
}, {
  question: "How does the habit tracking work?",
  answer: "Set your study goals, track your daily progress, and watch your consistency streaks grow. Our gentle reminders help you stay on track without being overwhelming."
}, {
  question: "Can I customize the Pomodoro timer?",
  answer: "Absolutely! Adjust work sessions, break lengths, and even choose ambient sounds that help you focus best. Every student's rhythm is different."
}, {
  question: "Is my data secure?",
  answer: "Your privacy is our priority. All data is encrypted and stored securely. You own your data and can export or delete it anytime."
}];
export default function Landing() {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              FocusFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth">Sign Up Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent mx-0 my-0 py-[9px]">
            Organize. Focus. Achieve.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your study habits with FocusFlow — the productivity app designed specifically for students who want to build consistency, track progress, and achieve their academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="hero" asChild>
              <Link to="/auth">Start Your Journey Free</Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link to="/auth">Login to Continue</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to <span className="text-primary">succeed</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="bg-gradient-card border-border hover:shadow-glow transition-all duration-500">
                <CardContent className="p-6 text-center">
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Loved by <span className="text-mint">students everywhere</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently asked <span className="text-peach">questions</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to transform your study habits?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who've already discovered the power of consistent, mindful studying.
          </p>
          <Button size="xl" variant="hero" asChild>
            <Link to="/auth">Get Started for Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; FocusFlow. Made with ❤️ by
            <a href="https://github.com/aa-ray-man/FocusFlow" 
            target="_blank" 
            className="text-blue-600 hover:scale-110 transition-transform duration-300"> aa-ray-man</a>
          </p>
        </div>
      </footer>
    </div>;
}