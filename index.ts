import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("pulumi-test", {
  bucket: "zvonimirr-pulumi-s3-test",
  website: {
    indexDocument: "index.html",
  },
});

// Upload index.html to the bucket
new aws.s3.BucketObject("index.html", {
  bucket,
  acl: "public-read",
  contentType: "text/html",
  source: new pulumi.asset.FileAsset("index.html"),
});

// Export the name of the bucket
export const bucketName = bucket.id;
// Export URL
export const bucketUrl = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
