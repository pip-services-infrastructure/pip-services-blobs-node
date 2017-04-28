# HTTP REST Protocol (version 1) <br/> Blobs Microservice

Blobs microservice implements a REST compatible API, that can be accessed on configured port.
All input and output data is serialized in JSON format. Errors are returned in [standard format]().

* [Blob class](#class1)
* [BlobPage class](#class2)
* [GET /blobs](#operation1)
* [GET /blobs/:blob_id](#operation2)
* [POST /blobs](#operation3)
* [PUT /blobs/:blob_id](#operation4)
* [DELETE /blobs/:blob_id](#operation5)
* [DELETE /blobs](#operation6)
* [GET /blobs/:blob_id/content](#operation7)
* [GET /blobs/supports_url](#operation8)
* [GET /blobs/:blob_id/url](#operation9)
* [POST /blobs/add_refs](#operation10)
* [POST /blobs/update_refs](#operation11)
* [POST /blobs/remove_refs](#operation12)

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
- refs: Reference[] - array of references from other entities to the blob
  - id: string - unique reference id
  - type: string - reference type
  - name: string - (optional) descriptive reference name 
- custom_hdr: Object - custom data summary that is always returned (in list and details)
- custom_dat: Object - custom data details that is returned only when a single object is returned (details)

### <a name="class2"></a> BlobPage class

Represents a paged result with subset of requested Blob objects

**Properties:**
- data: Blob[] - array of retrieved Blob page
- count: int - total number of objects in retrieved resultset

## Operations

### <a name="operation1"></a> Method: 'GET', route '/blobs'

Retrieves a list of stored binary blobs by specified criteria

**Parameters:** 
- ids: string - (optional) a comma-separated list with unique blob ids
- party_id: string (optional) unique party id who owns blobs
- refs_empty: boolean (optional) **true** for blobs with no references
- ref_id: string - (optional) unique reference id
- skip: int - (optional) start of page (default: 0). Operation returns paged result
- take: int - (optional) page length (max: 100). Operation returns paged result

**Response body:**
BlobPage object or error

### <a name="operation2"></a> Method: 'GET', route '/blobs/:blob_id'

Retrieves information about stored blob by its unique id.

**Parameters:** 
- blob_id: string - unique blob id

**Response body:**
Retrieved Blob object or error

### <a name="operation3"></a> Method: 'POST', route '/blobs'

Creates binary blob and uploads its content directly or from provided url.
The operation uses 'content_length' and 'content_type' headers to fill correspondent blob properties.

**Parameters:** 
- category: string - (optional) blob category (default: 'general')
- name: string - blob name
- party_id: string - (optional) unique party id who is the owner of the blob
- creator_id: string - (optional) unique user or party id of the blob creator
- url: string - (optional) url to upload the blob content from. If this parameter is not set the content is expected in the request body.

**Response body:**
Serialized blob binary content if **url** parameter is not set. Ignored otherwise.

**Response body:**
Created Blob object or error

### <a name="operation4"></a> Method: 'PUT', route '/blobs/:blob_id'

Changes blob name, owner or category.

**Parameters:** 
- blob_id: string - unique blob id

**Response body:**
Retrieved Blob object or error

### <a name="operation5"></a> Method: 'DELETE', route '/blobs/:blob_id'

Deletes blob specified by its unique id.

**Parameters:** 
- blob_id: string - unique blob id

**Response body:**
Occured error or null for success

### <a name="operation6"></a> Method: 'DELETE', route '/blobs'

Deletes multiple blob specified by their unique ids.

**Parameters:** 
- blob_ids: string - a comma-separated list with unique blob ids

**Response body:**
Occured error or null for success

### <a name="operation7"></a> Method: 'GET', route '/blobs/:blob_id/content'

Downloads blob binary content

**Parameters:** 
- blob_id: string - unique blob id

**Response body:**
Serialized blob binary content or error

### <a name="operation8"></a> Method: 'GET', route '/blobs/supports_url'

Checks if microservice implementation supports retrieval of blob content as url for direct access.
Direct content url is only supported for AWS S3 data access.

**Response body:**
**true** if microservice implementation supported **get_blob_as_url** calls

### <a name="operation9"></a> Method: 'GET', route '/blobs/:blob_id/url'

Retrieves url for direct access to the blob content.
Direct content url is only supported for AWS S3 data access.
Other implementations will return an error.
Use **supports_url** to check if this operation is supported before making a call. 

**Parameters:** 
- blob_id: string - unique blob id

**Response body:**
URL for direct access to the blob content or error

### <a name="operation10"></a> Method: 'POST', route '/blobs/add_refs'

Adds references from entity to specified binary blobs.

**Request body:** 
- blob_ids: string[] - a comma-separated list with unique ids of blobs where references shall be added
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type
  - name: string - (optional) readable reference name

**Response body:**
Occured error or null for success

### <a name="operation11"></a> Method: 'POST', route '/blobs/update_refs'

Updates references from entity to specified binary blobs.
It calculates which blobs were added or removed and performs correspondent operations to make the changes.

**Request body:** 
- old_blob_ids: string[] - a comma-separated list with unique ids of blobs that previously were referenced to entity
- new_blob_ids: string[] - a comma-separated list with unique ids of blob that currently are referenced to entity
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type
  - name: string - (optional) readable reference name

**Response body:**
Occured error or null for success

### <a name="operation12"></a> Method: 'POST', route '/blobs/remove_refs'

Removes references from entity to specified binary blobs.

**Request body:** 
- blob_ids: string[] - a comma-separated list with unique ids of blobs where references shall be added
- ref: Object - item reference
  - id: string - unique reference id
  - type: string - reference type

**Response body:**
Occured error or null for success

