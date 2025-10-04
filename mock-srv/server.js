// --- server.js ---
'use strict'

// 1. Create the Fastify instance
const fastify = require('fastify')({ 
    // Recommended to keep logging enabled
    logger: {
        level: 'info' 
    }
});

// 2. Import and register your application logic (from application.js)
const applicationPlugin = require('./app');
fastify.register(applicationPlugin);

// 3. Define the START function to launch the server
const start = async () => {
    try {
        const port = 3000; // Use your desired port
        await fastify.listen({ port });
        
        // This log confirms the server is running and stays open
        console.log(`Server listening at http://localhost:${port}`); 
    } catch (err) {
        // Log the error and exit if startup fails
        fastify.log.error(err);
        process.exit(1);
    }
};

// 4. Call the START function
start();