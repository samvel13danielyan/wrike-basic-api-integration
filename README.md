# WrikeCRUD

A project to fetch tasks, contacts and projects from the Wrike API, map them to a custom format, and save them as a JSON file.

## Features
- Environment configuration using `.env` file.
- Data is saved in JSON format for further use.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/samvel13danielyan/wrike-basic-api-integration.git
   cd src

2. **Install the dependencies**:

    ```bash
    npm install

3. **Configure the environment variables**:

    Copy the env.example file to .env:
    Open the .env file and replace the placeholder values with your actual Wrike API token:
    WRIKE_TOKEN=your-real-access-token

4. **Start the server**:

    ```bash
    npm start

## Technologies Used
    TypeScript
    Axios for HTTP requests
    Node.js file system module