import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();
const defaultAdminEmail =
  process.env.ADMIN_EMAIL || "admin@nigeriavideotranslator.local";
const defaultAdminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

const churches = [
  {
    churchName: "Christ Embassy Lagos",
    slug: "christ-embassy-lagos",
    country: "Nigeria",
    youtubeLiveUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "United Kingdom", "United States"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Yoruba", "Igbo", "Hausa"],
    status: "Active",
  },
  {
    churchName: "RCCG Abuja",
    slug: "rccg-abuja",
    country: "Nigeria",
    youtubeLiveUrl: "https://www.youtube.com/live/jfKfPfyJRdk",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "Canada", "United Kingdom"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Hausa", "Tiv", "Idoma"],
    status: "Active",
  },
  {
    churchName: "Winners Chapel Port Harcourt",
    slug: "winners-chapel-port-harcourt",
    country: "Nigeria",
    youtubeLiveUrl: "https://youtu.be/21X5lGlDOfg",
    defaultSpokenLanguage: "English",
    enabledTranslationCountries: ["Nigeria", "Ghana", "South Africa"],
    enabledLanguages: ["English", "Nigerian Pidgin", "Igbo", "Edo", "Urhobo"],
    status: "Inactive",
  },
];

async function main() {
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "ADMIN_PASSWORD is not set. Using the local fallback password. Do not use this password in production.",
    );
  }

  const passwordHash = await hashPassword(defaultAdminPassword);

  await prisma.user.upsert({
    where: { email: defaultAdminEmail },
    update: {
      name: "Demo Admin",
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: defaultAdminEmail,
      name: "Demo Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const church of churches) {
    await prisma.church.upsert({
      where: { slug: church.slug },
      update: {
        churchName: church.churchName,
        country: church.country,
        youtubeLiveUrl: church.youtubeLiveUrl,
        defaultSpokenLanguage: church.defaultSpokenLanguage,
        status: church.status,
        languages: {
          deleteMany: {},
          create: church.enabledLanguages.map((language) => ({ language })),
        },
        countries: {
          deleteMany: {},
          create: church.enabledTranslationCountries.map((country) => ({ country })),
        },
      },
      create: {
        churchName: church.churchName,
        slug: church.slug,
        country: church.country,
        youtubeLiveUrl: church.youtubeLiveUrl,
        defaultSpokenLanguage: church.defaultSpokenLanguage,
        status: church.status,
        languages: {
          create: church.enabledLanguages.map((language) => ({ language })),
        },
        countries: {
          create: church.enabledTranslationCountries.map((country) => ({ country })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
