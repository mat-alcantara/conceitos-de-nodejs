const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const checkIfUsernameAlreadyExists = users.find(
    (user) => user.username === username
  );

  if (checkIfUsernameAlreadyExists) {
    return response.status(400).json({ error: "Username already used" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date(Date.now()),
  };

  user.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const taskToUpdate = user.todos.find((todo) => todo.id === id);

  if (!taskToUpdate) {
    return response.status(404).json({ error: "Task not found!" });
  }

  taskToUpdate.title = title;
  taskToUpdate.deadline = deadline;

  return response.json(taskToUpdate);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskToUpdate = user.todos.find((todo) => todo.id === id);

  if (!taskToUpdate) {
    return response.status(404).json({ error: "Task not found!" });
  }

  taskToUpdate.done = true;

  return response.json(taskToUpdate);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const taskToRemove = user.todos.find((todo) => todo.id === id);

  if (!taskToRemove) {
    return response.status(404).json({ error: "Task not found!" });
  }

  user.todos.splice(taskToRemove, 1);

  return response.status(204).send();
});

module.exports = app;
