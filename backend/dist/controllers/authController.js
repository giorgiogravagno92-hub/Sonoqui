"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLoginSimulation = exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'sono-qui-secret-key-12345';
const register = async (req, res) => {
    try {
        const { email, password, role, profileData } = req.body;
        if (!email || !password || !role) {
            return res.status(404).json({ error: 'Email, password and role are required' });
        }
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'La password deve contenere almeno 8 caratteri, una lettera maiuscola, un numero e un simbolo.' });
        }
        if (!['WORKER', 'COMPANY', 'ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user and profile transactionally
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    role
                }
            });
            if (role === 'WORKER') {
                const wp = await tx.workerProfile.create({
                    data: {
                        userId: newUser.id,
                        firstName: profileData?.firstName || 'Nuovo',
                        lastName: profileData?.lastName || 'Candidato',
                        city: profileData?.city || '',
                        province: profileData?.province || '',
                        sigla: profileData?.sigla || '',
                        region: profileData?.region || '',
                        profession: profileData?.profession || '',
                        skills: profileData?.skills || 'Nessuna',
                        educationLevel: profileData?.educationLevel || 'NESSUNO',
                        educationTitles: profileData?.educationTitles || '[]',
                        availabilityStatus: 'VALUTO_OFFERTE',
                        desiredContract: profileData?.desiredContract || 'TEMPO_INDETERMINATO'
                    }
                });
                if (Array.isArray(profileData?.workExperiences)) {
                    for (const exp of profileData.workExperiences) {
                        await tx.workExperience.create({
                            data: {
                                workerProfileId: wp.id,
                                companyName: exp.companyName,
                                role: exp.role,
                                startDate: exp.startDate,
                                endDate: exp.endDate || null,
                                description: exp.description || '',
                                city: exp.city || null,
                                province: exp.province || null,
                                sigla: exp.sigla || null
                            }
                        });
                    }
                }
            }
            else if (role === 'COMPANY') {
                await tx.companyProfile.create({
                    data: {
                        userId: newUser.id,
                        companyType: 'AZIENDA',
                        companyName: profileData?.companyName || 'Nuova Azienda',
                        address: profileData?.address || null,
                        city: profileData?.city || null,
                        province: profileData?.province || null,
                        sigla: profileData?.sigla || null,
                        industry: profileData?.sector || profileData?.industry || 'Altro',
                        contactPerson: profileData?.companyName || 'Referente',
                    }
                });
            }
            return newUser;
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                workerProfile: true,
                companyProfile: true
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.role === 'WORKER' ? user.workerProfile : user.companyProfile
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                workerProfile: true,
                companyProfile: true
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.role === 'WORKER' ? user.workerProfile : user.companyProfile
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.me = me;
const socialLoginSimulation = async (req, res) => {
    try {
        const { email, name, provider, role } = req.body; // provider: 'google' or 'apple'
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                workerProfile: true,
                companyProfile: true
            }
        });
        if (!user) {
            // Create user with simulated social password
            const passwordHash = await bcryptjs_1.default.hash(`social-login-${provider}-${Math.random()}`, 10);
            const parts = name ? name.split(' ') : ['Nuovo', 'Utente'];
            const firstName = parts[0];
            const lastName = parts.slice(1).join(' ') || 'Utente';
            user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        role
                    }
                });
                if (role === 'WORKER') {
                    await tx.workerProfile.create({
                        data: {
                            userId: newUser.id,
                            firstName,
                            lastName,
                            city: 'Milano',
                            province: 'MI',
                            region: 'Lombardia',
                            profession: 'Sviluppatore Web',
                            skills: 'HTML, CSS, JavaScript, React',
                            availabilityStatus: 'DISPONIBILE_SUBITO',
                            desiredContract: 'TEMPO_INDETERMINATO'
                        }
                    });
                }
                else if (role === 'COMPANY') {
                    await tx.companyProfile.create({
                        data: {
                            userId: newUser.id,
                            companyName: name || 'Nuova Azienda Social',
                            industry: 'Tecnologia',
                            city: 'Milano',
                            contactPerson: name || 'Referente'
                        }
                    });
                }
                return tx.user.findUnique({
                    where: { id: newUser.id },
                    include: {
                        workerProfile: true,
                        companyProfile: true
                    }
                });
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.role === 'WORKER' ? user.workerProfile : user.companyProfile
            }
        });
    }
    catch (error) {
        console.error('Social login error:', error);
        res.status(500).json({ error: 'Internal server error during social login simulation' });
    }
};
exports.socialLoginSimulation = socialLoginSimulation;
