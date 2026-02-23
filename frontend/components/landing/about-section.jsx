import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Users, Target, Award, Lightbulb, Globe, Heart, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AboutSection() {
    return (
        <section id="about" className="bg-background">
            <div className="pt-16 pb-16">
                <div className="mx-auto w-full max-w-7xl px-6">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                            About Odito AI
                        </Badge>
                        <h2 className="text-foreground max-w-3xl mx-auto text-balance text-4xl md:text-5xl font-semibold mb-6">
                            Transforming Ideas into Intelligent Solutions
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-balance text-lg">
                            We're on a mission to democratize AI development, making cutting-edge technology accessible to developers and businesses worldwide.
                        </p>
                    </div>

                    {/* Mission & Values Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                        {/* Mission Card */}
                        <Card className="group overflow-hidden p-8 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl">
                                    <Target className="text-primary size-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-foreground text-xl font-semibold mb-3">Our Mission</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        To empower developers with AI-driven tools that accelerate innovation, reduce complexity, and enable the creation of intelligent applications that solve real-world problems.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Vision Card */}
                        <Card className="group overflow-hidden p-8 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-500/10 p-3 rounded-xl">
                                    <Lightbulb className="text-purple-500 size-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-foreground text-xl font-semibold mb-3">Our Vision</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        A future where AI seamlessly integrates into every development workflow, enabling creators to build smarter, faster, and more impactful digital experiences.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Core Values */}
                    <div className="mb-16">
                        <h3 className="text-foreground text-2xl font-semibold text-center mb-8">Core Values</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <ValueCard
                                icon={Users}
                                title="Community First"
                                description="Building a supportive ecosystem where developers learn, share, and grow together."
                                color="blue"
                            />
                            <ValueCard
                                icon={Shield}
                                title="Trust & Security"
                                description="Ensuring your code and data remain protected with enterprise-grade security."
                                color="green"
                            />
                            <ValueCard
                                icon={Award}
                                title="Excellence"
                                description="Delivering premium quality tools that exceed expectations and drive results."
                                color="orange"
                            />
                            <ValueCard
                                icon={Heart}
                                title="Passion"
                                description="Driven by our love for innovation and commitment to developer success."
                                color="red"
                            />
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="bg-muted/30 rounded-3xl p-8 mb-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <StatCard number="10K+" label="Developers" description="Trusted by developers worldwide" />
                            <StatCard number="1M+" label="Lines of Code" description="Generated and optimized" />
                            <StatCard number="99.9%" label="Uptime" description="Reliable service you can count on" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function ValueCard({ icon: Icon, title, description, color }) {
    const colorClasses = {
        blue: "bg-blue-500/10 text-blue-500",
        green: "bg-green-500/10 text-green-500", 
        orange: "bg-orange-500/10 text-orange-500",
        red: "bg-red-500/10 text-red-500"
    }

    return (
        <Card className="group overflow-hidden p-6 hover:scale-105 transition-all duration-300 text-center">
            <div className={cn("p-3 rounded-xl w-fit mx-auto mb-4", colorClasses[color])}>
                <Icon className="size-6" />
            </div>
            <h4 className="text-foreground font-semibold mb-2">{title}</h4>
            <p className="text-muted-foreground text-sm">{description}</p>
        </Card>
    )
}

function StatCard({ number, label, description }) {
    return (
        <div>
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{number}</div>
            <div className="text-foreground font-semibold mb-1">{label}</div>
            <div className="text-muted-foreground text-sm">{description}</div>
        </div>
    )
}
