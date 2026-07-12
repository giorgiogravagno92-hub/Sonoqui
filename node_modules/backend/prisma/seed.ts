import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Hash common password
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sonoqui.it' },
    update: {},
    create: {
      email: 'admin@sonoqui.it',
      passwordHash,
      role: 'ADMIN'
    }
  });
  console.log('Created Admin:', admin.email);

  // 2. Create Company
  const companyUser = await prisma.user.upsert({
    where: { email: 'azienda@innovate.it' },
    update: {},
    create: {
      email: 'azienda@innovate.it',
      passwordHash,
      role: 'COMPANY'
    }
  });

  const companyProfile = await prisma.companyProfile.upsert({
    where: { userId: companyUser.id },
    update: {},
    create: {
      userId: companyUser.id,
      companyName: 'Innovate Tech S.p.A.',
      industry: 'Tecnologia & Software',
      city: 'Milano',
      contactPerson: 'Ing. Alessandro Bianchi',
      contactPhone: '+39 02 1234567',
      logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150&auto=format&fit=crop&q=60'
    }
  });
  console.log('Created Company:', companyProfile.companyName);

  // 3. Create Workers
  const workersData = [
    {
      email: 'mario.rossi@email.it',
      firstName: 'Mario',
      lastName: 'Rossi',
      profession: 'Elettricista',
      specialization: 'Impianti Civili e Industriali',
      city: 'Roma',
      province: 'RM',
      region: 'Lazio',
      experienceYears: 8,
      educationLevel: 'DIPLOMA',
      educationField: 'Istituto Tecnico Elettronico',
      skills: 'Domotica, Cablaggio, Quadri Elettrici, Ricerca Guasti, Certificazioni di Conformità',
      certifications: 'Abilitazione PES/PAV, Certificazione FGAS',
      hasLicense: true,
      hasCar: true,
      availabilityStatus: 'DISPONIBILE_SUBITO',
      maxDistanceKm: 40,
      desiredContract: 'TEMPO_INDETERMINATO',
      desiredSalary: '€1.800 - €2.200 netti/mese',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60'
    },
    {
      email: 'luigi.verdi@email.it',
      firstName: 'Luigi',
      lastName: 'Verdi',
      profession: 'Sviluppatore Web',
      specialization: 'Frontend Specialist (React)',
      city: 'Milano',
      province: 'MI',
      region: 'Lombardia',
      experienceYears: 3,
      educationLevel: 'LAUREA',
      educationField: 'Ingegneria Informatica',
      skills: 'JavaScript, TypeScript, React, HTML5, CSS3, Vite, Git, Tailwind CSS',
      certifications: 'React Developer Certification (Meta)',
      hasLicense: true,
      hasCar: false,
      availabilityStatus: 'VALUTO_OFFERTE',
      maxDistanceKm: 30,
      desiredContract: 'TEMPO_INDETERMINATO',
      desiredSalary: 'RAL €35.000',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60'
    },
    {
      email: 'elena.bianchi@email.it',
      firstName: 'Elena',
      lastName: 'Bianchi',
      profession: 'Addetta Vendite',
      specialization: 'Abbigliamento e Retail',
      city: 'Torino',
      province: 'TO',
      region: 'Piemonte',
      experienceYears: 2,
      educationLevel: 'DIPLOMA',
      educationField: 'Liceo delle Scienze Umane',
      skills: 'Assistenza Clienti, Visual Merchandising, Gestione Cassa, Inventario, Problem Solving',
      certifications: 'Corso di Tecniche di Vendita Avanzate',
      hasLicense: true,
      hasCar: true,
      availabilityStatus: 'DISPONIBILE_SUBITO',
      maxDistanceKm: 25,
      desiredContract: 'PART_TIME',
      desiredSalary: '€1.000 - €1.200/mese',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60'
    },
    {
      email: 'giovanni.neri@email.it',
      firstName: 'Giovanni',
      lastName: 'Neri',
      profession: 'Magazziniere',
      specialization: 'Logistica e Spedizioni',
      city: 'Roma',
      province: 'RM',
      region: 'Lazio',
      experienceYears: 5,
      educationLevel: 'LICENZA_MEDIA',
      educationField: '',
      skills: 'Uso Carrello Elevatore, Gestione Inventario, Preparazione Ordini, Lettore Barcode',
      certifications: 'Patentino Muletto in corso di validità',
      hasLicense: true,
      hasCar: true,
      availabilityStatus: 'NON_DISPONIBILE',
      maxDistanceKm: 50,
      desiredContract: 'TEMPO_INDETERMINATO',
      desiredSalary: '€1.400/mese',
      photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60'
    },
    {
      email: 'sofia.viola@email.it',
      firstName: 'Sofia',
      lastName: 'Viola',
      profession: 'Infermiera',
      specialization: 'Assistenza Domiciliare e Geriatria',
      city: 'Napoli',
      province: 'NA',
      region: 'Campania',
      experienceYears: 6,
      educationLevel: 'LAUREA',
      educationField: 'Infermieristica',
      skills: 'Primo Soccorso, Medicazioni Complesse, Terapia Farmacologica, Empatia, Gestione Emergenze',
      certifications: 'Laurea in Infermieristica, Iscrizione OPI, BLSD',
      hasLicense: true,
      hasCar: true,
      availabilityStatus: 'DISPONIBILE_SUBITO',
      maxDistanceKm: 60,
      desiredContract: 'COLLABORAZIONE',
      desiredSalary: '€25/ora',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
    }
  ];

  for (const data of workersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        passwordHash,
        role: 'WORKER'
      }
    });

    const profile = await prisma.workerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        profession: data.profession,
        specialization: data.specialization,
        city: data.city,
        province: data.province,
        region: data.region,
        experienceYears: data.experienceYears,
        educationLevel: data.educationLevel,
        educationField: data.educationField,
        skills: data.skills,
        certifications: data.certifications,
        hasLicense: data.hasLicense,
        hasCar: data.hasCar,
        availabilityStatus: data.availabilityStatus,
        maxDistanceKm: data.maxDistanceKm,
        desiredContract: data.desiredContract,
        desiredSalary: data.desiredSalary,
        photoUrl: data.photoUrl
      }
    });
    console.log(`Created Worker profile for: ${profile.firstName} ${profile.lastName}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
