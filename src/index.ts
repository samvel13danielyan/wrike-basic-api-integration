import axios from "axios";
import 'dotenv/config';
import * as fs from 'fs';

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

const main = async () => {
    try {
        console.log("\nFetching all tasks...");
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
        await fs.promises.writeFile("tasks.json", JSON.stringify(mappedTasks, null, 4), {encoding: "utf-8" });
    } catch (error:any) {
        console.error("An error occurred:", error.message);
    }
};

main();

async function getTasks (): Promise<OriginalTask[]> {
    try {
        const response = await axios.get(`${process.env.WRIKE_API_BASE_URL}/tasks`, {
            headers: {
                Authorization: `Bearer ${process.env.WRIKE_TOKEN}`,
            },
        });
        return response.data.data;
    } catch (error:any) {
        console.error("Error fetching tasks:", error.response.data);
        throw error;
    }
};
