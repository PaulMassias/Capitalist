const express = require('express');
const fs = require("fs").promises;
const { ApolloServer, gql } = require('apollo-server-express');
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
let world = require("./world");

const server = new ApolloServer({ typeDefs, resolvers, context: async ({ req }) => ({
    //world: world,
    world: await readUserWorld(req.headers["x-user"]),
    user: req.headers["x-user"]
    })
});

const app = express();
app.use(express.static('public'));
server.start().then( res => {
    server.applyMiddleware({app});
    app.listen({port: 4000}, () => console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`));
});

async function readUserWorld(user) {
    console.log(user);
    try {
        const data = await fs.readFile("../userworlds/"+ user + "-world.json");
        return JSON.parse(data);
    }
    catch(error) {
        console.log(error);
        return world;
    }
}
   
