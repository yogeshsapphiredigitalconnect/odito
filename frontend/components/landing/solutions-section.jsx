import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Code, Database, Cloud, Shield, Zap, Users, BarChart, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SolutionsSection() {
    return (
        <section id="solutions" className="bg-muted/30">
            <div className="pt-16 pb-16">
                <div className="mx-auto w-full max-w-7xl px-6">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                            Solutions
                        </Badge>
                        <h2 className="text-foreground max-w-3xl mx-auto text-balance text-4xl md:text-5xl font-semibold mb-6">
                            Tailored Solutions for Every Need
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-balance text-lg">
                            Comprehensive AI-powered solutions designed to accelerate development, optimize performance, and drive innovation across industries.
                        </p>
                    </div>

                    {/* Main Solutions Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                        {/* Enterprise Solution */}
                        <Card className="group overflow-hidden p-8 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-500/10 p-3 rounded-xl">
                                    <Users className="text-blue-500 size-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-foreground text-xl font-semibold mb-3">Enterprise Solutions</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Scale your development with enterprise-grade AI tools designed for large teams, complex projects, and mission-critical applications.
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Advanced security & compliance
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Team collaboration tools
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                            Custom AI model training
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        {/* Startup Solution */}
                        <Card className="group overflow-hidden p-8 hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-green-500/5 to-transparent">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-500/10 p-3 rounded-xl">
                                    <Zap className="text-green-500 size-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-foreground text-xl font-semibold mb-3">Startup Accelerator</h3>
                                    <p className="text-muted-foreground leading-relaxed mb-4">
                                        Launch faster with AI-powered development tools optimized for startups, MVPs, and rapid iteration cycles.
                                    </p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            Rapid prototyping tools
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            Cost-effective scaling
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                            24/7 developer support
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Industry Solutions */}
                    <div className="mb-16">
                        <h3 className="text-foreground text-2xl font-semibold text-center mb-8">Industry-Specific Solutions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SolutionCard
                                icon={Code}
                                title="Software Development"
                                description="AI-assisted coding, automated testing, and intelligent debugging for development teams."
                                features={["Code generation", "Bug detection", "Performance optimization"]}
                                color="purple"
                            />
                            <SolutionCard
                                icon={Database}
                                title="Data Analytics"
                                description="Transform raw data into actionable insights with AI-powered analytics and visualization."
                                features={["Data processing", "ML models", "Real-time analytics"]}
                                color="orange"
                            />
                            <SolutionCard
                                icon={Cloud}
                                title="Cloud Infrastructure"
                                description="Optimize cloud deployments with intelligent resource management and cost optimization."
                                features={["Auto-scaling", "Cost monitoring", "Security compliance"]}
                                color="blue"
                            />
                            <SolutionCard
                                icon={Shield}
                                title="Cybersecurity"
                                description="AI-driven threat detection, vulnerability assessment, and security automation."
                                features={["Threat detection", "Vulnerability scanning", "Security automation"]}
                                color="red"
                            />
                            <SolutionCard
                                icon={BarChart}
                                title="Financial Services"
                                description="Regulatory compliance, fraud detection, and algorithmic trading solutions."
                                features={["Risk assessment", "Fraud detection", "Compliance automation"]}
                                color="green"
                            />
                            <SolutionCard
                                icon={Smartphone}
                                title="Mobile Development"
                                description="Cross-platform app development with AI-assisted UI/UX optimization."
                                features={["Cross-platform", "UI optimization", "Performance tuning"]}
                                color="indigo"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function SolutionCard({ icon: Icon, title, description, features, color }) {
    const colorClasses = {
        purple: "bg-purple-500/10 text-purple-500",
        orange: "bg-orange-500/10 text-orange-500",
        blue: "bg-blue-500/10 text-blue-500",
        red: "bg-red-500/10 text-red-500",
        green: "bg-green-500/10 text-green-500",
        indigo: "bg-indigo-500/10 text-indigo-500"
    }

    return (
        <Card className="group overflow-hidden p-6 hover:scale-105 transition-all duration-300">
            <div className={cn("p-3 rounded-xl w-fit mb-4", colorClasses[color])}>
                <Icon className="size-6" />
            </div>
            <h4 className="text-foreground font-semibold mb-2">{title}</h4>
            <p className="text-muted-foreground text-sm mb-4">{description}</p>
            <ul className="space-y-1">
                {features.map((feature, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                        {feature}
                    </li>
                ))}
            </ul>
        </Card>
    )
}

function IntegrationItem({ name }) {
    return (
        <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-sm font-semibold text-muted-foreground">
                {name.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground">{name}</span>
        </div>
    )
}
