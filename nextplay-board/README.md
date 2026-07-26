# NextPlay Board

NextPlay Board is a responsive Kanban-style task management application built with React, Supabase, and dnd-kit.

Users can create tasks, organize them across four workflow stages, and drag tasks between columns. Tasks are stored in Supabase and remain available after refreshing the page. Anonymous authentication and Row Level Security ensure that each guest user can only access their own tasks.

## Live Demo

[Open the live application](https://nextplay-task-board-jq8bk5qqk-sathinis-projects.vercel.app/)

## Features

- Four-column Kanban board
- Create tasks with a title, description, priority, and due date
- Drag-and-drop task movement
- Persistent task storage with Supabase
- Automatic anonymous guest authentication
- Row Level Security for private user data
- Loading and error states
- Responsive layout
- Priority badges and due-date display

## Technology

- React
- Vite
- JavaScript
- Supabase
- dnd-kit
- CSS
- Vercel
- GitHub

## Database

The application uses a Supabase `tasks` table with the following fields:

- `id`
- `title`
- `description`
- `status`
- `priority`
- `due_date`
- `user_id`
- `created_at`

Row Level Security policies ensure that users can only create, view, update, and delete tasks associated with their own user ID.

## Run Locally

Clone the repository:

```bash
git clone https://github.com/sathinisen/nextplay-task-board