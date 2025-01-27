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
    jobRoleId: string;
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
        await writeJsonToFile("tasks.json", mappedTasks);

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
            jobRoleId: contact.jobRoleId,
        }));
        await writeJsonToFile("users.json", mappedContacts);

        const folders = await getFolders();
        const mappedFolders: Folder[] = folders.map(folder => ({
            id: folder.id,
            title: folder.title,
            project: folder.project,
        }));
        await writeJsonToFile("projects.json", mappedFolders);

        const data = mappedFolders.map((folder) => ({
            id: folder.id,
            name: folder.title,
            tasks: mappedTasks.filter(task => task.collections.includes(folder.id)),
        }));
        await writeJsonToFile("data.json", data);
    } catch (error:any) {
        console.error("An error occurred:", error.message);
    }
};

main();

async function fetchFromWrike<T>(endpoint: string): Promise<T> {
    console.log(`Fetching ${endpoint}...`);
    try {
        const response = await axios.get(`${WRIKE_API_BASE_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching ${endpoint}:`, error.response?.data || error.message);
        } else {
            console.error(`Unexpected error fetching ${endpoint}:`, error);
        }
        throw error;
    }
}

async function getTasks(): Promise<OriginalTask[]> {
    return fetchFromWrike<OriginalTask[]>("tasks?fields=[parentIds,responsibleIds]");
}

async function getContacts(): Promise<Contact[]> {
    return fetchFromWrike<Contact[]>("contacts");
}

async function getFolders(): Promise<Folder[]> {
    return fetchFromWrike<Folder[]>("folders?project=true");
}

function writeJsonToFile(filename: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, JSON.stringify(data, null, 4), "utf-8", (err) => {
            if (err) {
                console.error(`Error writing file ${filename}:`, err);
                reject(err); 
            } else {
                console.log(`File ${filename} written successfully.`);
                resolve(); 
            }
        });
    });
}
