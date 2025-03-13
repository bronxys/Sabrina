const BodyForm = require('form-data');
const { fromBuffer } = require('file-type');
const fetch = require('node-fetch');
const crypto = require('crypto')
const { ImageUploadService } = require('node-upload-images');

class Uploader {
    getRandomFilename(extension) {
        return `${Math.floor(Math.random() * 10000)}.${extension}`;
    }

    async pixhost(imageBuffer) {
        return new Promise((resolve, reject) => {
            const service = new ImageUploadService('pixhost.to');
            service.uploadFromBinary(imageBuffer, this.getRandomFilename("png"))
            .then(({ directLink }) => {
                return resolve(directLink); // Resolve com o link direto da imagem
            }).catch((error) => {
                return reject("Error.");
            });
        });
    }

    async catbox(content) {
        return new Promise(async(resolve, reject) => {
            const { ext, mime } = (await fromBuffer(content)) || {};
            const formData = new BodyForm();
            const randomBytes = crypto.randomBytes(6).toString("hex");
            formData.append("reqtype", "fileupload");
            formData.append('fileToUpload', content, { filename: "tmp" + randomBytes + '.' + ext, contentType: mime });
            const response = await fetch("https://catbox.moe/user/api.php", {
                method: "POST",
                body: formData,
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
                    //...formData.getHeaders(),
                },
            });
                if (!response.ok) {
                    return reject(`Unexpected response ${response.statusText}`);
                }
            const cUrl = await response.text()
            return resolve(cUrl);
        })
    }
}

module.exports = Uploader;