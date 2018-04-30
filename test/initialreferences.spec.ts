import { expect } from "chai"

import * as server from "../src/orb/orb-nodejs"
import * as client from "../src/orb/orb"
import { Stub, Skeleton } from "../src/orb/orb"
import { Server_skel, Client_skel } from "./initialreferences_skel"
import { Server, Client } from "./initialreferences_stub"
import { mockConnection } from "./util"

class Server_impl extends Server_skel {
    constructor(orb: server.ORB) {
        super(orb)
    }
}

class Client_impl extends Server_skel {
    constructor(orb: server.ORB) {
        super(orb)
    }
}

describe("initial references", function() {
    describe("register_initial_reference()", function() {
        xit("will throw an exception on the client orb", function() {
            let clientORB = new client.ORB()
            let server = new Server_impl(clientORB)
            clientORB.register_initial_reference("Server", server)
        })
        it("registering the same id twice will throw an error", function() {
            let serverORB = new server.ORB()
            let serve = new Server_impl(serverORB)
            serverORB.register_initial_reference("Server", serve)
            expect(()=>{
                serverORB.register_initial_reference("Server", serve)
            }).to.throw(Error)
        })
    })
    describe("list_initial_references()", function() {
        it("returns the registered references on the server orb", async function() {
            let serverORB = new server.ORB()
            let serve = new Server_impl(serverORB)
            serverORB.register_initial_reference("Server1", serve)
            serverORB.register_initial_reference("Server2", serve)
            let result = await serverORB.list_initial_references()
            expect(result.length).to.equal(2)
            expect(result[0]).to.equal("Server1")
            expect(result[1]).to.equal("Server2")
        })
        it("returns the registered references on the client orb", async function() {
            let serverORB = new server.ORB()
            let serve = new Server_impl(serverORB)
            serverORB.register_initial_reference("Server1", serve)
            serverORB.register_initial_reference("Server2", serve)
            
            let clientORB = new client.ORB()
            
            mockConnection(serverORB, clientORB)
            
            let result = await clientORB.list_initial_references()
            expect(result.length).to.equal(2)
            expect(result[0]).to.equal("Server1")
            expect(result[1]).to.equal("Server2")
        })
    })
    describe("resolve_initial_references()", function() {
        describe("will throw an error if the reference does not exist", function() {
            xit("on the server", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
            
                mockConnection(serverORB, clientORB)
            
                let result = await serverORB.resolve_initial_references("NoServer")
            })
            it("on the client", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
                clientORB.registerStub("Server", Server)
            
                mockConnection(serverORB, clientORB)

                let error = undefined
                try {
                    let result = await clientORB.resolve_initial_references("NoServer")
                }
                catch(caughtError) {
                    error = caughtError
                }
                expect(error).to.be.an.instanceof(Error)
            })
        })
        describe("will return the object by that reference", function() {
            xit("as the implementation on the server", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
            
                mockConnection(serverORB, clientORB)
            
                let result = await serverORB.resolve_initial_references("Server")
                result instanceof Skeleton
            })
            it("as the stub on the client", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
                clientORB.registerStub("Server", Server)
            
                mockConnection(serverORB, clientORB)
            
                let result = await clientORB.resolve_initial_references("Server")
                expect(result).to.be.an.instanceof(Server)
            })
        })
    })
    describe("the stub's narrow() function", function() {
        it("will throw an error object can not be type casted", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
                clientORB.registerStub("Server", Server)
            
                mockConnection(serverORB, clientORB)
            
                let result = await clientORB.resolve_initial_references("Server")
                expect(()=>{
                    Client.narrow(result)
                }).to.throw(Error)
        })
        it("will return the type casted object", async function() {
                let serverORB = new server.ORB()
                let serve = new Server_impl(serverORB)
                serverORB.register_initial_reference("Server", serve)
            
                let clientORB = new client.ORB()
                clientORB.registerStub("Server", Server)
            
                mockConnection(serverORB, clientORB)
            
                let result = await clientORB.resolve_initial_references("Server")
                let localServer = Server.narrow(result)
                expect(result).to.be.an.instanceof(Server)
        })
    })
})
