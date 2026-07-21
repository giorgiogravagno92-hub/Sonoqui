"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProposal = exports.updateProposal = exports.getProposals = exports.createProposal = exports.updateCompanyProfile = exports.requestInterview = exports.getFavorites = exports.toggleFavorite = exports.getWorkerDetails = exports.updateProfile = exports.getProfile = exports.searchWorkers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const searchWorkers = async (req, res) => {
    try {
        const { profession, city, province, region, availabilityStatus, skills, hasLicense, hasCar, desiredContract, educationLevel, educationField } = req.query;
        const whereClause = {};
        if (availabilityStatus) {
            // Map legacy status to the new DISPONIBILE_PROPOSTE
            const statusToQuery = (availabilityStatus === 'DISPONIBILE_SUBITO' || availabilityStatus === 'VALUTO_OFFERTE' || availabilityStatus === 'DISPONIBILE_PROPOSTE')
                ? 'DISPONIBILE_PROPOSTE'
                : availabilityStatus;
            whereClause.availabilityStatus = { equals: statusToQuery };
        }
        else {
            // By default, only search for candidates who have not explicitly set "NON_DISPONIBILE"
            whereClause.availabilityStatus = { not: 'NON_DISPONIBILE' };
        }
        if (hasLicense === 'true') {
            whereClause.hasLicense = true;
        }
        if (hasCar === 'true') {
            whereClause.hasCar = true;
        }
        let workers = await prisma.workerProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });
        // In-memory filters for advanced regions/provinces, contracts, multiple educations, and multiple professions
        if (profession || region || province || city || desiredContract || educationLevel || educationField) {
            workers = workers.filter(worker => {
                // 0. Profession Match
                if (profession) {
                    const searchProf = String(profession).toLowerCase().trim();
                    const primaryMatch = worker.profession.toLowerCase().includes(searchProf);
                    let rolesMatch = false;
                    try {
                        const parsedRoles = JSON.parse(worker.availabilityRoles || '[]');
                        rolesMatch = parsedRoles.some((r) => r.toLowerCase().includes(searchProf));
                    }
                    catch (e) {
                        rolesMatch = false;
                    }
                    if (!primaryMatch && !rolesMatch) {
                        return false;
                    }
                }
                // 1. Region / Province / City Match
                let geoMatch = true;
                let preferredRegions = [];
                try {
                    preferredRegions = JSON.parse(worker.availabilityRegionsProvinces || '[]');
                }
                catch (e) {
                    preferredRegions = [];
                }
                // If the candidate has selected specific regions/provinces
                if (preferredRegions.length > 0) {
                    let matchesGeo = false;
                    // Check if "Tutte le regioni" is selected
                    const hasAllRegions = preferredRegions.some((r) => r.region === 'Tutte le regioni');
                    if (hasAllRegions) {
                        matchesGeo = true;
                    }
                    else {
                        // Check specific region/province
                        for (const r of preferredRegions) {
                            const regionName = r.region.toLowerCase();
                            // If searching region
                            if (region && regionName.includes(String(region).toLowerCase())) {
                                matchesGeo = true;
                                break;
                            }
                            // If searching province
                            if (province) {
                                const searchProv = String(province).toUpperCase().trim();
                                const provincesList = r.provinces || [];
                                const hasAllProvinces = provincesList.some((p) => p.name === 'Tutte le province');
                                if (hasAllProvinces) {
                                    matchesGeo = true;
                                    break;
                                }
                                const provinceMatch = provincesList.some((p) => {
                                    const pName = p.name.toUpperCase().trim();
                                    // Match by name or sigla (e.g. "RM", "ROMA")
                                    return pName.includes(searchProv) || searchProv.includes(pName);
                                });
                                if (provinceMatch) {
                                    matchesGeo = true;
                                    break;
                                }
                            }
                            // If searching city
                            if (city && worker.city.toLowerCase().includes(String(city).toLowerCase())) {
                                matchesGeo = true;
                                break;
                            }
                        }
                    }
                    if (!matchesGeo) {
                        geoMatch = false;
                    }
                }
                else {
                    // Fallback to candidate's home address
                    if (region && !worker.region.toLowerCase().includes(String(region).toLowerCase())) {
                        geoMatch = false;
                    }
                    if (province) {
                        const wProv = worker.province.toUpperCase().trim();
                        const sProv = String(province).toUpperCase().trim();
                        if (!wProv.includes(sProv) && !sProv.includes(wProv)) {
                            geoMatch = false;
                        }
                    }
                    if (city && !worker.city.toLowerCase().includes(String(city).toLowerCase())) {
                        geoMatch = false;
                    }
                }
                if (!geoMatch)
                    return false;
                // 2. Contract Match
                if (desiredContract) {
                    let preferredContracts = [];
                    try {
                        preferredContracts = JSON.parse(worker.availabilityContracts || '[]');
                    }
                    catch (e) {
                        preferredContracts = [];
                    }
                    if (preferredContracts.length > 0) {
                        // Check if "Nessuna preferenza" or candidate's list includes the desired contract
                        const hasNoPref = preferredContracts.includes('Nessuna preferenza') || preferredContracts.includes('NESSUNA_PREFERENZA');
                        const searchContractNorm = String(desiredContract).toUpperCase().replace('_', '').replace('-', '');
                        const matchContract = preferredContracts.some((c) => {
                            const cNorm = c.toUpperCase().replace('_', '').replace('-', '');
                            return cNorm.includes(searchContractNorm) || searchContractNorm.includes(cNorm);
                        });
                        if (!hasNoPref && !matchContract) {
                            return false;
                        }
                    }
                    else {
                        // Fallback to legacy desiredContract field
                        if (worker.desiredContract) {
                            const wNorm = worker.desiredContract.toUpperCase().replace('_', '').replace('-', '');
                            const sNorm = String(desiredContract).toUpperCase().replace('_', '').replace('-', '');
                            if (!wNorm.includes(sNorm) && !sNorm.includes(wNorm)) {
                                return false;
                            }
                        }
                    }
                }
                // 3. Education Match
                if (educationLevel) {
                    const isLaureaLevel = (lvl) => {
                        return lvl === 'LAUREA' || lvl === 'LAUREA_TRIENNALE' || lvl === 'LAUREA_SPECIALISTICA' || lvl === 'LAUREA_MAGISTRALE';
                    };
                    let hasEduLevel = false;
                    if (educationLevel === 'LAUREA') {
                        hasEduLevel = isLaureaLevel(worker.educationLevel);
                    }
                    else {
                        hasEduLevel = worker.educationLevel === educationLevel;
                    }
                    let preferredEducations = [];
                    try {
                        preferredEducations = JSON.parse(worker.educationTitles || '[]');
                    }
                    catch (e) { }
                    if (preferredEducations.length > 0) {
                        hasEduLevel = hasEduLevel || preferredEducations.some((e) => {
                            if (educationLevel === 'LAUREA') {
                                return isLaureaLevel(e.level);
                            }
                            return e.level === educationLevel;
                        });
                    }
                    if (!hasEduLevel) {
                        return false;
                    }
                }
                if (educationField) {
                    let hasEduField = worker.educationField && worker.educationField.toLowerCase().includes(String(educationField).toLowerCase());
                    let preferredEducations = [];
                    try {
                        preferredEducations = JSON.parse(worker.educationTitles || '[]');
                    }
                    catch (e) { }
                    if (preferredEducations.length > 0) {
                        hasEduField = hasEduField || preferredEducations.some((e) => e.field && e.field.toLowerCase().includes(String(educationField).toLowerCase()));
                    }
                    if (!hasEduField) {
                        return false;
                    }
                }
                return true;
            });
        }
        // Client-side filtering for skills if specified
        if (skills) {
            const searchSkills = String(skills)
                .split(',')
                .map((s) => s.trim().toLowerCase())
                .filter(Boolean);
            if (searchSkills.length > 0) {
                workers = workers.filter((worker) => {
                    try {
                        const parsed = JSON.parse(worker.skills);
                        const workerSkillsList = [];
                        if (parsed.computerSkills) {
                            workerSkillsList.push(...Object.keys(parsed.computerSkills));
                        }
                        if (parsed.organizationalSkills) {
                            workerSkillsList.push(...Object.keys(parsed.organizationalSkills));
                        }
                        return searchSkills.some((skill) => workerSkillsList.some(ws => ws.toLowerCase().includes(skill)));
                    }
                    catch (e) {
                        const workerSkills = worker.skills
                            .toLowerCase()
                            .split(',')
                            .map((s) => s.trim());
                        return searchSkills.some((skill) => workerSkills.includes(skill) || workerSkills.some(ws => ws.includes(skill)));
                    }
                });
            }
        }
        res.json(workers);
    }
    catch (error) {
        console.error('Error during candidate search:', error);
        res.status(500).json({ error: 'Error processing search' });
    }
};
exports.searchWorkers = searchWorkers;
const getProfile = async (req, res) => {
    try {
        const profile = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { companyType, companyName, address, vatNumber, firstName, lastName, residenzaCapCitta, fiscalCode, industry, city, contactPerson, contactPhone, logoUrl } = req.body;
        const profile = await prisma.companyProfile.update({
            where: { userId: req.user.id },
            data: {
                companyType,
                companyName,
                address,
                vatNumber,
                firstName,
                lastName,
                residenzaCapCitta,
                fiscalCode,
                industry,
                city: companyType === 'AZIENDA' ? city : residenzaCapCitta,
                contactPerson: companyType === 'AZIENDA' ? contactPerson : `${firstName} ${lastName}`,
                contactPhone,
                logoUrl
            }
        });
        res.json(profile);
    }
    catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
const getWorkerDetails = async (req, res) => {
    try {
        const { id } = req.params; // worker profile ID
        const worker = await prisma.workerProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { email: true }
                },
                workExperiences: true
            }
        });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        // Get company profile to customize notification
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        const companyName = company ? company.companyName : "Un'azienda";
        // Simulate push notification by saving it to the worker's database notifications table
        await prisma.notification.create({
            data: {
                userId: worker.userId,
                title: 'Profilo Visualizzato',
                message: `${companyName} ha appena visualizzato il tuo profilo.`,
                type: 'PROFILE_VIEW'
            }
        });
        res.json(worker);
    }
    catch (error) {
        console.error('Error fetching worker details:', error);
        res.status(500).json({ error: 'Error fetching details' });
    }
};
exports.getWorkerDetails = getWorkerDetails;
const toggleFavorite = async (req, res) => {
    try {
        const { workerId } = req.body;
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                companyId_workerId: {
                    companyId: company.id,
                    workerId
                }
            }
        });
        if (existingFavorite) {
            // Remove favorite
            await prisma.favorite.delete({
                where: { id: existingFavorite.id }
            });
            res.json({ favorited: false });
        }
        else {
            // Add favorite
            await prisma.favorite.create({
                data: {
                    companyId: company.id,
                    workerId
                }
            });
            res.json({ favorited: true });
        }
    }
    catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: 'Error toggling favorite' });
    }
};
exports.toggleFavorite = toggleFavorite;
const getFavorites = async (req, res) => {
    try {
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        const favorites = await prisma.favorite.findMany({
            where: { companyId: company.id },
            include: {
                worker: true
            }
        });
        res.json(favorites.map(f => f.worker));
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching favorites' });
    }
};
exports.getFavorites = getFavorites;
const requestInterview = async (req, res) => {
    try {
        const { workerId, message, date } = req.body;
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        const worker = await prisma.workerProfile.findUnique({
            where: { id: workerId }
        });
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        const companyName = company.companyName || `${company.firstName} ${company.lastName}` || "Un'azienda";
        const interviewRequest = await prisma.interviewRequest.create({
            data: {
                companyId: company.id,
                workerId,
                message,
                interviewDate: date || new Date().toLocaleDateString('it-IT'),
                status: 'PENDING'
            }
        });
        // Notify the worker
        await prisma.notification.create({
            data: {
                userId: worker.userId,
                title: 'Proposta Iniziale',
                message: `${companyName} ti ha inviato una proposta iniziale.`,
                type: 'INTERVIEW_REQUEST'
            }
        });
        res.json({ success: true, request: interviewRequest });
    }
    catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ error: 'Error creating interview request' });
    }
};
exports.requestInterview = requestInterview;
const updateCompanyProfile = async (req, res) => {
    try {
        const { companyType, companyName, address, vatNumber, firstName, lastName, residenzaCapCitta, fiscalCode, industry, city, contactPerson, contactPhone } = req.body;
        const company = await prisma.companyProfile.update({
            where: { userId: req.user.id },
            data: {
                companyType,
                companyName,
                address,
                vatNumber,
                firstName,
                lastName,
                residenzaCapCitta,
                fiscalCode,
                industry,
                city,
                contactPerson,
                contactPhone
            }
        });
        res.json(company);
    }
    catch (error) {
        console.error('Error updating company profile:', error);
        res.status(500).json({ error: 'Error updating company profile' });
    }
};
exports.updateCompanyProfile = updateCompanyProfile;
const createProposal = async (req, res) => {
    try {
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        const { professions, locations, educationTitle, hasLicense, hasCar, minSalary, maxSalary, notes, status } = req.body;
        const profsArr = typeof professions === 'object' ? professions : JSON.parse(professions || '[]');
        const locsArr = typeof locations === 'object' ? locations : JSON.parse(locations || '[]');
        const proposalStatus = status === 'DRAFT' ? 'DRAFT' : 'ACTIVE';
        const proposal = await prisma.jobProposal.create({
            data: {
                companyId: company.id,
                professions: JSON.stringify(profsArr),
                locations: JSON.stringify(locsArr),
                educationTitle: educationTitle || 'Nessuna preferenza',
                hasLicense: Boolean(hasLicense),
                hasCar: Boolean(hasCar),
                minSalary: minSalary || '',
                maxSalary: maxSalary || '',
                notes: notes || '',
                status: proposalStatus
            }
        });
        res.json(proposal);
    }
    catch (error) {
        console.error('Error creating proposal:', error);
        res.status(500).json({ error: 'Error creating job proposal' });
    }
};
exports.createProposal = createProposal;
const getProposals = async (req, res) => {
    try {
        const company = await prisma.companyProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!company) {
            return res.status(404).json({ error: 'Company profile not found' });
        }
        const proposals = await prisma.jobProposal.findMany({
            where: { companyId: company.id },
            include: {
                company: true,
                responses: {
                    include: {
                        worker: {
                            include: {
                                workExperiences: true,
                                user: {
                                    select: { email: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(proposals);
    }
    catch (error) {
        console.error('Error fetching proposals:', error);
        res.status(500).json({ error: 'Error fetching job proposals' });
    }
};
exports.getProposals = getProposals;
const updateProposal = async (req, res) => {
    try {
        const { id } = req.params;
        const { professions, locations, educationTitle, hasLicense, hasCar, minSalary, maxSalary, notes, status } = req.body;
        const profsArr = typeof professions === 'object' ? professions : JSON.parse(professions || '[]');
        const locsArr = typeof locations === 'object' ? locations : JSON.parse(locations || '[]');
        const updateData = {
            professions: JSON.stringify(profsArr),
            locations: JSON.stringify(locsArr),
            educationTitle: educationTitle || 'Nessuna preferenza',
            hasLicense: Boolean(hasLicense),
            hasCar: Boolean(hasCar),
            minSalary: minSalary || '',
            maxSalary: maxSalary || '',
            notes: notes || ''
        };
        if (status) {
            updateData.status = status;
        }
        const proposal = await prisma.jobProposal.update({
            where: { id },
            data: updateData,
            include: {
                company: true,
                responses: {
                    include: {
                        worker: {
                            include: {
                                workExperiences: true
                            }
                        }
                    }
                }
            }
        });
        res.json(proposal);
    }
    catch (error) {
        console.error('Error updating proposal:', error);
        res.status(500).json({ error: 'Error updating job proposal' });
    }
};
exports.updateProposal = updateProposal;
const deleteProposal = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.jobProposal.delete({
            where: { id }
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error deleting proposal:', error);
        res.status(500).json({ error: 'Error deleting proposal' });
    }
};
exports.deleteProposal = deleteProposal;
