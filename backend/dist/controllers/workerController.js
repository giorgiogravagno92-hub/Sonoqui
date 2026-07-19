"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPhoto = exports.uploadCv = exports.respondToInterviewRequest = exports.getInterviewRequests = exports.markNotificationRead = exports.getNotifications = exports.toggleAvailability = exports.updateProfile = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfile = async (req, res) => {
    try {
        const profile = await prisma.workerProfile.findUnique({
            where: { userId: req.user.id },
            include: { workExperiences: true }
        });
        if (!profile) {
            return res.status(404).json({ error: 'Worker profile not found' });
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
        const { firstName, lastName, photoUrl, city, province, region, profession, educationLevel, educationField, skills, certifications, hasLicense, hasCar, availabilityStatus, maxDistanceKm, desiredContract, desiredSalary, cvPdfUrl, videoPresentationUrl, workExperiences, availabilityRegionsProvinces, availabilityContracts, notes, educationTitles, sigla, availabilityRoles } = req.body;
        const skillsStr = typeof skills === 'object' ? JSON.stringify(skills) : skills;
        const regionsStr = typeof availabilityRegionsProvinces === 'object' ? JSON.stringify(availabilityRegionsProvinces) : availabilityRegionsProvinces;
        const contractsStr = typeof availabilityContracts === 'object' ? JSON.stringify(availabilityContracts) : availabilityContracts;
        const educationsStr = typeof educationTitles === 'object' ? JSON.stringify(educationTitles) : educationTitles;
        const rolesStr = typeof availabilityRoles === 'object' ? JSON.stringify(availabilityRoles) : availabilityRoles;
        const profile = await prisma.workerProfile.update({
            where: { userId: req.user.id },
            data: {
                firstName,
                lastName,
                photoUrl,
                city,
                province,
                sigla,
                region,
                profession,
                educationLevel,
                educationField,
                educationTitles: educationsStr || '[]',
                skills: skillsStr,
                certifications,
                hasLicense: Boolean(hasLicense),
                hasCar: Boolean(hasCar),
                availabilityStatus,
                maxDistanceKm: Number(maxDistanceKm),
                desiredContract,
                desiredSalary,
                cvPdfUrl,
                videoPresentationUrl,
                availabilityRegionsProvinces: regionsStr || '[]',
                availabilityContracts: contractsStr || '[]',
                availabilityRoles: rolesStr || '[]',
                notes,
                workExperiences: {
                    deleteMany: {},
                    create: (workExperiences || []).map((exp) => ({
                        companyName: exp.companyName,
                        role: exp.role,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        description: exp.description,
                        city: exp.city,
                        province: exp.province,
                        sigla: exp.sigla
                    }))
                }
            },
            include: {
                workExperiences: true
            }
        });
        res.json(profile);
    }
    catch (error) {
        console.error('Error updating worker profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
    }
};
exports.updateProfile = updateProfile;
const toggleAvailability = async (req, res) => {
    try {
        const { status, profession, city, maxDistanceKm, availabilityDetails, availabilityRegionsProvinces, availabilityContracts, notes, availabilityRoles, desiredSalary } = req.body;
        if (!['DISPONIBILE_PROPOSTE', 'DISPONIBILE_SUBITO', 'VALUTO_OFFERTE', 'NON_DISPONIBILE'].includes(status)) {
            return res.status(400).json({ error: 'Invalid availability status' });
        }
        const regionsStr = typeof availabilityRegionsProvinces === 'object' ? JSON.stringify(availabilityRegionsProvinces) : availabilityRegionsProvinces;
        const contractsStr = typeof availabilityContracts === 'object' ? JSON.stringify(availabilityContracts) : availabilityContracts;
        const rolesStr = typeof availabilityRoles === 'object' ? JSON.stringify(availabilityRoles) : availabilityRoles;
        const profile = await prisma.workerProfile.update({
            where: { userId: req.user.id },
            data: {
                availabilityStatus: status,
                ...(status !== 'NON_DISPONIBILE' ? {
                    profession,
                    city,
                    maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
                    availabilityDetails,
                    availabilityRegionsProvinces: regionsStr || '[]',
                    availabilityContracts: contractsStr || '[]',
                    availabilityRoles: rolesStr || '[]',
                    desiredSalary,
                    availabilityNotes: notes
                } : {})
            },
            include: {
                workExperiences: true
            }
        });
        res.json({
            success: true,
            availabilityStatus: profile.availabilityStatus,
            profile
        });
    }
    catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({ error: 'Error toggling availability status' });
    }
};
exports.toggleAvailability = toggleAvailability;
const getNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Error retrieving notifications' });
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.update({
            where: { id, userId: req.user.id },
            data: { read: true }
        });
        res.json(notification);
    }
    catch (error) {
        res.status(500).json({ error: 'Error updating notification status' });
    }
};
exports.markNotificationRead = markNotificationRead;
const getInterviewRequests = async (req, res) => {
    try {
        const profile = await prisma.workerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) {
            return res.status(404).json({ error: 'Worker profile not found' });
        }
        const requests = await prisma.interviewRequest.findMany({
            where: { workerId: profile.id },
            include: {
                company: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching interview requests' });
    }
};
exports.getInterviewRequests = getInterviewRequests;
const respondToInterviewRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // "ACCEPTED", "DECLINED", "INTERESTED", "MORE_INFO", "NOT_INTERESTED"
        if (!['ACCEPTED', 'DECLINED', 'INTERESTED', 'MORE_INFO', 'NOT_INTERESTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid response status' });
        }
        const profile = await prisma.workerProfile.findUnique({
            where: { userId: req.user.id }
        });
        if (!profile) {
            return res.status(404).json({ error: 'Worker profile not found' });
        }
        const updatedRequest = await prisma.interviewRequest.update({
            where: { id, workerId: profile.id },
            data: { status },
            include: {
                company: true
            }
        });
        // Translate status for the notification message
        let statusText = status;
        if (status === 'INTERESTED')
            statusText = 'Interessato a essere contattato';
        else if (status === 'MORE_INFO')
            statusText = 'Interessato ad ottenere maggiori informazioni';
        else if (status === 'NOT_INTERESTED')
            statusText = 'Non interessato';
        else if (status === 'ACCEPTED')
            statusText = 'Accettato';
        else if (status === 'DECLINED')
            statusText = 'Rifiutato';
        // Notify the company of the worker's decision
        await prisma.notification.create({
            data: {
                userId: updatedRequest.company.userId,
                title: 'Risposta a Proposta Iniziale',
                message: `${profile.firstName} ${profile.lastName} ha risposto alla tua proposta iniziale. Risposta: "${statusText}".`,
                type: 'MESSAGE'
            }
        });
        res.json(updatedRequest);
    }
    catch (error) {
        console.error('Error responding to proposal:', error);
        res.status(500).json({ error: 'Error responding to interview request' });
    }
};
exports.respondToInterviewRequest = respondToInterviewRequest;
const uploadCv = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const { base64Data } = req.body;
        if (!base64Data) {
            return res.status(400).json({ error: 'Nessun file fornito' });
        }
        // Extract the actual base64 content
        const base64Content = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Content, 'base64');
        // Create a unique file name
        const sanitizedFileName = `cv-${req.user.id}-${Date.now()}.pdf`;
        const uploadsPath = path.join(__dirname, '../../uploads');
        // Ensure dir exists
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        const filePath = path.join(uploadsPath, sanitizedFileName);
        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${sanitizedFileName}`;
        // Update database
        await prisma.workerProfile.update({
            where: { userId: req.user.id },
            data: { cvPdfUrl: fileUrl }
        });
        res.json({
            success: true,
            cvPdfUrl: fileUrl
        });
    }
    catch (error) {
        console.error('Error uploading CV PDF:', error);
        res.status(500).json({ error: 'Errore durante il caricamento del file' });
    }
};
exports.uploadCv = uploadCv;
const uploadPhoto = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const { base64Data } = req.body;
        if (!base64Data) {
            return res.status(400).json({ error: 'Nessuna foto fornita' });
        }
        // Extract the actual base64 content
        const base64Content = base64Data.split(';base64,').pop();
        const buffer = Buffer.from(base64Content, 'base64');
        // Create a unique file name
        const sanitizedFileName = `photo-${req.user.id}-${Date.now()}.jpg`;
        const uploadsPath = path.join(__dirname, '../../uploads');
        // Ensure dir exists
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        const filePath = path.join(uploadsPath, sanitizedFileName);
        fs.writeFileSync(filePath, buffer);
        const fileUrl = `/uploads/${sanitizedFileName}`;
        // Update database
        await prisma.workerProfile.update({
            where: { userId: req.user.id },
            data: { photoUrl: fileUrl }
        });
        res.json({
            success: true,
            photoUrl: fileUrl
        });
    }
    catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ error: 'Errore durante il caricamento della foto' });
    }
};
exports.uploadPhoto = uploadPhoto;
