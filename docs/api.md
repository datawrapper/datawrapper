# Datawrapper JSON API

This API is mainly used by the Datawrapper web front-end, and could be used to develop Datawrapper front-ends for other platforms (Desktop, Mobile).

## Charts

### GET /charts/
Get a list of all charts by the logged user. See **/charts/:id** for sample output of each chart.

### GET /charts/:id
Get the configuration of a specific chart.

Sample result:

```
{ "status":"ok",
  "data":{
    "id":"cTjK8",
    "title":"This is a fancy chart",
    "theme":"default",
    "type":"donut-chart",
    "authorId": 1,
    "showInGallery":true,
    "language":"en",    
    "createdAt":"2012-07-23 14:00:19",
    "lastModifiedAt":"2012-07-25 18:49:56",
    "metadata":{
       "data":{
          "transpose":false,
          "horizontal-header":true,
          "vertical-header":true,
          "source":"clipboard" },
       "visualize":{
          "highlighted-series":["Germany"],
          "show-total":true,
          "selected-row":"60" },
       "describe":{
          "source-name":"",
          "source-url":"",
          "number-format":"n2",
          "number-divisor":0,
          "number-currency":"EUR|\u20ac",
          "number-unit":"Mio. T. SKE" },
       "publish":{
          "embed-width":600,
          "embed-height":400
    }}
}}
```

### PUT /charts/:id
Update the chart info for a specific chart.

Expects the same

### PUT /charts/:id/data
Upload new data for a specific chart. Uses the request body directly.

### POST /charts/:id/data
Upload new data for a specific chart using HTTP file upload.

### POST /charts/
Create a new, empty chart

### GET /gallery/
Returns a list of charts that are allowed to be published in the gallery.

### DELETE /charts/:id
Detele a chart.

### POST /charts/:id/copy
Copies a chart and returns the ID of the new chart.

Sample output:

```
{ "status": "ok", "id": "heUE3" }
```

## Authentification

### POST /auth/login
Logs in a user. Expects:

```
{
	"email": "…",
	"pwhash": "…", // SHA256 hash of the password
	"time": "" // unix timestamp used for hashing the password
}
```

### GET /auth/salt
Request the server salt and timestamp for secure password transmission.

### POST /auth/logout
Logs out the current user. Will remove the session.

## Account

### GET /account

Return account of the currently logged user.

### PUT /account/lang

Update the language.

### POST /account/reset-password

Sends a password reset link to the email address of registered and activated users.

Expects:

```
{
	"email": "foo@bar.com"
}
```

### POST /account/resend-activation

Re-sends the email with the activation link. Requires a valid session.

## Users

### GET /users
Get a list of all registered users. Requires a valid session with admin rights.

### POST /users
Create a new user (sign in).

Expects:

```

```

### PUT /users/:id
Updates the profile information of a specific user.

## Visualizations

### GET /visualizations
Get a list of all available visualizations.