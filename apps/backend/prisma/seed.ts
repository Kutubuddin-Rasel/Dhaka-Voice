import { PrismaClient, CityCorporation } from '../generated/prisma';

const prisma = new PrismaClient();

const THANAS: string[] = [
  'Adabor', 'Airport', 'Badda', 'Banani', 'Bangshal', 'Bhashantek', 'Cantonment', 'Chawkbazar', 'Dakshinkhan', 'Darussalam', 'Demra', 'Dhanmondi', 'Gandaria', 'Gulshan', 'Hatirjheel', 'Hazaribagh', 'Jatrabari', 'Kadamtali', 'Kafrul', 'Kalabagan', 'Kamrangirchar', 'Khilgaon', 'Khilkhet', 'Kotwali', 'Lalbagh', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Mugda', 'New Market', 'Pallabi', 'Paltan', 'Ramna', 'Rampura', 'Rupnagar', 'Sabujbagh', 'Shah Ali', 'Shahbagh', 'Shahjahanpur', 'Sher-e-Bangla Nagar', 'Shyampur', 'Sutrapur', 'Tejgaon', 'Tejgaon Industrial Area', 'Turag', 'Uttara East', 'Uttara West', 'Uttar Khan', 'Vatara', 'Wari'
];

async function seedThanas() {
  for (const name of THANAS) {
    await prisma.thana.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedWards() {
  const dncc = Array.from({ length: 54 }, (_, i) => i + 1);
  const dscc = Array.from({ length: 75 }, (_, i) => i + 1);
  for (const n of dncc) {
    await prisma.ward.upsert({
      where: { cityCorporation_wardNumber: { cityCorporation: CityCorporation.DNCC, wardNumber: n } },
      update: {},
      create: { cityCorporation: CityCorporation.DNCC, wardNumber: n },
    });
  }
  for (const n of dscc) {
    await prisma.ward.upsert({
      where: { cityCorporation_wardNumber: { cityCorporation: CityCorporation.DSCC, wardNumber: n } },
      update: {},
      create: { cityCorporation: CityCorporation.DSCC, wardNumber: n },
    });
  }
}

async function main() {
  await seedThanas();
  await seedWards();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


