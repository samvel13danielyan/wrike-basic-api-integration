import axios from "axios";
import 'dotenv/config';
import * as fs from 'fs';

const WRIKE_API_BASE_URL = "https://www.wrike.com/api/v4";

interface OriginalTask {
    id: string;
    title: string;
    responsibleIds: string[];
    status: string;
    parentIds: string[];
    createdDate: string;
    updatedDate: string;
    permalink: string;
}

interface MappedTask {
    id: string;
    name: string;
    assignees: string[];
    status: string;
    collections: string[];
    created_at: string;
    updated_at: string;
    ticket_url: string;
}

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    type: string;
    profiles: string[];
    memberIds: string[];
    myTeam: boolean;
    companyName: string;
    primaryEmail: string;
    jobeRoleId: string;
}

interface Folder {
    id: string;
    title: string;
    project?: Project;
} 

interface Project {
    authorId: string;
    ownerIds: string[];
    status: string;
    customStatusId: string;
    startDate: string;
    endDate: string;
    createdDate: string;
    completedDate: string;
    contractType: string;
}
const main = async () => {
    try {
        const originalTasks = await getTasks();
        const mappedTasks: MappedTask[] = originalTasks.map(task => ({
            id: task.id,
            name: task.title,
            assignees: task.responsibleIds,
            status: task.status,
            collections: task.parentIds,
            created_at: task.createdDate,
            updated_at: task.updatedDate,
            ticket_url: task.permalink,
        }));
        console.log('Mapped Tasks:', mappedTasks);
        writeJsonToFile("tasks.json", mappedTasks);

        const contacts = await getContacts();
        const mappedContacts: Contact[] = contacts.map(contact => ({
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            type: contact.type,
            profiles: contact.profiles,
            memberIds: contact.memberIds,
            myTeam: contact.myTeam,
            companyName: contact.companyName,
            primaryEmail: contact.primaryEmail,
            jobeRoleId: contact.jobeRoleId
        }));
        console.log('Contacts:', mappedContacts);
        writeJsonToFile("contacts.json", mappedContacts);

        const projects = await getProjects();
        const mappedProjects: Project[] = projects.map(project => ({
            authorId: project.authorId,
            ownerIds: project.ownerIds,
            status: project.status,
            customStatusId: project.customStatusId,
            startDate: project.startDate,
            endDate: project.endDate,
            createdDate: project.createdDate,
            completedDate: project.completedDate,
            contractType: project.contractType,
        }));
        console.log('Projects:', mappedProjects);
        writeJsonToFile("projects.json", mappedProjects);
    } catch (error:any) {
        console.error("An error occurred:", error.message);
    }
};

main();

async function fetchFromWrike<T>(endpoint: string): Promise<T> {
    console.log(`\nFetching all ${endpoint}...`);
    try {
        const response = await axios.get(`${WRIKE_API_BASE_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        return response.data.data;
    } catch (error: any) {
        console.error(`Error fetching ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
}

async function getTasks(): Promise<OriginalTask[]> {
    return fetchFromWrike<OriginalTask[]>("tasks?fields=[parentIds,responsibleIds]");
}

async function getContacts(): Promise<Contact[]> {
    return fetchFromWrike<Contact[]>("contacts");
}

async function getProjects(): Promise<Project[]> {
    try {
        const response = await axios.get(`${WRIKE_API_BASE_URL}/folders?project=true`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        const projects = response.data.data
            .map((item: Folder) => item.project);
        console.log("Mapped Projects:", projects);
        return projects;
    } catch (error: any) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        throw error;
    }
}

function writeJsonToFile(filename: string, data: any): void {
    fs.writeFile(filename, JSON.stringify(data, null, 4), { encoding: "utf-8" }, (err) => {
        if (err) {
            console.error(`Error writing file ${filename}:`, err);
        } else {
            console.log(`File ${filename} written successfully.`);
        }
    });
}