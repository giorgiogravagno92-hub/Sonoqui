const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('--- TEST FILTRI DATABASE (SQLITE) ---');

  try {
    // 1. Contiamo i candidati complessivi
    const totalWorkers = await prisma.workerProfile.count();
    console.log(`Numero totale di candidati nel database: ${totalWorkers}`);

    // 2. Filtro Città
    console.log('\nFiltro Città: "Roma"');
    const romaWorkers = await prisma.workerProfile.findMany({
      where: { city: { contains: 'Roma' } }
    });
    console.log(`Risultati: Trovati ${romaWorkers.length} lavoratori a Roma.`);
    romaWorkers.forEach(w => console.log(` - ${w.firstName} ${w.lastName} (${w.profession})`));

    // 3. Filtro Disponibilità
    console.log('\nFiltro Disponibilità: "DISPONIBILE_SUBITO"');
    const availableWorkers = await prisma.workerProfile.findMany({
      where: { availabilityStatus: 'DISPONIBILE_SUBITO' }
    });
    console.log(`Risultati: Trovati ${availableWorkers.length} lavoratori subito disponibili.`);
    availableWorkers.forEach(w => console.log(` - ${w.firstName} ${w.lastName} (${w.profession}): ${w.availabilityStatus}`));

    // 4. Filtro Competenze
    console.log('\nFiltro Competenze: Contiene "React"');
    const allWorkers = await prisma.workerProfile.findMany();
    const reactWorkers = allWorkers.filter(w => {
      const skills = w.skills.toLowerCase().split(',').map(s => s.trim());
      return skills.includes('react') || skills.some(s => s.includes('react'));
    });
    console.log(`Risultati: Trovati ${reactWorkers.length} lavoratori con competenze React.`);
    reactWorkers.forEach(w => console.log(` - ${w.firstName} ${w.lastName} (Competenze: ${w.skills})`));

    console.log('\n--- FINE TEST FILTRI ---');
  } catch (error) {
    console.error('Errore nei test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
