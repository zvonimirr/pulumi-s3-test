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

// Wire up the bucket to a CloudFront distribution
const cdn = new aws.cloudfront.Distribution("pulumi-test", {
  enabled: true,
  origins: [
    {
      originId: bucket.arn,
      domainName: bucket.websiteEndpoint,
      customOriginConfig: {
        originProtocolPolicy: "http-only",
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ["TLSv1.2"],
      },
    },
  ],
  defaultRootObject: "index.html",
  defaultCacheBehavior: {
    targetOriginId: bucket.arn,
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD", "OPTIONS"],
    forwardedValues: {
      cookies: { forward: "none" },
      queryString: false,
    },
    minTtl: 0,
    defaultTtl: 3600,
    maxTtl: 86400,
  },
  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    },
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
});

// Export the name of the bucket
export const bucketName = bucket.id;
// Export URL
export const bucketUrl = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
// Export the CloudFront URL
export const cdnUrl = cdn.domainName;
