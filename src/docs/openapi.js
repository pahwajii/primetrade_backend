const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "PrimeTrade Backend API",
    version: "1.0.0",
    description:
      "Scalable REST API with JWT authentication, role-based access control, and task CRUD.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Health", description: "Service monitoring" },
    { name: "Auth", description: "Authentication and authorization" },
    { name: "Admin", description: "Admin-only users and task visibility" },
    { name: "Tasks", description: "Task CRUD operations" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", example: "65f1210a2ed6a73f8200f111" },
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          role: { type: "string", enum: ["user", "admin"], example: "user" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthRequestRegister: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", example: "StrongPass@123" },
        },
      },
      AuthRequestLogin: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "jane@example.com" },
          password: { type: "string", example: "StrongPass@123" },
        },
      },
      AuthSuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login successful" },
          data: {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              token: {
                type: "string",
                example:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJyb2xlIjoidXNlciJ9.signature",
              },
            },
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          _id: { type: "string", example: "65f1210a2ed6a73f8200f222" },
          title: { type: "string", example: "Finish backend assignment" },
          description: { type: "string", example: "Complete auth, RBAC, and CRUD" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          owner: {
            oneOf: [
              { type: "string", example: "65f1210a2ed6a73f8200f111" },
              {
                type: "object",
                properties: {
                  _id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                },
              },
            ],
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TaskCreateRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Write API docs" },
          description: { type: "string", example: "Document all endpoints in Swagger" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      TaskUpdateRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Write API docs" },
          description: { type: "string", example: "Add endpoint examples" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Health check endpoint",
        responses: {
          200: {
            description: "Service healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Service is healthy" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequestRegister" },
            },
          },
        },
        responses: {
          201: {
            description: "User registered",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AuthRequestLogin" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthSuccessResponse" },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        user: { $ref: "#/components/schemas/User" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/admin": {
      get: {
        tags: ["Auth"],
        summary: "Admin-only authorization check",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Authorized as admin",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Admin access granted" },
                  },
                },
              },
            },
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin only)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User list",
          },
          403: {
            description: "Forbidden",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/admin/users/{userId}/tasks": {
      get: {
        tags: ["Admin"],
        summary: "List tasks by user id (admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tasks for selected user",
          },
          404: {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks (users: own tasks, admins: all tasks)",
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          {
            name: "ownerId",
            in: "query",
            description: "Admin-only filter",
            schema: { type: "string" },
          },
          { name: "sortBy", in: "query", schema: { type: "string" } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
        ],
        responses: {
          200: {
            description: "Task list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        items: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Task" },
                        },
                        pagination: {
                          type: "object",
                          properties: {
                            page: { type: "integer", example: 1 },
                            limit: { type: "integer", example: 10 },
                            total: { type: "integer", example: 25 },
                            totalPages: { type: "integer", example: 3 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskCreateRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Task created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Task created successfully" },
                    data: {
                      type: "object",
                      properties: {
                        task: { $ref: "#/components/schemas/Task" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/tasks/{taskId}": {
      get: {
        tags: ["Tasks"],
        summary: "Get a task by id",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Task details",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        task: { $ref: "#/components/schemas/Task" },
                      },
                    },
                  },
                },
              },
            },
          },
          404: {
            description: "Task not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Update a task",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskUpdateRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Task updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Task updated successfully" },
                    data: {
                      type: "object",
                      properties: {
                        task: { $ref: "#/components/schemas/Task" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "taskId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Task deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Task deleted successfully" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = openApiSpec;
