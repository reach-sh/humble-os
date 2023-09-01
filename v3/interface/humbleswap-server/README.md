<header>
  <h1>
    <img src="./logo-white.svg" width="80" height="auto">
    HumbleSwap Server
  </h1> 
</header>


A `Node`-`Typescript`-`Express`-`Prisma`-`Nexus`-`GraphQL` backend for the HumbleSwap DEx.

---

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Configuration](#configuration)
  - [Running locally](#running-locally)
    - [Run the app](#run-the-app)
      - [Dev Testnet (default local environment)](#dev-testnet-default-local-environment)
      - [Public Testnet](#public-testnet)
      - [MainNet](#mainnet)
- [Architecture and Development](#architecture-and-development)
  - [SDL, Objects, DB Schema, and Models](#sdl-objects-db-schema-and-models)
  - [Folder Structure](#folder-structure)
    - [graphql](#graphql)
    - [logger](#logger)
    - [reach](#reach)
    - [server.ts](#serverts)
  - [Updating/expanding the database](#updatingexpanding-the-database)
    - [Migrations - Add or change columns](#migrations---add-or-change-columns)
  - [Troubleshooting](#troubleshooting)

---

## Tech Stack

- **NodeJS** + **Typescript**
- **Apollo-Express Server** (server framework for graphql)
- **NexusJS** (a framework for integrating `GraphQL` and `Prisma`)

Familiarity with all of the above frameworks (or the confidence to approach their documentation) is recommended. 

---

## Getting Started

Some dev scripts require the `dotenv-cli` to be globally installed, so it is best to start here: 
```bash
$. npm install -g dotenv-cli
```

Now you can move on to the good stuff.

### Configuration
You should have `postgresql` locally installed. Start by creating a database for this project: you can call it anything, since the code will access it mainly via environment variables (as you will see below).
1. Create a **postgres database** called `humbleswap_api` (or anything you want)
2. Create a `.env.development` file
3. Log into **Dashlane**, and go to **Secure Notes** for the Engineering team
   1. Find the **Humble Server ENV** note
   2. Copy the relevant section of the note into your `.env` file
4. Ensure the `DATABASE_URL` in the `.env` file looks like this (Prisma uses `.env` instead of `.env.development`):
   ```
   DB_URL="postgresql://postgres:password@localhost:5432/humbleswap_api"
   ```
   1. If your db has a different name, replace `humbleswap_api` with the db's name.
   2. If you created a specific role for the db, replace `postgres:password` with the `username:password` credential combo that owns the database. 
   3. If you didn't create a database user (or didn't enable login on your database user), you can use any value for `password` since it will be ignored. 
5. `npm install` dependencies
6. Run `npm run push-db` to create tables in your database from the **Prisma** schema.
7. Run `npm run start` to start the project.


### Running locally
Once your server is running, you can access `graphiQL` to make queries at `http://localhost:4000/graphql`. This interface is disabled in production.  

The project expects a `PORT` to be defined in your `.env` file. If one is not found, it will default to `4001` -- and absolutely fail to generate any data, since other parts of the `.env` file are critical for functionality.

You can change the default port in your ENV file, though this *may* lead to undesirable behavior.

#### Run the app 
##### Dev Testnet (default local environment)
Make sure you have a `.env.development` file with all the required content
```bash
$. npm run start
```
##### Public Testnet 
Make sure you have a `.env.staging` file with all the required content
```bash
$. npm run start:staging
```
##### MainNet 
Make sure you have a `.env.production` file with all the required content
```bash
$. npm run start:mainnet
```

---

## Architecture and Development

### SDL, Objects, DB Schema, and Models
If you were previously frontend-heavy, or are unfamiliar with the tech stack, here's a high-level overview of different components (and terms) used in this repository
1. `Model`: A data representation; usually refers to a table in a database. 
   * This repo's models are defined in the `schema.prisma` file. 
2.  `Object`: A **code representation of a data `Model`**. 
   * `Objects` are used to fetch and display data from your db `Models`.
3. `Database Schema`: One or more files that define the structure of your database. 
   * This repo uses 
     * **Prisma** to generate database tables, migration files, and table type-definitions
     * **NexusJS** to describe objects, which are exposed via the graphql api 
4. `SDL`: **Schema Definition Language** (GraphQL); a syntax used to describe GraphQL `Objects`. 
   * **NexusJS** is used to generate our SDL and queries. 


---

### Folder Structure
```
 |- src/
     |- graphql/
     |- logger/
     |- reach/
     |- server.ts
```
Important files and directories are highlighted below

#### graphql
Contains all GraphQL-related files, usually grouped by `Model` (e.g. **farms**, **pools**) in all subdirectories: 
- `inputs/`: All Objects used as request arguments
- `mutations/`: All Operations that change the database 
- `queries/`: All Operations that query the database 
- `services/`: shared data-fetching operations
- `schema/`: **NexusJS**-generated files. You will not need to modify these directly, ever. 

Some files in the `graphql/` root are also important:
- `context.ts`: shared **context** object. This object is ingested and accessible in **mutations** and **queries**. It contains database table objects, but can hold anything. 
- `graphql-nexus-types.ts`: Makes all graphql-specific exports inside the `graphql/` directory available to the GraphQL engine. Only modify when (e.g.) a new category like **mutations** or **objects** is added.


#### logger
A `winston` terminal logger instance. I personally enjoy brightly-colored CLI logs.\
(Note: most logs should only appear in development mode)

#### reach
This is the engine that fetches and stores data. It resurrects the original `JSON-Writer` module but stores its results to a database. 

---

#### server.ts

Application entry-point. Run this module to start the server.

---

### Updating/expanding the database
When adding more (or modify existing) tables, **NexusJS** and Prisma help to modify or even generate your tables using your code. 

#### Migrations - Add or change columns
1. Update the `schema.prisma` file: change the model as needed (i.e. add or remove columns to reflect the final expected state)
2. Run the following script to sync your local database with the updated schema.
  ```bash
  # This will generate some sql migration scripts: 
  # make sure to commit them along with your PR!
  
  $. npm run dev:prisma-migrate
  ```
3. Start the server (if it isn't running already)
4. Update the corresponding `HS` object with the new or removed fields (in `src/graphql/objects/`). 
   * For example, if you modified `Pool` in `schema.prisma`, modify `src/graphql/objects/HSPool.ts`

> Remember to commit all generated files with your PR: check for all of the following in your staged changes: 
> 1. `schema.prisma`
> 2. One or more `migration.sql` files 
> 3. One or more `HS*.ts` files (one for each changed db model)
> 4. `nexus-typegen.ts` 
> 5. `schema.graphql` (same reason as [4]; also auto-generated by **NexusJS**)
>
> 4 and 5 are important, otherwise your changes will not be exposed to code. Both will be auto-generated by **NexusJS** as long as the server application is running when you change the files.


---

### Troubleshooting

1. When running `npn run push-db` you get a `dotenv: not found` error:
  - Node is not accessing your `dotenv` package. Try installing dotenv-cli globally: 
  ```bash
  $. npm install -g dotenv-cli
  ```

2. When running `npm run push-db` postgres can't connect to the db:
  - Check the owner user of the db, if it is not `postgres` you should change it in the db url in the .env file
  - Check that your password is right. You can modify the pg user password with by going in the db `psql humbleswap_api` and running `ALTER ROLE username WITH PASSWORD 'password';`