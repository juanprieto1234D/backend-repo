import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskUp API",
      version: "1.0.0",
      description: "Documentación de la API del backend de TaskUp",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/infraestructura/http/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);