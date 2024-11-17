const {
  S3Client,
  PutObjectCommand,
  paginateListObjectsV2,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
} = require("@aws-sdk/client-s3");
const config = require("../../config/config");
const uuidv4 = require("uuid").v4;

class S3Service {
  constructor(bucketName) {
    this.s3Client = new S3Client({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = bucketName;
    this.initialize(bucketName);
  }

  async initialize(bucketName) {
    try {
      this.bucketName = await this.check_bucketName(bucketName);
    } catch (error) {
      console.error("Error initializing S3Service:", error);
      throw error;
    }
  }

  async check_bucketName(bucketName) {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket '${bucketName}' exists.`);
      return bucketName;
    } catch (error) {
      return `No Bucket found , please Create Bucket '${bucketName}'.`;
    }
  }
  async put_object(params) {
    return await this.s3Client.send(new PutObjectCommand(params));
  }

  async get_object(params) {
    const { Body } = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucketName,
        Key: params.fileName,
      })
    );
    return Body;
  }
  async delete_object(params) {
    const { Body } = await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: params.fileName,
      })
    );
    return Body;
  }

  async list_objects(bucketName, prefix = "", maxKeys = 1000) {
    try {
      const paginator = paginateListObjectsV2(
        {
          client: this.s3Client,
          pageSize: maxKeys,
        },
        {
          Bucket: bucketName,
          Prefix: prefix,
        }
      );

      for await (const page of paginator) {
        if (page.Contents) {
          for (const obj of page.Contents) {
            console.log(`Object Key: ${obj.Key}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error listing objects: ${error}`);
      throw error;
    }
  }

  async uploadImage({ originalname, buffer, mimetype }) {
    if (!this.bucketName) {
      return "Please Create bucket First";
    }
    const fileName = `${uuidv4()}${originalname}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: buffer,
      ACL: "public-read",
      ContentType: mimetype,
    };

    try {
      await this.put_object(params);
      console.log(`https://${this.bucketName}.s3.amazonaws.com/${fileName}`);
      return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("Error uploading file: ", error);
      throw error;
    }
  }

  async deleteImages(imageUrls) {
    const deletePromises = imageUrls.map((url) => {
      const fileName = url.split(`${this.bucketName}.s3.amazonaws.com/`)[1];
      if (fileName) {
        return this.delete_object({ fileName });
      }
    });
    try {
      await Promise.all(deletePromises);
      console.log("Images deleted successfully from S3");
    } catch (error) {
      console.error("Error deleting images from S3: ", error);
      throw error;
    }
  }
}

module.exports = new S3Service(config.IMAGE_BUCKET_NAME);
