const expect = require('chai').expect

const mockBotmatic = require('./support/mock-botmatic')

const BID = 1820
const EID = 97685

describe("js API Client", () => {
  it("should do CRUD operations to Botmatic", async () => {
    // console.log("GO")
    mockBotmatic.setup.contact.create(BID)
    mockBotmatic.setup.contact.update(BID)
    mockBotmatic.setup.contact.delete(BID)

    const token = '<BOTMATIC_INTEGRATION_TOKEN>'
    const jsApiClient = require('../src/index')(token)

    const testContact = {
      firstname: "Machin",
      lastname: "Machin",
      email: "machin@machin.com"
    }

    let result = await jsApiClient.createContact(testContact)

    // console.log(result)

    expect(result).to.be.an('object')
    expect(result.id).to.equal(BID)
    expect(result.success).to.be.true
    expect(result.error).to.be.undefined

    testContact.id = result.id
    testContact.firstname = "Machine"

    result = await jsApiClient.updateContact(testContact)

    expect(result).to.be.an('object')
    expect(result.success).to.be.true
    expect(result.error).to.be.undefined

    result = await jsApiClient.deleteContact(testContact.id)

    expect(result).to.be.an('object')
    expect(result.success).to.be.true
    expect(result.error).to.be.undefined
  })
})