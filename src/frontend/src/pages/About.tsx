import { Globe2, Heart, MessageCircle, Users } from "lucide-react";
import { motion } from "motion/react";

const values = [
  {
    icon: Globe2,
    title: "Global Community",
    description:
      "We believe that every person deserves to experience the richness of different cultures and perspectives from around the world.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Heart,
    title: "Genuine Connection",
    description:
      "Real friendships transcend borders. We make it simple to connect with kind, curious, and open-minded people everywhere.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Diverse Voices",
    description:
      "From Tokyo to Nairobi, São Paulo to Oslo — every culture has something beautiful to share. Celebrate diversity.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
  {
    icon: MessageCircle,
    title: "Meaningful Dialogue",
    description:
      "Language is no barrier when hearts are open. Start a conversation, share your story, learn from theirs.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
];

const team = [
  {
    name: "Amara Diallo",
    role: "Community Lead",
    country: "Senegal",
    emoji: "🇸🇳",
    initials: "AD",
    bio: "Passionate about bridging African and global communities through technology and storytelling.",
  },
  {
    name: "Yuki Tanaka",
    role: "Product Designer",
    country: "Japan",
    emoji: "🇯🇵",
    initials: "YT",
    bio: "Designing beautiful experiences that make cross-cultural connection feel natural and joyful.",
  },
  {
    name: "Carlos Mendoza",
    role: "Engineering",
    country: "Mexico",
    emoji: "🇲🇽",
    initials: "CM",
    bio: "Building the infrastructure that keeps our global community safe, fast, and growing.",
  },
];

export function About() {
  return (
    <main>
      {/* Hero */}
      <section className="gradient-mesh py-16 border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-6xl mb-6 block">🌍</span>
            <h1 className="text-5xl font-display font-bold text-foreground mb-4">
              Our Mission
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              World Mosaic was born from a simple belief: that the world becomes
              a better place when people across different countries, cultures,
              and languages genuinely connect with one another.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="container max-w-3xl mx-auto px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-display font-bold text-foreground mb-6">
            Why we built this
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              In a world that often feels divided, we noticed something quietly
              beautiful: when people from different countries actually talk to
              each other, share meals (even virtually), swap music
              recommendations, or simply say "good morning" in each other's
              language — walls come down.
            </p>
            <p>
              World Mosaic is our contribution to that quiet revolution. It's a
              directory of real people who have raised their hand and said:{" "}
              <em>"I'm open. I want to know the world."</em>
            </p>
            <p>
              Whether you're a student wanting a pen pal in a country you've
              always dreamed of visiting, a professional seeking colleagues with
              global perspectives, or simply someone who believes in the power
              of human connection — you belong here.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-14">
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div
                  className={`w-12 h-12 ${v.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <v.icon className={`w-6 h-6 ${v.color}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container max-w-4xl mx-auto px-4 py-14 pb-20">
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
          Meet the team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-xl font-display font-bold text-primary mx-auto mb-3">
                {member.initials}
              </div>
              <h3 className="font-display font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="text-sm text-primary font-medium mt-0.5">
                {member.role}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {member.emoji} {member.country}
              </p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
