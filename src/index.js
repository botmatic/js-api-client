/**
 * Client library for the botmatic API
 * *Requires environnement variable: *`BOTMATIC_BASE_URL`
 * @module js-api-client
 * @requires request
 * @implements ExternalAPIConsumer
 * @example
 * const jsApiClient = require('js-api-client')(token)
 *
 * // Contact creation
 * const {success, id} = await jsApiClient.createContact(contact)
 *
 * // Contact update
 * const {success} = await jsApiClient.updateContact(contact)
 *
 * // Contact deletion
 * const {success} = await jsApiClient.deleteContact(contact)
 *
 * // Create a property
 * const {success} = await jsApiClient.createProperty(property)
 *
 * // Create a set of properties
 * const {success} = await jsApiClient.createProperties(properties)
 */

// require('dotenv').config({
//   path: path.join(__dirname, '/../.env')
// })
const debug = require('debug')('botmatic:js-api-client')
const request = require('request')

// A map to easily associate the HTTP Method and its associted return code
const METHODS = Object.freeze({
  get: {verb: "get", returnCode: 200}, // 200 OK, READ
  post: {verb: "post", returnCode: 201}, // 201 Content Created, CREATE
  put: {verb: "put", returnCode: 200}, // 200 OK, UPDATE
  patch: {verb: "patch", returnCode: 200}, // 200 OK, UPDATE
  delete: {verb: "delete", returnCode: 204}, // 2014 No Content, DELETE
})

const BOTMATIC_BASE_URL = process.env.BOTMATIC_BASE_URL || "https://app.botmatic.ai"

// ENDPOINTS
const CONTACTS_ENDPOINT = `${BOTMATIC_BASE_URL}/api/contacts`
const PROPERTIES_ENDPOINT = `${BOTMATIC_BASE_URL}/api/properties`
const CAMPAIGN_ENPOINT = `${BOTMATIC_BASE_URL}/api/campaigns`

/**
 * Parses the body if necessary
 * @private
 * @ignore
 * @param {string|object} body
 * @return {object}
 */
const processResponseBody = body => {
  if (typeof body === 'string') {
    body = JSON.parse(body)
  }

  return body
}

/**
 * Sends a request to botmatic.
 * Returns a Promise resolving to an object with the properties:
 *  - success: boolean - true if success, false if failure
 *  - body: object - if success is true, the response body
 *  - error: object - if success is false, the error
 * @private
 * @ignore
 * @param {{verb: string, returnCode: number}} method
 * @param {string} url
 * @param {string} token
 * @param {object} body
 * @return {Promise<{success: boolean, body: object, error: *}>}
 */
const sendToBotmatic = (method, url, token, body) => {
  const options = {
    uri: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    json: body
  }

  return new Promise(resolve => {
    request[method.verb](options, (err, response) => {
      if (!err) {
        debug('RESPONSE', response.statusCode)
        // debug('BODY', body)

        if (response.statusCode === method.returnCode) {
          const body = processResponseBody(response.body)

          resolve({success: true, body: body})
        }
        else {
          debug('ERROR', response.statusCode)
          resolve({success: false, error: response.statusCode})
        }
      } else {
        debug('ERROR', err)
        resolve({success: false, error: err})
      }
    })
  })
}

const createContact = async (contact, token) => {
  debug("create contact")
  const {success, body, error} = await sendToBotmatic(METHODS.post, `${CONTACTS_ENDPOINT}`, token, {contact})

  if (success && body.id) {
    return {success, id: body.id}
  }
  else {
    return {success: false, error}
  }
}

const createContacts = async (contacts, token) => {
  debug("create contact")
  const {success, body, error} = await sendToBotmatic(METHODS.post, `${CONTACTS_ENDPOINT}`, token, {contacts})

  if (success) {
    return {success, contacts: body.contacts}
  }
  else {
    return {success: false, error}
  }
}

const updateContact = async (contact, token) => {
  debug("update contact")
  const {success, error} = await sendToBotmatic(METHODS.patch, `${CONTACTS_ENDPOINT}/${contact.id}`, token, {contact_id: contact.id, contact})

  if (success) {
    return {success}
  }
  else {
    return {success, error}
  }
}

const updateContacts = async (contacts, token) => {
  debug("update contacts")
  const {success, error} = await sendToBotmatic(METHODS.patch, `${CONTACTS_ENDPOINT}`, token, contacts)

  if (success) {
    return {success}
  }
  else {
    return {success, error}
  }
}

const deleteContact = async (id, token) => {
  debug("delete contact")
  const {success, error} = await sendToBotmatic(METHODS.delete, `${CONTACTS_ENDPOINT}/${id}`, token)

  if (success) {
    return {success}
  }
  else {
    return {success, error}
  }
}

const createProperty = async (property, token) => {
  const {success, body, error} = await sendToBotmatic(METHODS.post, `${PROPERTIES_ENDPOINT}`, token, {properties: [property]})

  if (success && body) {
    return {success, id: body.id}
  }
  else {
    return {success: false, error}
  }
}

const createProperties = async (properties, token) => {
  const {success, error} = await sendToBotmatic(METHODS.post, `${PROPERTIES_ENDPOINT}`, token, {properties})

  if (success) {
    return {success}
  }
  else {
    return {success, error}
  }
}

const sendEventOnCampaign = async (event_name, contact_ids, token) => {
  const {success, error} = await sendToBotmatic(METHODS.post, `${CAMPAIGN_ENPOINT}/execute-event`, token, {event_name, contacts: contact_ids})

  if (success) {
    return {success}
  }
  else {
    return {success, error}
  }
}

const init = () => {
  debug("js api client init")
  return {
    /**
     * Creates a contact on Botmatic
     * @member createContact
     * @function
     * @param {object} contact  The contact to create
     * @return {Promise<{success: boolean, id: number, error: object}>}
     */
    createContact,
    /**
     * Creates many contacts on Botmatic
     * @member createContacts
     * @function
     * @param {array} contacts The list of contact to create
     * @return {Promise<{success: boolean}>}
     */
    createContacts,
    /**
     * Updates a contact on Botmatic
     * @member updateContact
     * @function
     * @param {object} contact
     * @return {Promise<{success: boolean, error: object}>}
     */
    updateContact,
    /**
     * Updates many contacts on Botmatic
     * @member updateContacts
     * @function
     * @param {array} contacts
     * @return {Promise<{success: boolean, error: object}>}
     */
    updateContacts,
    /**
     * Deletes a contact on Botmatic
     * @member deleteContact
     * @function
     * @param {string} id
     * @return {Promise<{success: boolean, error: object}>}
     */
    deleteContact,
    /**
     * Creates a property on Botmatic
     * @member createProperty
     * @function
     * @param {object} property
     * @return {Promise<{success: boolean, error: object}>}
     */
    createProperty,
    /**
     * Creates many properties on Botmatic
     * @member createProperties
     * @function
     * @param {array} properties
     * @return {Promise<{success: boolean, error: object}>}
     */
    createProperties,
    sendEventOnCampaign,
    // Not implemented functions
    getContact: () => ({success: false, error: "Not implemented"}),
    getContactByEmail: () => ({success: false, error: "Not implemented"}),
    listContacts: () => ({success: false, error: "Not implemented"}),
    listAllContacts: () => ({success: false, error: "Not implemented"}),
  }
}

module.exports = init
