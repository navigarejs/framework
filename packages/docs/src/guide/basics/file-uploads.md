# File uploads

## FormData conversion

When making visits that include files (even nested files), Navigare will automatically convert the request data into a `FormData` object. This is necessary, since that's what's required to submit a `multipart/form-data` request via XHR.

If you'd like the visit to always use a `FormData` object, you can force this using the `forceFormData` option.

```typescript
router.post(route('users.store'), {
  data,
  forceFormData: true,
})
```

You can learn more about the FormData interface [here](https://developer.mozilla.org/en-US/docs/Web/API/FormData).

## Example

You can find an example in the [example app](https://github.com/navigarejs/framework/tree/main/packages/example/resources/scripts/pages/users/Edit.vue).

## Multipart limitations

Uploading files using a `multipart/form-data` request is not natively supported in some languages for the `PUT` `PATCH` or `DELETE` methods. The workaround here is to simply upload files using `POST` instead.

Some frameworks, such as Laravel and Rails, support form method spoofing, which allows you to upload the files using `POST`, but have the framework handle the request as a `PUT` or `PATCH` request. This is done by including a `_method` attribute in the data of your request.

Navigare will take care of it whenever it finds any files in the form submission.
