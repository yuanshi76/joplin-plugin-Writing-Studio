This API is available when the clipper server is running. It provides access to the notes, notebooks, tags and other Joplin object via a REST API. Plugins can also access this API even when the clipper server is not running.  
当剪贴板服务器运行时，此 API 可用。它通过 REST API 提供对笔记、笔记本、标签和其他 Joplin 对象的访问。即使剪贴板服务器未运行，插件也可以访问此 API。

In order to use it, you'll first need to find on which port the service is running. To do so, open the Web Clipper Options in Joplin and if the service is running it should tell you on which port. Normally it runs on port **41184**. If you want to find it programmatically, you may follow this kind of algorithm:  
要使用它，您首先需要找到服务正在运行的端口。为此，请在 Joplin 中打开 Web Clipper 选项，如果服务正在运行，它会告诉您使用的端口。通常情况下，它在端口 41184 上运行。如果您想以编程方式查找它，可以遵循这样的算法：

```
let port = null;
for (let portToTest = 41184; portToTest <= 41194; portToTest++) {
    const result = pingPort(portToTest); // Call GET /ping
    if (result == 'JoplinClipperServer') {
        port = portToTest; // Found the port
        break;
    }
}
```

To prevent unauthorised applications from accessing the API, the calls must be authenticated. To do so, you must provide a token as a query parameter for each API call. You can get this token from the Joplin desktop application, on the Web Clipper Options screen.  
为了防止未经授权的应用程序访问 API，必须对调用进行身份验证。为此，您必须为每个 API 调用提供一个令牌作为查询参数。您可以从 Joplin 桌面应用程序的 Web 剪辑器选项屏幕中获取此令牌。

This would be an example of valid cURL call using a token:  
这是一个使用令牌的有效 cURL 调用示例：

```
curl http://localhost:41184/notes?token=ABCD123ABCD123ABCD123ABCD123ABCD123
```

In the documentation below, the token will not be specified every time however you will need to include it.  
在下面的文档中，每次都不会指定代币，但您需要包含它。

If needed you may also [request the token programmatically](https://joplinapp.org/help/dev/spec/clipper_auth)  
如需请求，您也可以通过编程方式获取代币

## Using the API  使用 API[​](#using-the-api "Direct link to Using the API")

All the calls, unless noted otherwise, receives and send **JSON data**. For example to create a new note:  
所有调用（除非另有说明）都会接收和发送 JSON 数据。例如，要创建一个新笔记：

```
curl --data '{ "title": "My note", "body": "Some note in **Markdown**"}' http://localhost:41184/notes
```

In the documentation below, the calls may include special parameters such as :id or :note_id. You would replace this with the item ID or note ID.  
在下面的文档中，调用可能包含特殊参数，如 :id 或 :note_id。您需要用项目 ID 或笔记 ID 替换这些参数。

For example, for the endpoint `DELETE /tags/:id/notes/:note_id`, to remove the tag with ID "ABCD1234" from the note with ID "EFGH789", you would run for example:  
例如，对于端点 `DELETE /tags/:id/notes/:note_id` ，要从 ID 为 "EFGH789" 的笔记中删除 ID 为 "ABCD1234" 的标签，您可以运行以下操作：

```
curl -X DELETE http://localhost:41184/tags/ABCD1234/notes/EFGH789
```

The four verbs supported by the API are the following ones:  
API 支持的四个动词如下：

- **GET**: To retrieve items (notes, notebooks, etc.).  
    GET：用于检索项目（笔记、笔记本等）。
- **POST**: To create new items. In general most item properties are optional. If you omit any, a default value will be used.  
    POST：用于创建新条目。通常，大多数条目属性都是可选的。如果您省略任何属性，将使用默认值。
- **PUT**: To update an item. Note in a REST API, traditionally PUT is used to completely replace an item, however in this API it will only replace the properties that are provided. For example if you PUT {"title": "my new title"}, only the "title" property will be changed. The other properties will be left untouched (they won't be cleared nor changed).  
    PUT：用于更新条目。请注意，在 REST API 中，传统上使用 PUT 来完全替换一个条目，但在此 API 中，它只会替换提供的属性。例如，如果您 PUT {"title": "my new title"}，只有"title"属性会被更改。其他属性将保持不变（它们不会被清除或更改）。
- **DELETE**: To delete items.  删除：用于删除项目。

## Filtering data  筛选数据[​](#filtering-data "Direct link to Filtering data")

You can change the fields that will be returned by the API using the `fields=` query parameter, which takes a list of comma separated fields. For example, to get the longitude and latitude of a note, use this:  
你可以使用 `fields=` 查询参数来更改 API 将返回的字段，该参数接受一个逗号分隔的字段列表。例如，要获取笔记的经度和纬度，请使用以下方法：

```
curl http://localhost:41184/notes/ABCD123?fields=longitude,latitude
```

To get the IDs only of all the tags:  
仅获取所有标签的 ID：

```
curl http://localhost:41184/tags?fields=id
```

By default API results will contain the following fields: **id**, **parent_id**, **title**

All API calls that return multiple results will be paginated and will return the following structure:

| Key  密钥 | Always present? | Description  描述 |
| --- | --- | --- |
| `items` | Yes  是 | The array of items you have requested.  <br>你所请求的项目数组。 |
| `has_more` | Yes  是 | If `true`, there are more items after this page. If `false`, it means you have reached the end of the data set.  <br>如果 `true` ，则此页之后还有更多项目。如果 `false` ，则表示你已到达数据集的末尾。 |

You can specify how the results should be sorted using the `order_by` and `order_dir` query parameters, and which page to retrieve using the `page` parameter (starts at and defaults to 1). You can specify the number of items to be returned using the `limit` parameter (the maximum being 100 items).  
您可以使用 `order_by` 和 `order_dir` 查询参数指定结果的排序方式，并使用 `page` 参数指定要检索的页面（从 1 开始，默认为 1）。您可以使用 `limit` 参数指定要返回的项目数量（最多为 100 个项目）。

The following call for example will initiate a request to fetch all the notes, 10 at a time, and sorted by "updated_time" ascending:

```
curl http://localhost:41184/notes?order_by=updated_time&order_dir=ASC&limit=10
```

This will return a result like this

```
{ "items": [ /* 10 notes */ ], "has_more": true }
```

Then you will resume fetching the results using this query:

```
curl http://localhost:41184/notes?order_by=updated_time&order_dir=ASC&limit=10&page=2
```

Eventually you will get some results that do not contain an "has_more" parameter, at which point you will have retrieved all the results

As an example the pseudo-code below could be used to fetch all the notes:

```
async function fetchJson(url) {
    return (await fetch(url)).json();
}

async function fetchAllNotes() {
    let pageNum = 1;
    do {
        const response = await fetchJson((http://localhost:41184/notes?page=' + pageNum++);
        console.info('Printing notes:', response.items);
    } while (response.has_more)
}
```

## Error handling[​](#error-handling "Direct link to Error handling")

In case of an error, an HTTP status code >= 400 will be returned along with a JSON object that provides more info about the error. The JSON object is in the format `{ "error": "description of error" }`.

## About the property types[​](#about-the-property-types "Direct link to About the property types")

- Text is UTF-8.
- All date/time are Unix timestamps in milliseconds.
- Booleans are integer values 0 or 1.

## Testing if the service is available[​](#testing-if-the-service-is-available "Direct link to Testing if the service is available")

Call **GET /ping** to check if the service is available. It should return "JoplinClipperServer" if it works.

## Searching[​](#searching "Direct link to Searching")

Call **GET /search?query=YOUR_QUERY** to search for notes. This end-point supports the `field` parameter which is recommended to use so that you only get the data that you need. The query syntax is as described in the main documentation: https://joplinapp.org/help/apps/search

To retrieve non-notes items, such as notebooks or tags, add a `type` parameter and set it to the required [item type name](#item-type-ids). In that case, full text search will not be used - instead it will be a simple case-insensitive search. You can also use `*` as a wildcard. This is convenient for example to retrieve notebooks or tags by title.

For example, to retrieve the notebook named `recipes`: **GET /search?query=recipes&type=folder**

To retrieve all the tags that start with `project-`: **GET /search?query=project-\*&type=tag**

## Item type IDs[​](#item-type-ids "Direct link to Item type IDs")

Item type IDs might be referred to in certain objects you will retrieve from the API. This is the correspondence between name and ID:

| Name | Value |
| --- | --- |
| note | 1   |
| folder | 2   |
| setting | 3   |
| resource | 4   |
| tag | 5   |
| note_tag | 6   |
| search | 7   |
| alarm | 8   |
| master_key | 9   |
| item_change | 10  |
| note_resource | 11  |
| resource_local_state | 12  |
| revision | 13  |
| migration | 14  |
| smart_filter | 15  |
| command | 16  |

## Notes[​](#notes "Direct link to Notes")

### Properties[​](#properties "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | text |     |
| parent_id | text | ID of the notebook that contains this note. Change this ID to move the note to a different notebook. |
| title | text | The note title. |
| body | text | The note body, in Markdown. May also contain HTML. |
| created_time | int | When the note was created. |
| updated_time | int | When the note was last updated. |
| is_conflict | int | Tells whether the note is a conflict or not. |
| latitude | numeric |     |
| longitude | numeric |     |
| altitude | numeric |     |
| author | text |     |
| source_url | text | The full URL where the note comes from. |
| is_todo | int | Tells whether this note is a todo or not. |
| todo_due | int | When the todo is due. An alarm will be triggered on that date. |
| todo_completed | int | Tells whether todo is completed or not. This is a timestamp in milliseconds. |
| source | text |     |
| source_application | text |     |
| application_data | text |     |
| order | numeric |     |
| user_created_time | int | When the note was created. It may differ from created_time as it can be manually set by the user. |
| user_updated_time | int | When the note was last updated. It may differ from updated_time as it can be manually set by the user. |
| encryption_cipher_text | text |     |
| encryption_applied | int |     |
| markup_language | int |     |
| is_shared | int | Whether the note is published. |
| share_id | text | The ID of the Joplin Server/Cloud share containing the note. Empty if not shared. |
| conflict_original_id | text |     |
| master_key_id | text |     |
| user_data | text |     |
| deleted_time | int |     |
| body_html | text | Note body, in HTML format |
| base_url | text | If `body_html` is provided and contains relative URLs, provide the `base_url` parameter too so that all the URLs can be converted to absolute ones. The base URL is basically where the HTML was fetched from, minus the query (everything after the '?'). For example if the original page was `https://stackoverflow.com/search?q=%5Bjava%5D+test`, the base URL is `https://stackoverflow.com/search`. |
| image_data_url | text | An image to attach to the note, in [Data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |
| crop_rect | text | If an image is provided, you can also specify an optional rectangle that will be used to crop the image. In format `{ x: x, y: y, width: width, height: height }` |

### GET /notes[​](#get-notes "Direct link to GET /notes")

Gets all notes

By default, this call will return the all notes **except** the notes in the trash folder and any conflict note. To include these too, you can specify `include_deleted=1` and `include_conflicts=1` as query parameters.

### GET /notes/:id[​](#get-notesid "Direct link to GET /notes/:id")

Gets note with ID :id

### GET /notes/:id/tags[​](#get-notesidtags "Direct link to GET /notes/:id/tags")

Gets all the tags attached to this note.

### GET /notes/:id/resources[​](#get-notesidresources "Direct link to GET /notes/:id/resources")

Gets all the resources attached to this note.

### POST /notes[​](#post-notes "Direct link to POST /notes")

Creates a new note

You can either specify the note body as Markdown by setting the `body` parameter, or in HTML by setting the `body_html`.

Examples:

- Create a note from some Markdown text

```
curl --data '{ "title": "My note", "body": "Some note in **Markdown**"}' http://127.0.0.1:41184/notes
```

- Create a note from some HTML

```
curl --data '{ "title": "My note", "body_html": "Some note in <b>HTML</b>"}' http://127.0.0.1:41184/notes
```

- Create a note and attach an image to it:

```
curl --data '{ "title": "Image test", "body": "Here is Joplin icon:", "image_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAANZJREFUeNoAyAA3/wFwtO3K6gUB/vz2+Prw9fj/+/r+/wBZKAAExOgF4/MC9ff+MRH6Ui4E+/0Bqc/zutj6AgT+/Pz7+vv7++nu82c4DlMqCvLs8goA/gL8/fz09fb59vXa6vzZ6vjT5fbn6voD/fwC8vX4UiT9Zi//APHyAP8ACgUBAPv5APz7BPj2+DIaC2o3E+3o6ywaC5fT6gD6/QD9/QEVf9kD+/dcLQgJA/7v8vqfwOf18wA1IAIEVycAyt//v9XvAPv7APz8LhoIAPz9Ri4OAgwARgx4W/6fVeEAAAAASUVORK5CYII="}' http://127.0.0.1:41184/notes
```

#### Creating a note with a specific ID[​](#creating-a-note-with-a-specific-id "Direct link to Creating a note with a specific ID")

When a new note is created, it is automatically assigned a new unique ID so **normally you do not need to set the ID**. However, if for some reason you want to set it, you can supply it as the `id` property. It needs to be a **32 characters long string** in hexadecimal. **Make sure it is unique**, for example by generating it using whatever GUID function is available in your programming language.

```
curl --data '{ "id": "00a87474082744c1a8515da6aa5792d2", "title": "My note with custom ID"}' http://127.0.0.1:41184/notes
```

### PUT /notes/:id[​](#put-notesid "Direct link to PUT /notes/:id")

Sets the properties of the note with ID :id

### DELETE /notes/:id[​](#delete-notesid "Direct link to DELETE /notes/:id")

Deletes the note with ID :id

By default, the note will be moved **to the trash**. To permanently delete it, add the query parameter `permanent=1`

## Folders[​](#folders "Direct link to Folders")

This is actually a notebook. Internally notebooks are called "folders".

### Properties[​](#properties-1 "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | text |     |
| title | text | The folder title. |
| created_time | int | When the folder was created. |
| updated_time | int | When the folder was last updated. |
| user_created_time | int | When the folder was created. It may differ from created_time as it can be manually set by the user. |
| user_updated_time | int | When the folder was last updated. It may differ from updated_time as it can be manually set by the user. |
| encryption_cipher_text | text |     |
| encryption_applied | int |     |
| parent_id | text |     |
| is_shared | int |     |
| share_id | text | The ID of the Joplin Server/Cloud share containing the folder. Empty if not shared. |
| master_key_id | text |     |
| icon | text |     |
| user_data | text |     |
| deleted_time | int |     |

### GET /folders[​](#get-folders "Direct link to GET /folders")

Gets all folders

The folders are returned as a tree. The sub-notebooks of a notebook, if any, are under the `children` key.

### GET /folders/:id[​](#get-foldersid "Direct link to GET /folders/:id")

Gets folder with ID :id

### GET /folders/:id/notes[​](#get-foldersidnotes "Direct link to GET /folders/:id/notes")

Gets all the notes inside this folder.

### POST /folders[​](#post-folders "Direct link to POST /folders")

Creates a new folder

### PUT /folders/:id[​](#put-foldersid "Direct link to PUT /folders/:id")

Sets the properties of the folder with ID :id

### DELETE /folders/:id[​](#delete-foldersid "Direct link to DELETE /folders/:id")

Deletes the folder with ID :id

By default, the folder will be moved **to the trash**. To permanently delete it, add the query parameter `permanent=1`

## Resources[​](#resources "Direct link to Resources")

### Properties[​](#properties-2 "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | text |     |
| title | text | The resource title. |
| mime | text |     |
| filename | text |     |
| created_time | int | When the resource was created. |
| updated_time | int | When the resource was last updated. |
| user_created_time | int | When the resource was created. It may differ from created_time as it can be manually set by the user. |
| user_updated_time | int | When the resource was last updated. It may differ from updated_time as it can be manually set by the user. |
| file_extension | text |     |
| encryption_cipher_text | text |     |
| encryption_applied | int |     |
| encryption_blob_encrypted | int |     |
| size | int |     |
| is_shared | int |     |
| share_id | text | The ID of the Joplin Server/Cloud share containing the resource. Empty if not shared. |
| master_key_id | text |     |
| user_data | text |     |
| blob_updated_time | int |     |
| ocr_text | text |     |
| ocr_details | text |     |
| ocr_status | int |     |
| ocr_error | text |     |
| ocr_driver_id | int |     |

### GET /resources[​](#get-resources "Direct link to GET /resources")

Gets all resources

### GET /resources/:id[​](#get-resourcesid "Direct link to GET /resources/:id")

Gets resource with ID :id

### GET /resources/:id/file[​](#get-resourcesidfile "Direct link to GET /resources/:id/file")

Gets the actual file associated with this resource.

### GET /resources/:id/notes[​](#get-resourcesidnotes "Direct link to GET /resources/:id/notes")

Gets the notes (IDs) associated with a resource.

### POST /resources[​](#post-resources "Direct link to POST /resources")

Creates a new resource

Creating a new resource is special because you also need to upload the file. Unlike other API calls, this one must have the "multipart/form-data" Content-Type. The file data must be passed to the "data" form field, and the other properties to the "props" form field. An example of a valid call with cURL would be:

```
curl -F 'data=@/path/to/file.jpg' -F 'props={"title":"my resource title"}' http://localhost:41184/resources
```

To **update** the resource content, you can make a PUT request with the same arguments:

```
curl -X PUT -F 'data=@/path/to/file.jpg' -F 'props={"title":"my modified title"}' http://localhost:41184/resources/8fe1417d7b184324bf6b0122b76c4696
```

The "data" field is required, while the "props" one is not. If not specified, default values will be used.

Or if you only need to update the resource properties (title, etc.), without changing the content, you can make a regular PUT request:

```
curl -X PUT --data '{"title": "My new title"}' http://localhost:41184/resources/8fe1417d7b184324bf6b0122b76c4696
```

**From a plugin** the syntax to create a resource is also a bit special:

```
    await joplin.data.post(
        ["resources"],
        null,
        { title: "test.jpg" }, // Resource metadata
        [
            {
                path: "/path/to/test.jpg", // Actual file
            },
        ]
    );
```

### PUT /resources/:id[​](#put-resourcesid "Direct link to PUT /resources/:id")

Sets the properties of the resource with ID :id

You may also update the file data by specifying a file (See `POST /resources` example).

### DELETE /resources/:id[​](#delete-resourcesid "Direct link to DELETE /resources/:id")

Deletes the resource with ID :id

### Properties[​](#properties-3 "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | text |     |
| title | text | The tag title. |
| created_time | int | When the tag was created. |
| updated_time | int | When the tag was last updated. |
| user_created_time | int | When the tag was created. It may differ from created_time as it can be manually set by the user. |
| user_updated_time | int | When the tag was last updated. It may differ from updated_time as it can be manually set by the user. |
| encryption_cipher_text | text |     |
| encryption_applied | int |     |
| is_shared | int |     |
| parent_id | text |     |
| user_data | text |     |

### GET /tags[​](#get-tags "Direct link to GET /tags")

Gets all tags

### GET /tags/:id[​](#get-tagsid "Direct link to GET /tags/:id")

Gets tag with ID :id

### GET /tags/:id/notes[​](#get-tagsidnotes "Direct link to GET /tags/:id/notes")

Gets all the notes with this tag.

### POST /tags[​](#post-tags "Direct link to POST /tags")

Creates a new tag

### POST /tags/:id/notes[​](#post-tagsidnotes "Direct link to POST /tags/:id/notes")

Post a note to this endpoint to add the tag to the note. The note data must at least contain an ID property (all other properties will be ignored).

### PUT /tags/:id[​](#put-tagsid "Direct link to PUT /tags/:id")

Sets the properties of the tag with ID :id

### DELETE /tags/:id[​](#delete-tagsid "Direct link to DELETE /tags/:id")

Deletes the tag with ID :id

### DELETE /tags/:id/notes/:note_id[​](#delete-tagsidnotesnote_id "Direct link to DELETE /tags/:id/notes/:note_id")

Remove the tag from the note.

## Revisions[​](#revisions "Direct link to Revisions")

### Properties[​](#properties-4 "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | text |     |
| parent_id | text |     |
| item_type | int |     |
| item_id | text |     |
| item_updated_time | int |     |
| title_diff | text |     |
| body_diff | text |     |
| metadata_diff | text |     |
| encryption_cipher_text | text |     |
| encryption_applied | int |     |
| updated_time | int |     |
| created_time | int |     |

### GET /revisions[​](#get-revisions "Direct link to GET /revisions")

Gets all revisions

### GET /revisions/:id[​](#get-revisionsid "Direct link to GET /revisions/:id")

Gets revision with ID :id

### POST /revisions[​](#post-revisions "Direct link to POST /revisions")

Creates a new revision

### PUT /revisions/:id[​](#put-revisionsid "Direct link to PUT /revisions/:id")

Sets the properties of the revision with ID :id

### DELETE /revisions/:id[​](#delete-revisionsid "Direct link to DELETE /revisions/:id")

Deletes the revision with ID :id

## Events[​](#events "Direct link to Events")

This end point can be used to retrieve the latest note changes. Currently only note changes are tracked.

### Properties[​](#properties-5 "Direct link to Properties")

| Name | Type | Description |
| --- | --- | --- |
| id  | int |     |
| item_type | int | The item type (see table above for the list of item types) |
| item_id | text | The item ID |
| type | int | The type of change - either 1 (created), 2 (updated) or 3 (deleted) |
| created_time | int | When the event was generated |
| source | int | Unused |
| before_change_item | text | Unused |

### GET /events[​](#get-events "Direct link to GET /events")

Returns a paginated list of recent events. A `cursor` property should be provided, which tells from what point in time the events should be returned. The API will return a `cursor` property, to tell from where to resume retrieving events, as well as an `has_more` (tells if more changes can be retrieved) and `items` property, which will contain the list of events. Events are kept for up to 90 days.

If no `cursor` property is provided, the API will respond with the latest change ID. That can be used to retrieve future events later on.

The results are paginated so you may need multiple calls to retrieve all the events. Use the `has_more` property to know if more can be retrieved.

### GET /events/:id[​](#get-eventsid "Direct link to GET /events/:id")

Returns the event with the given ID.