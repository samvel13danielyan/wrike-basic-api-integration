// import axios from "axios";
// import 'dotenv/config';
// import * as fs from 'fs';

// const WRIKE_API_BASE_URL = "https://www.wrike.com/api/v4";

// interface OriginalTask {
//     id: string;
//     title: string;
//     responsibleIds: string[];
//     status: string;
//     parentIds: string[];
//     createdDate: string;
//     updatedDate: string;
//     permalink: string;
// }

// interface MappedTask {
//     id: string;
//     name: string;
//     assignees: string[];
//     status: string;
//     collections: string[];
//     created_at: string;
//     updated_at: string;
//     ticket_url: string;
// }

// const main = async () => {
//     try {
//         console.log("\nFetching all tasks...");
//         const originalTasks = await getTasks();
//         const mappedTasks: MappedTask[] = originalTasks.map(task => ({
//             id: task.id,
//             name: task.title,
//             assignees: task.responsibleIds,
//             status: task.status,
//             collections: task.parentIds,
//             created_at: task.createdDate,
//             updated_at: task.updatedDate,
//             ticket_url: task.permalink,
//         }));

//         console.log('Mapped Tasks:', mappedTasks);
//         await fs.promises.writeFile("tasks.json", JSON.stringify(mappedTasks, null, 4), {encoding: "utf-8" });
//     } catch (error:any) {
//         console.error("An error occurred:", error.message);
//     }
// };

// main();

// async function getTasks (): Promise<OriginalTask[]> {
//     try {
//         const response = await axios.get(`${WRIKE_API_BASE_URL}/tasks`, {
//             headers: {
//                 Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
//             },
//         });
//         return response.data.data;
//     } catch (error:any) {
//         console.error("Error fetching tasks:", error.response.data);
//         throw error;
//     }
// };



import axios from "axios";
import 'dotenv/config';
import * as path from 'path';
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

async function writeFile(filePath: string, data: string, encoding: BufferEncoding = "utf-8"): Promise<void> {
    return new Promise((resolve, reject) => {
        const fullPath = path.resolve(filePath);
        fs.open(fullPath, 'w', (err, fd) => {
            if (err) {
                return reject(`Error opening file: ${err.message}`);
            }
            fs.write(fd, data, 0, encoding, (writeErr) => {
                if (writeErr) {
                    fs.close(fd, () => { });
                    return reject(`Error writing to file: ${writeErr.message}`);
                }
                fs.close(fd, (closeErr) => {
                    if (closeErr) {
                        return reject(`Error closing file: ${closeErr.message}`);
                    }
                    resolve();
                });
            });
        });
    });
}

const main = async () => {
    try {
        console.log("\nFetching all tasks...");
        const originalTasks = await getTasks();
        const detailedTasks = await Promise.all(
            originalTasks.map(async (task) => {
                const detailedTask = await getTaskById(task.id);
                return {
                    ...task,
                    responsibleIds: detailedTask.responsibleIds || [],
                    parentIds: detailedTask.parentIds || [], 
                };
            })
        );
        const mappedTasks: MappedTask[] = detailedTasks.map(task => ({
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
        await writeFile("tasks.json", JSON.stringify(mappedTasks, null, 4), "utf-8");
        console.log("Tasks written to tasks.json successfully.");
    } catch (error: any) {
        console.error("An error occurred:", error.message);
    }
};

main();

async function getTasks(): Promise<OriginalTask[]> {
    try {
        const response = await axios.get(`${WRIKE_API_BASE_URL}/tasks`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        return response.data.data;
    } catch (error: any) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        throw error;
    }
}

async function getTaskById(taskId: string): Promise<OriginalTask> {
    try {
        const response = await axios.get(`${WRIKE_API_BASE_URL}/tasks/${taskId}`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        return response.data.data[0]; 
    } catch (error: any) {
        console.error(`Error fetching task ${taskId}:`, error.response?.data || error.message);
        throw error;
    }
}
