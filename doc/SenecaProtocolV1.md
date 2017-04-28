# Seneca Protocol (version 1) <br/> Blobs Microservice

Blobs microservice implements a Seneca compatible API. 
Seneca port and protocol can be specified in the microservice [configuration](Configuration.md/#api_seneca). 

```javascript
var seneca = require('seneca')();

seneca.client({
    type: 'tcp', // Microservice seneca protocol
    localhost: 'localhost', // Microservice localhost
    port: 8810, // Microservice seneca port
});
```

The microservice responds on the following requests:

```javascript
seneca.act(
    {
        role: 'blobs',
        version: 1,
        cmd: ...cmd name....
        ... Arguments ...
    },
    function (err, result) {
        ...
    }
);
```

* [Blob class](#class1)
* [BlobPage class](#class2)
* [cmd: 'get_blobs'](#operation1)
* [cmd: 'get_blob_by_id'](#operation2)
* [cmd: 'create_blob_from_stream'](#operation3)
* [cmd: 'create_blob_from_binary'](#operation4)
* [cmd: 'create_blob_from_url'](#operation5)
* [cmd: 'update_blob'](#operation6)
* [cmd: 'delete_blob'](#operation7)
* [cmd: 'delete_blobs'](#operation8)
* [cmd: 'get_blob_as_stream'](#operation9)
* [cmd: 'get_blob_as_binary'](#operation10)
* [cmd: 'is_blob_url_supported'](#operation11)
* [cmd: 'get_blob_as_url'](#operation12)
* [cmd: 'add_blob_refs'](#operation13)
* [cmd: 'update_blob_refs'](#operation14)
* [cmd: 'remove_blob_refs'](#operation15)

## Data types

### <a name="class1"></a> Blob class

Represents a record about stored binary blob in the blobs.

**Properties:**
- id: string - unique blob id
- category: string - blob category (default: 'general') 
- name: string - file name
- length: int - blob length
- content_type: string - MIME type of blob content
- created: Date - (readonly) date and time when blob was created
- creator_id: string - (optional) unique id of user or party who created the blob
- party_id: string - (optional) unique id of the party who owns the blob
- refs: [Reference] - array of references from other entities to the blob
  - ref_id: string - unique reference id
  - ref_type: string - reference type
  - ref_name: string - (optional) descriptive reference name 
- custom_hdr: Object - custom data summary that is always returned (in list and details)
- custom_dat: Object - custom data details that is returned only when a single object is returned (details)

### <a name="class2"></a> BlobPage class

Represents a paged result with subset of requested Blob objects

**Properties:**
- data: [Blob] - array of retrieved Blob page
- count: int - total number of objects in retrieved resultset

## Operations

### <a name="operation1"></a> Cmd: 'get_blobs'

Retrieves a list of stored binary blobs by specified criteria

**Arguments:** 
- filter: object - filter parameters
  - category: string - (optional) blob category
  - ids: string[] - (optional) unique blob ids
  - party_id: string (optional) unique party id who owns blobs
  - refs_empty: boolean (optional) **true** for blobs with no references
  - ref_id: string - (optional) unique reference id
- paging: object - paging parameters
  - skip: int - (optional) start of page (default: 0). Operation returns paged result
  - take: int - (optional) page length (max: 100). Operation returns paged result

**Returns:**
- err: Error - occured error or null for success
- result: BlobPage - retrieved Blob objects in page format

### <a name="operation2"></a> Cmd: 'get_blob_by_id'

Retrieves information about stored blob by its unique id.

**Arguments:** 
- blob_id: string - unique blob id

**Returns:**
- err: Error - occured error or null for success
- result: Blob - retrieved Blob object

### <a name="operation3"></a> Cmd: 'create_blob_from_stream'

Creates binary blob and uploads its content from provided stream.
Since Stream object in Node.js is not serializable, this operation
can only be called when microservice and its Seneca consumer run in the same process.

**Arguments:** 
- blob: Blob - information about the Binary blob
- stream: Stream - Stream with blob content

**Returns:**
- err: Error - occured error or null for success
- result: Blob - created Blob object

### <a name="operation4"></a> Cmd: 'create_blob_from_binary'

Creates binary blob and uploads its content from provided binary buffer.

**Arguments:** 
- blob: Blob - information about the Binary blob
- data: String, Array or Buffer - serialized binary data

**Returns:**
- err: Error - occured error or null for success
- result: Blob - created Blob object

### <a name="operation5"></a> Cmd: 'create_blob_from_url'

Creates binary blob and uploads its content from provided url.
Currently only **http** and **https** protocols are supported.

**Arguments:** 
- blob: Blob - information about the Binary blob
- url: string - URL of the file location

**Returns:**
- err: Error - occured error or null for success
- result: Blob - created Blob object

### <a name="operation6"></a> Cmd: 'update_blob'

Changes blob name, owner or category.

**Arguments:** 
- blob: Blob - updated information about the Binary blob (partial updates are supported)

**Returns:**
- err: Error - occured error or null for success
- result: Blob - updated Blob object

### <a name="operation7"></a> Cmd: 'delete_blob'

Deletes blob specified by its unique id.

**Arguments:** 
- blob_id: string - unique blob id

**Returns:**
- err: Error - occured error or null for success

### <a name="operation8"></a> Cmd: 'delete_blobs'

Deletes multiple blob specified by their unique ids.

**Arguments:** 
- blob_ids: [string] - unique blob ids

**Returns:**
- err: Error - occured error or null for success

### <a name="operation9"></a> Cmd: 'get_blob_as_stream'

Retrieves blob content as stream.
Since Stream object in Node.js is not serializable, this operation
can only be called when microservice and its Seneca consumer run in the same process.

**Arguments:** 
- blob_id: string - unique blob id
- stream: Stream - (optional) stream when blob content shall be written. If stream parameter is not provided, it creates a new Stream object. 

**Returns:**
- err: Error - occured error or null for success
- result: Stream - Stream object with the blob content

### <a name="operation10"></a> Cmd: 'get_blob_as_binary'

Retrieves blob content as binary buffer.

**Arguments:** 
- blob_id: string - unique blob id

**Returns:**
- err: Error - occured error or null for success
- result: Buffer - Buffer object with the blob content

### <a name="operation11"></a> Cmd: 'is_blob_url_supported'

Checks if microservice implementation supports retrieval of blob content as url for direct access.
Direct content url is only supported for AWS S3 data access.

**Arguments:** 
- none

**Returns:**
- err: Error - occured error or null for success
- result: Object - result object since Senecal doesn't allow to pass primitive types as result
  - supported: boolean - **true** if microservice implementation supported **get_blob_as_url** calls.
  
### <a name="operation12"></a> Cmd: 'get_blob_as_url'

Retrieves url for direct access to the blob content.
Direct content url is only supported for AWS S3 data access.
Other implementations will return an error.
Use **is_blob_url_supported** to check if this operation is supported before making a call. 

**Arguments:** 
- blob_id: string - unique blob id

**Returns:**
- err: Error - occured error or null for success
- result: string - URL for direct access to the blob content

### <a name="operation13"></a> Cmd: 'add_blob_refs'

Adds references from entity to specified binary blobs.

**Arguments:** 
- blob_ids: string[] - unique ids of blobs where references shall be added
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type
  - name: string - (optional) readable reference name

**Returns:**
- err: Error - occured error or null for success

### <a name="operation14"></a> Cmd: 'update_blob_refs'

Updates references from entity to specified binary blobs.
It calculates which blobs were added or removed and performs correspondent operations to make the changes.

**Arguments:** 
- old_blob_ids: string[] - unique ids of blobs that previously were referenced to entity
- new_blob_ids: string[] - unique ids of blob that currently are referenced to entity
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type
  - name: string - (optional) readable reference name

**Returns:**
- err: Error - occured error or null for success

### <a name="operation15"></a> Cmd: 'remove_blob_refs'

Removes references from entity to specified binary blobs.

**Arguments:** 
- blob_ids: string[] - unique ids of blobs where references shall be removed
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type

**Returns:**
- err: Error - occured error or null for success

