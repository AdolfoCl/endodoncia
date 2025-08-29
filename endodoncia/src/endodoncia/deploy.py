import os
from pathlib import Path
from typing import Optional

import boto3
from botocore.exceptions import ClientError

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = PROJECT_ROOT / "dist"


def upload_directory_to_s3(bucket_name: str, prefix: str = "") -> None:
    """Upload the dist directory to the given S3 bucket.

    Args:
        bucket_name: Target S3 bucket name
        prefix: Optional prefix within the bucket (e.g., "site/")
    """
    s3 = boto3.client("s3")

    for path in DIST_DIR.rglob("*"):
        if path.is_dir():
            continue
        rel = path.relative_to(DIST_DIR)
        key = f"{prefix}{rel.as_posix()}" if prefix else rel.as_posix()
        extra_args = {}
        if path.suffix == ".html":
            extra_args["ContentType"] = "text/html; charset=utf-8"
        elif path.suffix == ".css":
            extra_args["ContentType"] = "text/css; charset=utf-8"
        elif path.suffix == ".js":
            extra_args["ContentType"] = "application/javascript; charset=utf-8"
        try:
            s3.upload_file(str(path), bucket_name, key, ExtraArgs=extra_args)
            print(f"Uploaded s3://{bucket_name}/{key}")
        except ClientError as e:
            raise RuntimeError(f"Failed to upload {path} -> {key}: {e}")


def invalidate_cloudfront(distribution_id: Optional[str]) -> None:
    """Create an invalidation for the entire distribution if an ID is provided."""
    if not distribution_id:
        return
    cf = boto3.client("cloudfront")
    try:
        resp = cf.create_invalidation(
            DistributionId=distribution_id,
            InvalidationBatch={
                "Paths": {"Quantity": 1, "Items": ["/*"]},
                "CallerReference": f"endodoncia-{os.urandom(8).hex()}",
            },
        )
        print(f"Invalidation created: {resp['Invalidation']['Id']}")
    except ClientError as e:
        raise RuntimeError(f"Failed to create invalidation: {e}")


def main() -> None:
    bucket = os.environ.get("AWS_S3_BUCKET")
    if not bucket:
        raise SystemExit("AWS_S3_BUCKET environment variable is required")
    prefix = os.environ.get("AWS_S3_PREFIX", "")
    distribution_id = os.environ.get("CLOUDFRONT_DIST_ID")

    if not DIST_DIR.exists():
        raise SystemExit("dist/ not found. Run `uv run build-site` first.")

    upload_directory_to_s3(bucket, prefix)
    invalidate_cloudfront(distribution_id)


if __name__ == "__main__":
    main()
