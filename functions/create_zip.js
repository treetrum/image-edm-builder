const template = `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<div style="display: none; max-height: 0px; overflow: hidden;">Myrtle | Botany</div>
<body width="100%" bgcolor="#ffffff" style="margin: 0; mso-line-height-rule: exactly;">
<table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 655px; background-color: #ffffff; border: 1px solid #f7f7f7;">
{{images}}
</table>
</body>
</html>`;

exports.handler = async function(event, context, callback) {
    const data = JSON.parse(event.body);
    console.log(data);
    callback(null, {
        statusCode: 200,
        body: template
    });
};
