import { BookOpen, Church, Mic2, Users } from "lucide-react";

const useCases = [
  "Churches",
  "Schools",
  "Conferences",
  "Families",
  "Community events",
  "Educational content",
];

export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#06110d] text-white">
      <section className="section-shell py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
            About
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            Helping people understand video content in sermon languages
          </h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50/76">
            SermonBridge is a free public platform for making video
            content easier to understand across Yoruba, Igbo, Hausa, and Nigerian
            Pidgin. It helps turn spoken video content into translated text,
            subtitles, and a separate translated voice-over.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <InfoCard
            icon={<BookOpen className="h-8 w-8" />}
            title="Educational access"
            description="Support lessons, trainings, and public learning materials with language-friendly outputs."
          />
          <InfoCard
            icon={<Mic2 className="h-8 w-8" />}
            title="Clear communication"
            description="Give viewers text, subtitles, and a separate translated voice-over to follow the message."
          />
          <InfoCard
            icon={<Users className="h-8 w-8" />}
            title="Community use"
            description="Useful for people sharing recorded talks, events, services, family content, and community updates."
          />
        </div>

        <section className="mt-14 rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
          <div className="flex items-center gap-3 text-emerald-300">
            <Church className="h-7 w-7" />
            <h2 className="text-2xl font-semibold text-white">Use cases</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {useCases.map((item) => (
              <div
                key={item}
                className="rounded-md border border-emerald-300/14 bg-[#07140f] px-4 py-3 font-medium text-emerald-50"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-lg border border-emerald-300/16 bg-white/[0.045] p-6">
      <div className="text-emerald-300">{icon}</div>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-emerald-50/72">{description}</p>
    </article>
  );
}


