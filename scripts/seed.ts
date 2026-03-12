import { prisma } from "../src/config/database";

async function main(): Promise<void> {
  console.log("🌱 Seeding database...");
  // TODO: inserir dados iniciais
  await prisma.$disconnect();
}

main().catch(console.error);
