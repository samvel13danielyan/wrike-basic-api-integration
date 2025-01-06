# WrikeCRUD

A project to fetch tasks from the Wrike API, map them to a custom format, and save them as a JSON file.

## Features
- Fetch tasks from Wrike's API and map them into a custom format.
- Save the mapped tasks as `tasks.json`.
- Environment configuration using `.env` file.
- Task data is saved in JSON format for further use.

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
    Open the .env file and replace the placeholder values with your actual Wrike API token and base URL:
    WRIKE_API_BASE_URL=https://www.wrike.com/api/v4
    WRIKE_TOKEN=your-real-access-token

4. **Start the server**:

    ```bash
    npm start

## Usage
    Fetching Tasks: The app will automatically fetch tasks from Wrike when executed.
    Mapped Tasks: The tasks will be mapped into a custom format and saved to tasks.json.

## Notes
    Ensure that the .env file is configured correctly for the application to work.
    The tasks.json file is automatically generated and is excluded from version control using .gitignore.

## Technologies Used
    TypeScript
    Axios for HTTP requests
    Node.js file system module