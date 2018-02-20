# JS API Client
A botmatic API Client implementing the External API Consumer interface to communicate with Botmatic Public API.  
It is meant to be used internally by the `js-contact` module, alongside `js-integration`.  

## Installation
```bash
npm install js-api-client --save
```

## Basic Usage
```javascript
const jsApiClient = require('js-api-client')()

// ...

const {success, id, error} = jsApiClient.createContact(contact, token)
```

## Authentication
All functions take a `token` as last argument.
You can obtain such Token following the installation procedure with the `js-integration` module.

## Call returns
All functions return `Promises` resolving to an object with the following properties:

property | type             | description
-------- | ---------------- | -----------
success  | boolean          | `true` if the call is successful, `false` in case of error
error    | string or object | *only* if `success == false` an error description
*        | any              | *only* if `success == true` function specific returned data

## Contacts API
The js-api-client module allows you to create, update or delete contacts.  

##### Contact objects
On Botmatic, you can manage which properties a contact has. Contact objects should have
any of these properties.  
See the properties API below and the `js-mapper` module to learn how to create contacts
you can import into Botmatic

### `createContact(contact, token) -> {success, id, error}`
Sends a request to the Botmatic API to create a contact.
The Botmatic id of the created contact is return in the object the Promise resolves to.

##### Example
```javascript
// using Promises
jsApiClient.createContact(contact, token)
  .then(({success, id, error}) => {
    // id is the Botmatic id for the created contact
  })
  
// using async / await
const {success, id, error} = await jsApiClient.createContact(contact, token)
// id is the Botmatic id for the created contact
```

### `createContacts(contacts, token) -> {success, contacts, error}`
Sends a request to the Botmatic API to create many contacts at once.
The Botmatic ids of the created contacts are returned in the object the Promise resolves to.

#### Retrieving the created ids
The object the Promise resolves to has a `contacts` property containing the ids for each created contact.  
It is an array of `{success, id, error}` objects. It preserves the order of contacts in the array passed as
the `contacts` arguments.

##### Example
```javascript
// using Promises
jsApiClient.createContacts(contacts, token)
  .then(({success, contacts, error}) => {
    // contacts == [{success: true, id: 23}, {success: true, id: 24}, {success: false, id: 25}, ...]
  })
  
// using async / await
const {success, contacts, error} = await jsApiClient.createContact(contact, token)
// contacts == [{success: true, id: 23}, {success: true, id: 24}, {success: false, id: 25}, ...]
```

##### Example
```javascript
const sent_contacts = [
  { "id": 978, "firstname": "Patrick" }, // external id == 978
  { "id": 979, "firstname": "Mickael"}   // external id == 979
]

const {success, contacts, error} = await jsApiClient.createContacts(sent_contacts, token)
// success == true, contacts is an array of {success, id, error} objects
// 

// iterate over the sent contacts to find their botmatic id
const created_contacts = sent_contacts.map((sent_contact, index) => {
  const {success, id, error} = contacts[index]
  
  if (success) {
      const externalId = sent_contact.id
      const botmaticId = id
      
      // You can store the botmatic/external id using a module implementing the KeyStore interface
      keyStore.saveIds(integrationId, botmaticId, externalId)
  }
  else {
    // Handle the error
  }
})
```


### `updateContact(contact, token) -> {success, error}`
Sends a request to the Botmatic API to update a contact.  
The contact `id` property must be present and contain an existing id on Botmatic's side.  

##### Example
```javascript
// using Promises
jsApiClient.updateContact(contact, token)
  .then(({success, error}) => {
    // ...
  })
  
// using async / await
const {success, error} = await jsApiClient.updateContact(contact, token)
```

### `deleteContact(id, token) -> {success, error}`
Sends a request to the Botmatic API to delete a contact.  
The `id` parameter must be an existing id on Botmatic's side.  

##### Example
```javascript
// using Promises
jsApiClient.deleteContact(id, token)
  .then(({success, error}) => {
    // ...
  })
  
// using async / await
const {success, error} = await jsApiClient.deleteContact(id, token)
```


## Properties API
The js-api-client allows you to create one or several properties on your Botmatic workspace.

### The Property object
```json
{
  "name": "firstname",
  "type": "text" // Can be "text", "date", or "number"
}
```

### `createProperty(property, token) -> Promise<{success, error}>`
Creates a property on Botmatic.

##### Example
```javascript
// using Promises
jsApiClient.createProperty({name: "firstname", type:"text"}, TOKEN)
  .then(({success, error}) => {
    // ...
  })

// using async/await
const {success, error} = await jsApiClient.createProperty({name: "firstname", type:"text"}, TOKEN)
```

### `createProperties(properties, token) -> Promise<{success, error}>`
Creates many properties on Botmatic.

##### Example
```javascript
// using Promises
jsApiClient.createProperties(properties, TOKEN)
  .then(({success, error}) => {
    // ...
  })

// using async/await
const {success, error} = await jsApiClient.createProperties(properties, TOKEN)
```
