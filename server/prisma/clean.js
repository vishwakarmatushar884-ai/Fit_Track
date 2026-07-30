import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database: Removing all demo & test records...');

  // Delete all records in cascading order
  await prisma.notificationSettings.deleteMany({});
  await prisma.journal.deleteMany({});
  await prisma.progressPhoto.deleteMany({});
  await prisma.goal.deleteMany({});
  await prisma.sleepRecord.deleteMany({});
  await prisma.habit.deleteMany({});
  await prisma.weightRecord.deleteMany({});
  await prisma.waterIntake.deleteMany({});
  await prisma.dietNote.deleteMany({});
  await prisma.workoutSession.deleteMany({});
  await prisma.exercise.deleteMany({});
  await prisma.workout.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned successfully! Zero demo data remaining.');
  console.log('FitTrack is now 100% ready for real user registration.');
}

main()
  .catch((e) => {
    console.error('Database clean error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
